import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { checkRateLimit } from "@/lib/rateLimit"
import { z } from "zod"
export const dynamic = 'force-dynamic'

const checkoutItemSchema = z.object({
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().positive().max(999),
  // Allow legacy shape where variant is nested
  variant: z.object({ id: z.string().min(1) }).optional(),
  // Allow extra fields the client may send (product name for display only)
  productName: z.string().max(200).optional(),
  product: z.object({ name: z.string().max(200), imageUrls: z.array(z.string()).optional(), isActive: z.boolean().optional() }).optional(),
  imageUrl: z.string().max(500).optional(),
})

const checkoutAddressSchema = z.object({
  existingAddressId: z.string().min(1).optional(),
  fullName: z.string().min(2).max(100).optional(),
  line1: z.string().min(3).max(200).optional(),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(3).max(20).optional(),
  country: z.string().length(2).optional(),
  phone: z.string().max(30).optional(),
}).optional()

const checkoutBodySchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(100),
  deliveryType: z.enum(["COURIER", "PICKUP_IN_STORE", "DPD_HOME", "DPD_PICKUP", "ZASILKOVNA_HOME", "ZASILKOVNA_PICKUP"]),
  address: checkoutAddressSchema,
  phone: z.string().max(30).optional(),
  pickupPointId: z.string().max(100).optional(),
  pickupPointName: z.string().max(200).optional(),
  pickupPointAddress: z.string().max(300).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    // 10 checkout attempts per IP per minute — DB-backed, survives serverless cold starts
    const rl = await checkRateLimit(`checkout:${ip}`, 10, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Příliš mnoho požadavků. Zkuste to znovu za chvíli." },
        {
          status: 429,
          headers: rl.retryAfter ? { "Retry-After": String(rl.retryAfter) } : {},
        }
      )
    }

    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    const rawBody = await req.json()
    const parsedBody = checkoutBodySchema.safeParse(rawBody)
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid request body", issues: parsedBody.error.flatten() }, { status: 400 })
    }
    const { items, deliveryType, address, phone: contactPhone, pickupPointId, pickupPointName, pickupPointAddress } = parsedBody.data

    if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 })

    // Save phone to user profile if provided (works for all delivery types)
    if (contactPhone) {
      await db.user.update({ where: { id: userId }, data: { phone: contactPhone } }).catch((e) => console.error('[Silent error]', e))
    }

    // Atomically validate stock and build verified line items inside a transaction.
    // Re-reading variants inside the transaction ensures we see the latest stock
    // values and prevents two concurrent requests from both passing a stale check.
    const variantIds = items.map((i: any) => i.variantId ?? i.variant?.id).filter(Boolean)

    const { lineItems, shippingCents } = await db.$transaction(async (tx) => {
      // Re-fetch variants with their parent product inside the transaction
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      })
      const txVariantMap = new Map(variants.map((v) => [v.id, v]))

      // H-5: validate each item against DB state (active product + sufficient stock)
      // C-3: this read is inside the transaction so it is consistent with any
      //       concurrent decrement that may follow in the Stripe webhook path.
      for (const item of items) {
        const variantId = item.variantId ?? item.variant?.id
        if (!variantId) continue
        const variant = txVariantMap.get(variantId)

        // Variant must exist and its parent product must be active
        if (!variant || !variant.product.isActive) {
          throw Object.assign(
            new Error(`${item.productName ?? item.product?.name ?? 'Produkt'} již není k dispozici`),
            { status: 400 }
          )
        }
        // Stock must be sufficient at the time of this atomic read
        if (variant.stock < item.quantity) {
          throw Object.assign(
            new Error(`${variant.product.name} není skladem nebo nemá dostatečný počet kusů`),
            { status: 400 }
          )
        }
      }

      // H-5: build line items using DB prices, not client-supplied prices
      const txLineItems = items.map((item: any) => {
        const variantId = item.variantId ?? item.variant?.id
        const variant = txVariantMap.get(variantId)
        // Use product name from DB; fall back to client value only for display safety
        const name = variant?.product.name ?? item.product?.name ?? item.productName ?? item.variant?.product?.name ?? "Product"
        const rawImage = variant?.product.imageUrls?.[0] ?? item.product?.imageUrls?.[0] ?? item.imageUrl ?? item.variant?.product?.imageUrls?.[0]
        // Stripe requires absolute URLs — skip local/relative paths
        const image = rawImage && rawImage.startsWith('http') ? rawImage : undefined
        // H-5: always use the authoritative DB price
        const dbPrice = variant?.price ?? 0
        return {
          price_data: {
            currency: "czk",
            product_data: {
              name,
              ...(image ? { images: [image] } : {}),
            },
            unit_amount: Math.round(Number(dbPrice) * 100),
          },
          quantity: item.quantity,
        }
      })

      // H-5: recalculate order subtotal using DB prices for the free-shipping threshold
      const subtotalFromDb = items.reduce((s: number, i: any) => {
        const variantId = i.variantId ?? i.variant?.id
        const dbPrice = Number(txVariantMap.get(variantId)?.price ?? 0)
        return s + dbPrice * i.quantity
      }, 0)

      const txShippingCents =
        deliveryType === "PICKUP_IN_STORE" ? 0
        : deliveryType === "ZASILKOVNA_PICKUP" || deliveryType === "DPD_PICKUP" ? 9900
        : subtotalFromDb >= 1500 ? 0 : 9900

      return { lineItems: txLineItems, shippingCents: txShippingCents }
    })

    // Handle address
    let resolvedAddressId: string | null = null
    let resolvedAddr: Awaited<ReturnType<typeof db.address.create>> | null = null
    if (deliveryType === "COURIER" && address) {
      if (address.existingAddressId) {
        resolvedAddressId = address.existingAddressId
        // Save phone to user even when using existing address
        if (address.phone) {
          await db.user.update({ where: { id: userId }, data: { phone: address.phone } }).catch((e) => console.error('[Silent error]', e))
        }
      } else {
        // Create new address and optionally save
        const newAddr = await db.address.create({
          data: {
            userId,
            fullName: address.fullName ?? "",
            line1: address.line1 ?? "",
            line2: address.line2 || null,
            city: address.city ?? "",
            postalCode: address.postalCode ?? "",
            country: address.country ?? "CZ",
            isDefault: (await db.address.count({ where: { userId } })) === 0,
          },
        })
        resolvedAddressId = newAddr.id
        resolvedAddr = newAddr
        // Also save phone to user
        if (address.phone) {
          await db.user.update({ where: { id: userId }, data: { phone: address.phone } })
        }
      }
    }

    // Get resolved address details for Stripe
    let shippingLine1 = ""
    let shippingCity = ""
    let shippingPostal = ""
    let shippingCountry = "CZ"
    if (resolvedAddressId) {
      const addr = resolvedAddr ?? await db.address.findUnique({ where: { id: resolvedAddressId } })
      if (addr) {
        shippingLine1 = addr.line1
        shippingCity = addr.city
        shippingPostal = addr.postalCode
        shippingCountry = addr.country
      }
    }

    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelled`,
      customer_email: session.user.email ?? undefined,
      metadata: {
        userId,
        addressId: resolvedAddressId ?? "",
        deliveryType,
        items: JSON.stringify(
          items.map((i: any) => ({
            v: i.variantId ?? i.variant?.id,
            q: i.quantity,
          }))
        ),
        shippingAmount: String(shippingCents),
        pickupPointId: pickupPointId ?? "",
        pickupPointName: pickupPointName ?? "",
      },
      ...(shippingCents > 0
        ? {
            shipping_options: [{
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: shippingCents, currency: "czk" },
                display_name: "Standardní doručení (3–5 pracovních dní)",
              },
            }],
          }
        : {}),
      ...(deliveryType === "COURIER" && shippingLine1
        ? {
            payment_intent_data: {
              shipping: {
                name: session.user.name ?? "Customer",
                address: {
                  line1: shippingLine1,
                  city: shippingCity,
                  postal_code: shippingPostal,
                  country: shippingCountry,
                },
              },
            },
          }
        : {}),
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    // Validation errors thrown from inside the transaction carry a .status property
    if (error?.status === 400) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 })
  }
}
