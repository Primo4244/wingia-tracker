import {
  CartProvider,
  Ticker,
  Header,
  Hero,
  ShopGrid,
  Manifesto,
  Footer,
  CartDrawer,
} from "@/components/Storefront";

export default function Home() {
  return (
    <CartProvider>
      <Ticker />
      <Header />
      <main>
        <Hero />
        <ShopGrid />
        <Manifesto />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
