import type { Metadata, Viewport } from "next";
import { PwaRefresh } from "@/components/pwa-refresh";
import { getCanonicalSiteUrl } from "@/lib/site-url";
import "./globals.css";

const siteUrl = getCanonicalSiteUrl();

export const metadata: Metadata = {
  title: "Noesis Studio",
  description: "A quiet parent site for projects, products, and thought.",
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Noesis Studio"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-icon.svg", type: "image/svg+xml" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#09100f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>
        <PwaRefresh />
        {children}
      </body>
    </html>
  );
}
