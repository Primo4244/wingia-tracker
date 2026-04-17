"use client";

import React, { useState, useEffect, useMemo, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  X,
  Plus,
  Minus,
  ArrowRight,
  ArrowUpRight,
  Check,
  Instagram,
  ChevronDown,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/lib/products";

// ============================================================
// Cart Context (persisted to localStorage)
// ============================================================

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wingia-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem("wingia-cart", JSON.stringify(cart));
      } catch (e) {}
    }
  }, [cart, hydrated]);

  const addToCart = (product, size, qty = 1, colorName = "") => {
    const key = `${product.id}-${size}-${colorName}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { key, productId: product.id, product, size, qty, colorName }];
    });
    setCartOpen(true);
  };

  const updateQty = (key, qty) => {
    if (qty < 1) return removeItem(key);
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  };

  const removeItem = (key) => setCart((prev) => prev.filter((i) => i.key !== key));
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, cartOpen, setCartOpen, addToCart, updateQty, removeItem, clearCart, cartCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ============================================================
// Top Ticker
// ============================================================

export function Ticker() {
  const items = [
    "FREE SHIPPING OVER $150 CAD",
    "✦",
    "NEW ARRIVALS EVERY FRIDAY",
    "✦",
    "SHIPPED FROM MONTRÉAL",
    "✦",
  ];
  return (
    <div style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--line)", overflow: "hidden", padding: "0.65rem 0" }}>
      <div className="ticker-track mono-small" style={{ color: "var(--ink-3)" }}>
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} style={{ whiteSpace: "nowrap", color: t === "✦" ? "var(--gold)" : undefined }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Header
// ============================================================

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled ? "rgba(10, 9, 8, 0.88)" : "var(--bg)",
        backdropFilter: scrolled ? "blur(24px) saturate(1.4)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.4)" : "none",
        borderBottom: "1px solid var(--line)",
        transition: "all 0.4s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "1.25rem 2rem",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <nav style={{ display: "flex", gap: "2.25rem", alignItems: "center" }}>
          <Link href="/shop" className="link-hover mono-small" style={{ color: "var(--ink-2)", textDecoration: "none" }}>Shop</Link>
          <Link href="/shop" className="link-hover mono-small" style={{ color: "var(--ink-2)", textDecoration: "none" }}>New</Link>
          <Link href="/shop" className="link-hover mono-small" style={{ color: "var(--ink-2)", textDecoration: "none" }}>Brands</Link>
          <Link href="/shop" className="link-hover mono-small" style={{ color: "var(--ink-2)", textDecoration: "none" }}>Archive</Link>
        </nav>

        <Link href="/" style={{ textAlign: "center", lineHeight: 1, textDecoration: "none", color: "inherit" }}>
          <div className="serif" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.04em" }}>
            WINGIA<span style={{ color: "var(--gold)" }}>.</span>
          </div>
          <div className="mono-small" style={{ color: "var(--ink-3)", marginTop: 4 }}>EST. MMXXVI — MTL</div>
        </Link>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", justifyContent: "flex-end" }}>
          <Link href="/shop" className="link-hover mono-small" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-2)", textDecoration: "none" }}>
            <Search size={14} strokeWidth={1.5} /> Search
          </Link>
          <button className="mono-small link-hover" style={{ color: "var(--ink-2)" }}>FR</button>
          <button
            onClick={() => setCartOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="mono-small">Bag</span>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  background: "var(--gold)",
                  color: "var(--bg)",
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 999,
                  letterSpacing: 0,
                  minWidth: 18,
                  textAlign: "center",
                }}
              >
                {cartCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// Product Card
// ============================================================

export function ProductCard({ product, index }) {
  const [hovered, setHovered] = useState(false);
  const { addToCart } = useCart();

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative" }}
    >
      <Link href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div
          style={{
            position: "relative",
            aspectRatio: "3/4",
            background: "var(--bg-2)",
            border: "1px solid var(--line)",
            overflow: "hidden",
            marginBottom: "1rem",
            cursor: "pointer",
          }}
        >
          <div
            className="product-image"
            style={{
              position: "absolute",
              inset: 0,
              background: product.gradient,
              transition: "transform 0.8s cubic-bezier(.2,.8,.2,1)",
              backgroundImage: product.images?.[0]?.startsWith("http")
                ? `url(${product.images[0]})`
                : product.gradient,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 50% 50%, ${product.accent}22 0%, transparent 60%)`,
              mixBlendMode: "screen",
            }}
          />

          {product.badge && (
            <div
              className="mono-small"
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                background: product.badge === "ICON" ? "var(--gold)" : "var(--ink)",
                color: "var(--bg)",
                padding: "4px 8px",
                fontSize: 9,
                fontWeight: 600,
              }}
            >
              {product.badge}
            </div>
          )}

          <AnimatePresence>
            {hovered && (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(product, product.sizes[0], 1, product.colorNames?.[0] || "");
                }}
                className="mono-small"
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  right: 12,
                  background: "var(--ink)",
                  color: "var(--bg)",
                  padding: "0.75rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Quick Add <Plus size={12} strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <div className="mono-small" style={{ color: "var(--ink-3)", marginBottom: 4 }}>{product.brand}</div>
            <div className="serif" style={{ fontSize: 17, fontWeight: 400, letterSpacing: "-0.01em", marginBottom: 2 }}>
              {product.name}
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              {product.colors.map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: "1px solid var(--line)" }} />
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="serif" style={{ fontSize: 15 }}>${product.price}</div>
            <ArrowUpRight className="product-arrow" size={16} strokeWidth={1.5} style={{ marginTop: 6, opacity: 0.4, transition: "all 0.3s ease", color: "var(--gold)" }} />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// ============================================================
