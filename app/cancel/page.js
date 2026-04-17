"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CartProvider, Ticker, Header, Footer, CartDrawer } from "@/components/Storefront";

export default function CancelPage() {
  return (
    <CartProvider>
      <Ticker />
      <Header />
      <main>
        <section style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 2rem" }}>
          <div style={{ textAlign: "center", maxWidth: 520 }}>
            <div className="mono-small" style={{ color: "var(--ink-3)", marginBottom: 12 }}>◆ ORDER CANCELLED</div>
            <h1 className="serif" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 300, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>
              No worries — your bag is saved.
            </h1>
            <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: "3rem" }}>
              The checkout was cancelled. Your items are still in your bag whenever you're ready.
            </p>
            <Link href="/shop" className="btn-primary">
              Continue Shopping <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
