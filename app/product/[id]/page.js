"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Plus, Minus, Truck, Shield, RotateCcw } from "lucide-react";
import {
  CartProvider,
  Ticker,
  Header,
  Footer,
  CartDrawer,
  useCart,
} from "@/components/Storefront";
import { getProductById } from "@/lib/products";

function ProductDetailInner({ product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [colorIdx, setColorIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "3rem 2rem 6rem", maxWidth: 1600, margin: "0 auto" }}
    >
      <button onClick={() => router.back()} className="mono-small link-hover" style={{ color: "var(--ink-2)", marginBottom: "2rem", display: "inline-flex", alignItems: "center", gap: 8 }}>
        ← Back
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "flex-start" }}>
        <div style={{ position: "sticky", top: "7rem" }}>
          <div style={{ position: "relative", aspectRatio: "3/4", background: product.gradient, border: "1px solid var(--line)", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 40%, ${product.accent}20 0%, transparent 60%)`, mixBlendMode: "screen" }} />
            {product.badge && (
              <div className="mono-small" style={{ position: "absolute", top: 20, left: 20, background: product.badge === "ICON" ? "var(--gold)" : "var(--ink)", color: "var(--bg)", padding: "6px 10px", fontSize: 10, fontWeight: 600 }}>
                {product.badge}
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginTop: "0.75rem" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ aspectRatio: "1", background: `linear-gradient(${120 + i * 20}deg, #1a1a1a, #050505)`, border: "1px solid var(--line)", opacity: i === 1 ? 1 : 0.6, cursor: "pointer" }} />
            ))}
          </div>
        </div>

        <div>
          <div className="mono-small" style={{ color: "var(--gold)", marginBottom: 12 }}>◆ {product.brand.toUpperCase()}</div>
          <h1 className="serif" style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
            {product.name}
          </h1>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "2.5rem" }}>
            <div className="serif" style={{ fontSize: 28 }}>${product.price}</div>
            <div className="mono-small" style={{ color: "var(--ink-3)" }}>CAD</div>
          </div>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-2)", marginBottom: "2.5rem", fontWeight: 300 }}>
            {product.description}
          </p>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span className="mono-small" style={{ color: "var(--ink-3)" }}>Colour</span>
              <span className="mono-small" style={{ color: "var(--ink-2)" }}>{product.colorNames?.[colorIdx] || "Black"}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {product.colors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setColorIdx(i)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: c,
                    border: colorIdx === i ? "1px solid var(--gold)" : "1px solid var(--line)",
                    padding: 3,
                    cursor: "pointer",
                    boxShadow: colorIdx === i ? `0 0 0 1px var(--bg), 0 0 0 2px var(--gold)` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span className="mono-small" style={{ color: "var(--ink-3)" }}>Size</span>
              <button className="mono-small link-hover" style={{ color: "var(--ink-2)" }}>Size Guide →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(product.sizes.length, 6)}, 1fr)`, gap: 8 }}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className="mono-small"
                  style={{
                    padding: "1rem",
                    border: size === s ? "1px solid var(--ink)" : "1px solid var(--line)",
                    background: size === s ? "var(--ink)" : "transparent",
                    color: size === s ? "var(--bg)" : "var(--ink-2)",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", alignItems: "stretch" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: "0 1rem", height: "100%" }}>
                <Minus size={14} strokeWidth={1.5} />
              </button>
              <div className="serif" style={{ padding: "0 1rem", minWidth: 40, textAlign: "center" }}>{qty}</div>
              <button onClick={() => setQty(qty + 1)} style={{ padding: "0 1rem", height: "100%" }}>
                <Plus size={14} strokeWidth={1.5} />
              </button>
            </div>
            <button
              onClick={() => addToCart(product, size, qty, product.colorNames?.[colorIdx] || "")}
              className="btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
            >
              Add to Bag — ${product.price * qty}
            </button>
          </div>

          <button className="btn-ghost" style={{ width: "100%", justifyContent: "center", marginBottom: "3rem" }}>
            <Heart size={14} strokeWidth={1.5} /> Save to Wishlist
          </button>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "2rem" }}>
            <div className="mono-small" style={{ color: "var(--ink-3)", marginBottom: "1rem" }}>Details</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {product.details.map((d, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: 14, color: "var(--ink-2)" }}>
                  <span style={{ color: "var(--gold)" }}>—</span> {d}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid var(--line)" }}>
            {[
              { icon: Truck, label: "Free Shipping", sub: "On orders $150+" },
              { icon: Shield, label: "Secure Payment", sub: "Powered by Stripe" },
              { icon: RotateCcw, label: "14-Day Returns", sub: "On unworn items" },
            ].map(({ icon: Icon, label, sub }, i) => (
              <div key={i}>
                <Icon size={16} strokeWidth={1.5} style={{ color: "var(--gold)", marginBottom: 8 }} />
                <div className="mono-small" style={{ marginBottom: 4 }}>{label}</div>
                <div className="mono-small" style={{ color: "var(--ink-3)" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default function ProductPage() {
  const params = useParams();
  const product = getProductById(params.id);

  if (!product) {
    return (
      <CartProvider>
        <Ticker />
        <Header />
        <main style={{ padding: "8rem 2rem", textAlign: "center" }}>
          <h1 className="serif" style={{ fontSize: 48 }}>Product not found</h1>
          <Link href="/shop" className="btn-ghost" style={{ marginTop: "2rem" }}>Back to Shop</Link>
        </main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <Ticker />
      <Header />
      <main>
        <ProductDetailInner product={product} />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