// Shop Grid
// ============================================================

export function ShopGrid({ showHeader = true }) {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let list = filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [filter, sort]);

  return (
    <section id="shop" style={{ padding: "6rem 2rem", maxWidth: 1600, margin: "0 auto" }}>
      {showHeader && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "2rem", paddingBottom: "2rem", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div className="mono-small" style={{ color: "var(--gold)", marginBottom: 8 }}>◆ THE INDEX — {filtered.length} PIECES</div>
            <h2 className="serif" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1 }}>
              Selected, <em>curated</em>.
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span className="mono-small" style={{ color: "var(--ink-3)" }}>Sort</span>
            <div style={{ position: "relative" }}>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="mono-small"
                style={{
                  background: "transparent",
                  border: "1px solid var(--line)",
                  padding: "0.65rem 2.25rem 0.65rem 1rem",
                  color: "var(--ink)",
                  appearance: "none",
                  cursor: "pointer",
                }}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
              </select>
              <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--ink-3)" }} />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "3rem", flexWrap: "wrap" }}>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`chip ${filter === c ? "active" : ""}`}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "2.5rem 1.5rem" }}>
        {filtered.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

// ============================================================
// Cart Drawer
// ============================================================

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty, removeItem, subtotal } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.productId,
            qty: i.qty,
            size: i.size,
            color: i.colorName,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout error: " + (data.error || "Unknown"));
        setLoading(false);
      }
    } catch (err) {
      alert("Network error: " + err.message);
      setLoading(false);
    }
  };

  const shipping = subtotal > 150 ? 0 : 18;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCartOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, backdropFilter: "blur(4px)" }}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: "min(460px, 100%)",
              background: "var(--bg)",
              zIndex: 201,
              borderLeft: "1px solid var(--line)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="serif" style={{ fontSize: 22, fontStyle: "italic" }}>Your Bag</div>
                <div className="mono-small" style={{ color: "var(--ink-3)", marginTop: 2 }}>
                  {cart.length} item{cart.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button onClick={() => setCartOpen(false)} style={{ width: 36, height: 36, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
                <ShoppingBag size={32} strokeWidth={1} style={{ color: "var(--ink-3)", marginBottom: "1.5rem" }} />
                <div className="serif" style={{ fontSize: 20, marginBottom: 8 }}>Your bag is empty</div>
                <div className="mono-small" style={{ color: "var(--ink-3)", marginBottom: "2rem" }}>Curation starts here.</div>
                <button onClick={() => setCartOpen(false)} className="btn-ghost">Begin the hunt</button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: "auto" }} className="no-scrollbar">
                  {cart.map((item) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--line-2)", display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "1rem", alignItems: "flex-start" }}
                    >
                      <div style={{ aspectRatio: "3/4", background: item.product.gradient, border: "1px solid var(--line)" }} />
                      <div>
                        <div className="mono-small" style={{ color: "var(--ink-3)", marginBottom: 4 }}>{item.product.brand}</div>
                        <div className="serif" style={{ fontSize: 14, lineHeight: 1.3, marginBottom: 6 }}>{item.product.name}</div>
                        <div className="mono-small" style={{ color: "var(--ink-3)", marginBottom: 10 }}>Size {item.size}</div>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", width: "fit-content" }}>
                          <button onClick={() => updateQty(item.key, item.qty - 1)} style={{ padding: "6px 10px" }}>
                            <Minus size={11} strokeWidth={1.5} />
                          </button>
                          <span className="mono-small" style={{ padding: "0 10px" }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.key, item.qty + 1)} style={{ padding: "6px 10px" }}>
                            <Plus size={11} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="serif" style={{ fontSize: 14 }}>${item.product.price * item.qty}</div>
                        <button onClick={() => removeItem(item.key)} className="mono-small link-hover" style={{ color: "var(--ink-3)", marginTop: 12 }}>Remove</button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid var(--line)" }}>
                  <div style={{ marginBottom: "1.25rem" }}>
                    {subtotal < 150 && (
                      <div style={{ marginBottom: "1rem" }}>
                        <div className="mono-small" style={{ color: "var(--gold)", marginBottom: 6 }}>
                          ${(150 - subtotal).toFixed(0)} away from free shipping
                        </div>
                        <div style={{ height: 2, background: "var(--line)", position: "relative", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min((subtotal / 150) * 100, 100)}%`, background: "var(--gold)", transition: "width 0.4s ease" }} />
                        </div>
                      </div>
                    )}

                    {[
                      ["Subtotal", `$${subtotal.toFixed(2)}`],
                      ["Shipping", shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "var(--ink-2)" }}>
                        <span>{k}</span>
                        <span>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 10, borderTop: "1px solid var(--line-2)" }}>
                      <span className="serif" style={{ fontSize: 18 }}>Total</span>
                      <span className="serif" style={{ fontSize: 20 }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={handleCheckout} disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    {loading ? (
                      <>
                        <Loader2 size={14} className="spin" /> Redirecting...
                      </>
                    ) : (
                      <>
                        Secure Checkout <ArrowRight size={14} strokeWidth={2} />
                      </>
                    )}
                  </button>
                  <div className="mono-small" style={{ color: "var(--ink-3)", textAlign: "center", marginTop: "1rem" }}>
                    Powered by Stripe — 256-bit SSL encryption
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
      <style jsx>{`
        .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </AnimatePresence>
  );
}

// ============================================================
// Hero
// ============================================================

export function Hero() {
  const title = "CRAFTED";
  const title2 = "IN SHADOW";

  return (
    <section style={{ position: "relative", minHeight: "92vh", overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 20% 30%, #1a1510 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 85% 70%, #0f0f0f 0%, transparent 55%), var(--bg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          background: "linear-gradient(180deg, transparent 0%, rgba(10,9,8,0.5) 60%, var(--bg) 100%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        style={{
          position: "absolute",
          top: "12%",
          right: "6%",
          width: "28%",
          aspectRatio: "3/4",
          background: "linear-gradient(155deg, #1f1a12 0%, #0a0805 100%)",
          border: "1px solid var(--line)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 30% 40%, rgba(201,168,106,0.15) 0%, transparent 50%)",
          }}
        />
        <div className="mono-small" style={{ position: "absolute", top: 16, left: 16, color: "var(--gold)" }}>FW / 01</div>
        <div className="mono-small" style={{ position: "absolute", bottom: 16, left: 16, right: 16, color: "var(--ink-3)" }}>
          <div style={{ marginBottom: 4 }}>FIGURE IN REPOSE</div>
          <div style={{ color: "var(--ink-2)", fontSize: 9 }}>MONTRÉAL — 2026</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        style={{
          position: "absolute",
          bottom: "14%",
          right: "22%",
          width: "16%",
          aspectRatio: "1",
          background: "linear-gradient(145deg, #2a1f18 0%, #050403 100%)",
          border: "1px solid var(--line)",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1600, margin: "0 auto", padding: "6rem 2rem 4rem", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mono-small" style={{ color: "var(--ink-3)", maxWidth: 200 }}>
            <div style={{ color: "var(--gold)", marginBottom: 8 }}>◆ VOLUME 01</div>
            A curated index of streetwear, archive, and quiet luxury — handpicked in Montréal.
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mono-small" style={{ color: "var(--ink-3)", textAlign: "right" }}>
            <div>45.5017° N</div>
            <div>73.5673° W</div>
            <div style={{ marginTop: 8, color: "var(--ink-2)" }}>LIVE INDEX</div>
          </motion.div>
        </div>

        <div>
          <div style={{ overflow: "hidden" }}>
            <motion.h1 className="serif" style={{ fontSize: "clamp(4rem, 16vw, 18rem)", lineHeight: 0.82, fontWeight: 300, letterSpacing: "-0.055em", fontStyle: "italic" }}>
              {title.split("").map((c, i) => (
                <motion.span
                  key={i}
                  className="hero-title-char"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  {c}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          <div style={{ overflow: "hidden", display: "flex", alignItems: "baseline", gap: "1.5rem", flexWrap: "wrap" }}>
            <motion.h1 className="serif" style={{ fontSize: "clamp(4rem, 16vw, 18rem)", lineHeight: 0.82, fontWeight: 300, letterSpacing: "-0.055em" }}>
              {title2.split("").map((c, i) => (
                <motion.span
                  key={i}
                  className="hero-title-char"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  style={c === " " ? { width: "0.25em", display: "inline-block" } : {}}
                >
                  {c === " " ? "\u00A0" : c}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.4 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "3rem", flexWrap: "wrap", gap: "2rem" }}>
            <div style={{ maxWidth: 480 }}>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-2)", fontWeight: 300 }}>
                Stüssy, Moncler, Longchamp, Polo — assembled with intent. No noise, no excess. The pieces you actually reach for, held to a single standard.
              </p>
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/shop" className="btn-primary">
                Explore Index <ArrowRight size={14} strokeWidth={2} />
              </Link>
              <Link href="/shop" className="btn-ghost">Our Standard</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Manifesto
// ============================================================

export function Manifesto() {
  return (
    <section style={{ padding: "8rem 2rem", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--bg-2)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "-10%", width: "40%", aspectRatio: "1", background: "radial-gradient(circle, rgba(201,168,106,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "5rem", alignItems: "flex-start", position: "relative" }}>
        <div className="mono-small" style={{ color: "var(--gold)" }}>
          ◆ OUR STANDARD
          <br />
          <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>VOL. 01</span>
        </div>
        <div>
          <p className="serif" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.5rem)", lineHeight: 1.25, fontWeight: 300, letterSpacing: "-0.02em", marginBottom: "2rem" }}>
            We don't chase drops. We <em>curate inventory</em>. Every piece is inspected, authenticated, and priced with respect — for the maker, for the craft, for you.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-2)", fontWeight: 300, maxWidth: 560 }}>
            WINGIA is a Montréal-based studio sourcing streetwear, archive, and quiet luxury. We work directly with authorized retailers, trusted resellers, and private collectors — cutting the noise so you can wear the signal.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Footer
// ============================================================

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <footer style={{ background: "var(--bg)", color: "var(--ink)", paddingTop: "6rem" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 2rem 4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "flex-end", paddingBottom: "4rem", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div className="mono-small" style={{ color: "var(--gold)", marginBottom: 16 }}>◆ JOIN THE INDEX</div>
            <h3 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Drops, first. <em>Always.</em>
            </h3>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              setEmail("");
              setTimeout(() => setSent(false), 3000);
            }}
          >
            <div style={{ display: "flex", borderBottom: "1px solid var(--ink)", paddingBottom: "1rem" }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="your.email@domain.com" style={{ flex: 1, fontSize: 16 }} />
              <button type="submit" className="mono-small" style={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                {sent ? (
                  <>
                    <Check size={12} style={{ marginRight: 6 }} /> SUBSCRIBED
                  </>
                ) : (
                  <>
                    SUBSCRIBE <ArrowRight size={14} strokeWidth={2} style={{ marginLeft: 8 }} />
                  </>
                )}
              </button>
            </div>
            <div className="mono-small" style={{ color: "var(--ink-3)", marginTop: 12 }}>No spam. Just inventory and thoughts.</div>
          </form>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", padding: "4rem 0" }}>
          <div>
            <div className="serif" style={{ fontSize: 34, fontWeight: 400, letterSpacing: "-0.04em", marginBottom: "0.5rem" }}>
              WINGIA<span style={{ color: "var(--gold)" }}>.</span>
            </div>
            <div className="mono-small" style={{ color: "var(--ink-3)", marginBottom: "1.5rem" }}>EST. MMXXVI — MTL / QC</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink-2)", maxWidth: 320, fontWeight: 300 }}>
              Curated streetwear and archive menswear. Sourced in Montréal, shipped worldwide.
            </p>
          </div>
          {[
            { title: "Shop", links: ["New Arrivals", "Outerwear", "Knitwear", "Bags", "Accessories"] },
            { title: "Support", links: ["Contact", "Shipping", "Returns", "Size Guide", "FAQ"] },
            { title: "Studio", links: ["Our Story", "Journal", "Press", "Instagram"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="mono-small" style={{ color: "var(--ink-3)", marginBottom: "1.25rem" }}>{col.title}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="link-hover" style={{ fontSize: 13, color: "var(--ink-2)", textDecoration: "none" }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div className="mono-small" style={{ color: "var(--ink-3)" }}>© 2026 WINGIA STUDIO — ALL RIGHTS RESERVED</div>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <a href="#" style={{ color: "var(--ink-2)" }}><Instagram size={16} strokeWidth={1.5} /></a>
            <Link href="/authenticity" className="mono-small link-hover" style={{ color: "var(--ink-3)", textDecoration: "none" }}>AUTHENTICITY</Link>
            <span className="mono-small" style={{ color: "var(--ink-3)" }}>PRIVACY</span>
            <span className="mono-small" style={{ color: "var(--ink-3)" }}>TERMS</span>
            <span className="mono-small" style={{ color: "var(--gold)" }}>◆ MADE WITH CARE</span>
          </div>
        </div>

        <div style={{ paddingTop: "2rem", marginTop: "2rem", borderTop: "1px solid var(--line-2)" }}>
          <p className="mono-small" style={{ color: "var(--ink-3)", lineHeight: 1.8, fontSize: 9, maxWidth: 900 }}>
            WINGIA IS AN INDEPENDENT CURATORIAL STUDIO AND IS NOT AFFILIATED WITH, ENDORSED BY, OR SPONSORED BY ANY OF THE BRANDS FEATURED ON THIS SITE. ALL TRADEMARKS, SERVICE MARKS, AND TRADE NAMES ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS. ALL PRODUCTS ARE AUTHENTIC AND SOURCED FROM AUTHORIZED RETAILERS, TRUSTED RESELLERS, AND PRIVATE COLLECTORS. EACH PIECE IS INSPECTED AND AUTHENTICATED BEFORE SHIPPING.
          </p>
        </div>
      </div>
    </footer>
  );
}
