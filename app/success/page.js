"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { CartProvider, Ticker, Header, Footer, CartDrawer, useCart } from "@/components/Storefront";

function SuccessInner() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <section style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: 80, height: 80, margin: "0 auto 2rem", borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Check size={36} strokeWidth={2} color="var(--bg)" />
        </motion.div>
        <div className="mono-small" style={{ color: "var(--gold)", marginBottom: 12 }}>◆ ORDER CONFIRMED</div>
        <h1 className="serif" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 300, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>
          Thank you for your order.
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: "3rem" }}>
          A confirmation email is on its way. We'll send tracking once your pieces ship from Montréal (usually within 1 business day).
        </p>
        <Link href="/shop" className="btn-primary">
          Continue Shopping <ArrowRight size={14} strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}

export default function SuccessPage() {
  return (
    <CartProvider>
      <Ticker />
      <Header />
      <main>
        <SuccessInner />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
