import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atelier Zara / H&M - AI Fashion Studio",
  description: "Self-hosted AI Fashion Model & Catalog Generator for E-Commerce Brands",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#09090b] text-zinc-100 selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
