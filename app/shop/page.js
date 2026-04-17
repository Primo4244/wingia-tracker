import {
  CartProvider,
  Ticker,
  Header,
  ShopGrid,
  Footer,
  CartDrawer,
} from "@/components/Storefront";

export const metadata = {
  title: "Shop — WINGIA",
  description: "Browse our curated index of streetwear, archive, and quiet luxury.",
};

export default function ShopPage() {
  return (
    <CartProvider>
      <Ticker />
      <Header />
      <main>
        <div style={{ padding: "4rem 2rem 0", maxWidth: 1600, margin: "0 auto" }}>
          <div className="mono-small" style={{ color: "var(--gold)", marginBottom: 12 }}>◆ SHOP — THE FULL INDEX</div>
          <h1 className="serif" style={{ fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 300, letterSpacing: "-0.045em", lineHeight: 0.9, marginBottom: "1rem" }}>
            The <em>Index.</em>
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-2)", maxWidth: 480, fontWeight: 300, lineHeight: 1.6 }}>
            Every piece we carry, under one roof. Filtered, sorted, ready.
          </p>
        </div>
        <ShopGrid showHeader={false} />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
