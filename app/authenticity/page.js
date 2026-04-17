import Link from "next/link";
import { Shield, Eye, Package, Check } from "lucide-react";
import {
  CartProvider,
  Ticker,
  Header,
  Footer,
  CartDrawer,
} from "@/components/Storefront";

export const metadata = {
  title: "Authenticity — WINGIA",
  description: "How we source, inspect, and authenticate every piece we sell.",
};

export default function AuthenticityPage() {
  return (
    <CartProvider>
      <Ticker />
      <Header />
      <main>
        <section style={{ padding: "6rem 2rem 4rem", maxWidth: 1000, margin: "0 auto" }}>
          <div className="mono-small" style={{ color: "var(--gold)", marginBottom: 16 }}>◆ THE WINGIA STANDARD</div>
          <h1 className="serif" style={{ fontSize: "clamp(3rem, 7vw, 6rem)", fontWeight: 300, letterSpacing: "-0.045em", lineHeight: 0.95, marginBottom: "2.5rem" }}>
            Every piece, <em>verified</em>.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--ink-2)", fontWeight: 300, maxWidth: 700 }}>
            WINGIA is an independent curatorial studio based in Montréal. We don't manufacture. We don't imitate. We source from a network of trusted retailers, authorized distributors, and private collectors — and we inspect every piece before it ships.
          </p>
        </section>

        <section style={{ padding: "3rem 2rem", maxWidth: 1000, margin: "0 auto", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "3rem", padding: "3rem 0" }}>
            {[
              { icon: Eye, title: "Visual Inspection", desc: "Every piece is inspected in-hand against reference samples: stitching, hardware, labels, tags, finishing." },
              { icon: Shield, title: "Provenance", desc: "We track the chain of custody for every item. We only work with sellers we've vetted personally." },
              { icon: Package, title: "Packaging", desc: "Original packaging preserved whenever possible. Each order ships with a WINGIA authentication tag." },
              { icon: Check, title: "Return If Unsure", desc: "If you have any doubt about authenticity, return it within 14 days. Full refund, no questions." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i}>
                <Icon size={22} strokeWidth={1.5} style={{ color: "var(--gold)", marginBottom: 20 }} />
                <h3 className="serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 12 }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-2)", fontWeight: 300 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "6rem 2rem", maxWidth: 900, margin: "0 auto" }}>
          <div className="mono-small" style={{ color: "var(--gold)", marginBottom: 16 }}>◆ A NOTE ON AFFILIATION</div>
          <h2 className="serif" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "2rem" }}>
            We are not the brand. <em>We are the curator.</em>
          </h2>
          <div style={{ display: "grid", gap: "1.5rem", fontSize: 15, lineHeight: 1.7, color: "var(--ink-2)", fontWeight: 300 }}>
            <p>
              WINGIA is an independent reseller and curatorial studio. We are <em>not</em> affiliated with, endorsed by, or sponsored by any of the brands whose products we carry. All trademarks, service marks, and trade names are the property of their respective owners.
            </p>
            <p>
              We source authentic pieces from authorized retailers, trusted secondary-market sellers, and private collectors — and we sell them as a curated selection to clients who trust our eye. If you'd prefer to buy directly from a brand's own channel, we encourage you to do so.
            </p>
            <p>
              Questions about a specific piece? Email us at <span style={{ color: "var(--gold)" }}>hello@wingia.ca</span> and we'll walk you through its sourcing.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
