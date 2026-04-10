import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = (session.user as any).id
    const { items, deliveryType, address } = await req.json()

    if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 })

    // Stock validation — batch fetch all variants in one query
    const variantIds = items.map((i: any) => i.variantId ?? i.variant?.id).filter(Boolean)
    const variants = await db.productVariant.findMany({ where: { id: { in: variantIds } } })
    const variantMap = new Map(variants.map((v) => [v.id, v]))
    for (const item of items) {
      const variantId = item.variantId ?? item.variant?.id
      if (!variantId) continue
      const variant = variantMap.get(variantId)
      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `${item.productName ?? item.product?.name ?? 'Produkt'} není skladem nebo nemá dostatečný počet kusů` },
          { status: 400 }
        )
      }
    }

    // Handle address
    let resolvedAddressId: string | null = null
    if (deliveryType === "COURIER" && address) {
      if (address.existingAddressId) {
        resolvedAddressId = address.existingAddressId
      } else {
        // Create new address and optionally save
        const newAddr = await db.address.create({
          data: {
            userId,
            fullName: address.fullName,
            line1: address.line1,
            line2: address.line2 || null,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: (await db.address.count({ where: { userId } })) === 0,
          },
        })
        resolvedAddressId = newAddr.id
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
      const addr = await db.address.findUnique({ where: { id: resolvedAddressId } })
      if (addr) {
        shippingLine1 = addr.line1
        shippingCity = addr.city
        shippingPostal = addr.postalCode
        shippingCountry = addr.country
      }
    }

    const shippingCents = deliveryType === "PICKUP_IN_STORE" ? 0
      : items.reduce((s: number, i: any) => s + Number(i.price ?? i.variant?.price ?? 0) * i.quantity, 0) >= 1500
      ? 0 : 9900

    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"

    const lineItems = items.map((item: any) => {
      const name = item.product?.name ?? item.productName ?? item.variant?.product?.name ?? "Product"
      const rawImage = item.product?.imageUrls?.[0] ?? item.imageUrl ?? item.variant?.product?.imageUrls?.[0]
      // Stripe requires absolute URLs — skip local/relative paths
      const image = rawImage && rawImage.startsWith('http') ? rawImage : undefined
      const price = item.variant?.price ?? item.price ?? 0
      return {
        price_data: {
          currency: "czk",
          product_data: {
            name,
            ...(image ? { images: [image] } : {}),
          },
          unit_amount: Math.round(Number(price) * 100),
        },
        quantity: item.quantity,
      }
    })

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
    console.error("Checkout error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
