import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_Bengali, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "./register-sw";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-serif-bn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "বাসা হিসাব — বাসা-বাড়ির ভাড়া ও খরচের নিরাপদ ডিজিটাল খাতা",
  description:
    "বাসা মালিকদের জন্য সহজ হিসাব: একাধিক বিল্ডিং, মাসিক ভাড়া আদায়, খরচের খাতা — সবকিছু চিরকালের জন্য নিরাপদে সংরক্ষিত। প্রিমিয়াম সাবস্ক্রিপশন বিকাশ/নগদে।",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "বাসা হিসাব",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#144433",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" className={`${notoSansBengali.variable} ${notoSerifBengali.variable}`}>
      <body className="bg-paper text-ink font-sans antialiased">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
