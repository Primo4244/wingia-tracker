import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRODUCTS } from "@/lib/products";

export async function POST(req) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Build line items — we use Stripe Price IDs if available, otherwise inline price_data
    const lineItems = items.map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      // If Stripe Price ID is properly configured, use it
      if (product.stripePriceId && !product.stripePriceId.includes("REPLACE_ME")) {
        return {
          price: product.stripePriceId,
          quantity: item.qty,
        };
      }

      // Fallback: create the price inline (useful before Stripe setup)
      return {
        price_data: {
          currency: "cad",
          product_data: {
            name: `${product.brand} — ${product.name}`,
            description: `Size: ${item.size}${item.color ? ` | Colour: ${item.color}` : ""}`,
            metadata: {
              product_id: product.id,
              size: item.size || "",
              color: item.color || "",
            },
          },
          unit_amount: Math.round(product.price * 100), // cents
        },
        quantity: item.qty,
      };
    });

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["CA", "US"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "cad" },
            display_name: "Free Shipping (orders $150+ CAD)",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1800, currency: "cad" },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      automatic_tax: { enabled: false }, // turn on once you register for GST/QST
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      locale: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
