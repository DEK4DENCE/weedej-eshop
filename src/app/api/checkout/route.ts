import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { checkRateLimit } from "@/lib/rateLimit"
import { hashPassword } from "@/lib/utils/hashPassword"
import { generateToken } from "@/lib/utils/generateToken"
import { sendEmail } from "@/lib/email/send"
import { EmailVerification } from "@/lib/email/templates/EmailVerification"
import { z } from "zod"
export const dynamic = 'force-dynamic'

const checkoutItemSchema = z.object({
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().positive().max(999),
  variant: z.object({ id: z.string().min(1) }).optional(),
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

const billingAddressSchema = z.object({
  fullName: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  ico: z.string().max(20).optional(),
  line1: z.string().min(3).max(200),
  city: z.string().min(1).max(100),
  postalCode: z.string().min(3).max(20),
  country: z.string().length(2),
}).optional()

const checkoutBodySchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(100),
  deliveryType: z.enum(["COURIER", "PICKUP_IN_STORE", "DPD_HOME", "DPD_PICKUP", "ZASILKOVNA_HOME", "ZASILKOVNA_PICKUP"]),
  address: checkoutAddressSchema,
  phone: z.string().max(30).optional(),
  pickupPointId: z.string().max(100).optional(),
  pickupPointName: z.string().max(200).optional(),
  pickupPointAddress: z.string().max(300).optional(),
  billingAddress: billingAddressSchema,
  // Guest fields
  guestEmail: z.string().email().max(200).optional(),
  guestName: z.string().max(100).optional(),
  guestPhone: z.string().max(30).optional(),
  createAccount: z.boolean().optional(),
  password: z.string().min(8).max(100).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const rl = await checkRateLimit(`checkout:${ip}`, 10, 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Příliš mnoho požadavků. Zkuste to znovu za chvíli." },
        { status: 429, headers: rl.retryAfter ? { "Retry-After": String(rl.retryAfter) } : {} }
      )
    }

    const session = await auth()

    const rawBody = await req.json()
    const parsedBody = checkoutBodySchema.safeParse(rawBody)
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid request body", issues: parsedBody.error.flatten() }, { status: 400 })
    }
    const {
      items, deliveryType, address, phone: contactPhone,
      pickupPointId, pickupPointName, pickupPointAddress, billingAddress,
      guestEmail, guestName, guestPhone, createAccount, password,
    } = parsedBody.data

    if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 })

    // Determine userId: authenticated session OR guest (optionally creating account)
    let userId: string | undefined = session?.user?.id

    if (!userId) {
      // Require guest email for unauthenticated orders
      if (!guestEmail) {
        return NextResponse.json({ error: "E-mailová adresa je povinná." }, { status: 400 })
      }

      // Optional: create account from checkout
      if (createAccount && password) {
        const existing = await db.user.findUnique({ where: { email: guestEmail } })
        if (existing) {
          return NextResponse.json(
            { error: "Účet s tímto e-mailem již existuje. Přihlaste se nebo použijte jiný e-mail." },
            { status: 409 }
          )
        }
        const passwordHash = await hashPassword(password)
        const token = generateToken()
        const newUser = await db.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: { name: guestName || guestEmail, email: guestEmail, passwordHash },
          })
          await tx.emailVerificationToken.create({
            data: { token, userId: u.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
          })
          return u
        })
        userId = newUser.id

        const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://weedej.cz").replace(/\/$/, "")
        const verifyUrl = `${appUrl}/verify-email?token=${token}`
        const firstName = (guestName || guestEmail).split(" ")[0] ?? "zákazníku"
        await sendEmail({
          to: guestEmail,
          subject: "Ověřte svůj účet na Weedej",
          react: EmailVerification({ name: firstName, verifyUrl }),
          emailType: "registration",
        }).catch((e) => console.error("[Checkout] Account verification email failed:", e.message))
      }
    }

    // Save phone to user profile if authenticated
    if (userId && contactPhone) {
      await db.user.update({ where: { id: userId }, data: { phone: contactPhone } }).catch((e) => console.error('[Silent error]', e))
    }

    // Atomically validate stock and build verified line items
    const variantIds = items.map((i: any) => i.variantId ?? i.variant?.id).filter(Boolean)

    const { lineItems, shippingCents } = await db.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      })
      const txVariantMap = new Map(variants.map((v) => [v.id, v]))

      for (const item of items) {
        const variantId = item.variantId ?? item.variant?.id
        if (!variantId) continue
        const variant = txVariantMap.get(variantId)
        if (!variant || !variant.product.isActive) {
          throw Object.assign(
            new Error(`${item.productName ?? item.product?.name ?? 'Produkt'} již není k dispozici`),
            { status: 400 }
          )
        }
        if (variant.stock < item.quantity) {
          throw Object.assign(
            new Error(`${variant.product.name} není skladem nebo nemá dostatečný počet kusů`),
            { status: 400 }
          )
        }
      }

      const txLineItems = items.map((item: any) => {
        const variantId = item.variantId ?? item.variant?.id
        const variant = txVariantMap.get(variantId)
        const name = variant?.product.name ?? item.product?.name ?? item.productName ?? "Product"
        const rawImage = variant?.product.imageUrls?.[0] ?? item.product?.imageUrls?.[0] ?? item.imageUrl
        const image = rawImage && rawImage.startsWith('http') ? rawImage : undefined
        const dbPrice = variant?.price ?? 0
        return {
          price_data: {
            currency: "czk",
            product_data: { name, ...(image ? { images: [image] } : {}) },
            unit_amount: Math.round(Number(dbPrice) * 100),
          },
          quantity: item.quantity,
        }
      })

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
    const isHomeDelivery = deliveryType === "COURIER" || deliveryType === "DPD_HOME" || deliveryType === "ZASILKOVNA_HOME"
    let resolvedAddressId: string | null = null
    let resolvedAddr: Awaited<ReturnType<typeof db.address.create>> | null = null

    // Guest shipping address (stored in metadata, not in DB)
    let guestShippingName = ""
    let shippingLine1 = ""
    let shippingCity = ""
    let shippingPostal = ""
    let shippingCountry = "CZ"

    if (isHomeDelivery && address) {
      if (userId && address.existingAddressId) {
        resolvedAddressId = address.existingAddressId
        if (address.phone) {
          await db.user.update({ where: { id: userId }, data: { phone: address.phone } }).catch((e) => console.error('[Silent error]', e))
        }
      } else if (userId && !address.existingAddressId) {
        // Authenticated user: save new address to DB
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
        if (address.phone) {
          await db.user.update({ where: { id: userId }, data: { phone: address.phone } })
        }
      } else {
        // Guest: store address inline in metadata
        guestShippingName = address.fullName ?? guestName ?? ""
        shippingLine1 = address.line1 ?? ""
        shippingCity = address.city ?? ""
        shippingPostal = address.postalCode ?? ""
        shippingCountry = address.country ?? "CZ"
      }
    }

    // Resolve address details for Stripe (authenticated path)
    if (resolvedAddressId) {
      const addr = resolvedAddr ?? await db.address.findUnique({ where: { id: resolvedAddressId } })
      if (addr) {
        shippingLine1 = addr.line1
        shippingCity = addr.city
        shippingPostal = addr.postalCode
        shippingCountry = addr.country
        guestShippingName = addr.fullName
      }
    }

    const customerEmail = session?.user?.email ?? guestEmail ?? undefined
    const customerName = session?.user?.name ?? guestName ?? "Customer"
    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelled`,
      customer_email: customerEmail,
      metadata: {
        userId: userId ?? "",
        guestEmail: userId ? "" : (guestEmail ?? ""),
        guestName: userId ? "" : (guestName ?? ""),
        guestPhone: userId ? "" : (guestPhone ?? contactPhone ?? ""),
        guestShippingName,
        guestShippingLine1: shippingLine1,
        guestShippingCity: shippingCity,
        guestShippingPostal: shippingPostal,
        guestShippingCountry: shippingCountry,
        addressId: resolvedAddressId ?? "",
        deliveryType,
        items: JSON.stringify(items.map((i: any) => ({ v: i.variantId ?? i.variant?.id, q: i.quantity }))),
        shippingAmount: String(shippingCents),
        pickupPointId: pickupPointId ?? "",
        pickupPointName: pickupPointName ?? "",
        pickupPointAddress: pickupPointAddress ?? "",
        billingName: billingAddress?.fullName ?? "",
        billingCompany: billingAddress?.company ?? "",
        billingIco: billingAddress?.ico ?? "",
        billingLine1: billingAddress?.line1 ?? "",
        billingCity: billingAddress?.city ?? "",
        billingPostal: billingAddress?.postalCode ?? "",
        billingCountry: billingAddress?.country ?? "",
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
      ...(isHomeDelivery && shippingLine1
        ? {
            payment_intent_data: {
              shipping: {
                name: guestShippingName || customerName,
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
    if (error?.status === 400) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 })
  }
}
