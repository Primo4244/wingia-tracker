import "./globals.css";

export const metadata = {
  title: "WINGIA — Curated Streetwear & Archive | Montréal",
  description: "Stüssy, Moncler, Longchamp, Polo Ralph Lauren. Curated streetwear and quiet luxury, sourced in Montréal, shipped worldwide.",
  keywords: "streetwear, Stüssy, Moncler, Longchamp, Polo Ralph Lauren, Montréal, archive, luxury streetwear",
  openGraph: {
    title: "WINGIA — Curated Streetwear",
    description: "Curated streetwear and archive menswear. Sourced in Montréal.",
    type: "website",
    locale: "en_CA",
    siteName: "WINGIA",
  },
  robots: "index, follow",
};

export const viewport = {
  themeColor: "#0a0908",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=Inter+Tight:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
