import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "./lib/content";

const barlow = localFont({
  src: [
    { path: "./fonts/Barlow-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Barlow-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-barlow",
  display: "swap",
});
const inter = localFont({
  src: "./fonts/Inter-var.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "CA Triple Threat Basketball Camp | Built to Compete",
  description: site.description,
  alternates: { canonical: site.url },
  icons: { icon: "/brand/logo-clean.png" },
  openGraph: {
    title: "CA Triple Threat Basketball Camp",
    description: site.description,
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "CA Triple Threat Basketball Camp — branded court (concept render)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CA Triple Threat Basketball Camp",
    description: site.description,
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = { themeColor: "#080A0C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <body className="grain">{children}</body>
    </html>
  );
}
