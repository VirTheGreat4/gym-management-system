import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import AppLayout from "@/components/AppLayout";
import RealtimeSync from "@/components/RealtimeSync";
import { AppTutorial } from "@/components/AppTutorial";
import AdminInactivityGuard from "@/components/AdminInactivityGuard";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gym-management.example.com";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JLAB Fitness Gym Portal",
    template: "%s | JLAB Fitness Gym Portal",
  },
  description: "Comprehensive gym management platform for member access, subscription tracking, and facility operations.",
  openGraph: {
    title: "JLAB Fitness Gym Portal",
    description: "Comprehensive gym management platform for member access, subscription tracking, and facility operations.",
    siteName: "JLAB Fitness Gym Portal",
    url: siteUrl,
    images: [
      {
        url: "/jlab-logo.png",
        width: 512,
        height: 512,
        alt: "JLAB Fitness Gym Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JLAB Fitness Gym Portal",
    description: "Comprehensive gym management platform for member access, subscription tracking, and facility operations.",
    images: ["/jlab-logo.png"],
  },
  verification: {
    google: "DH-cARQFpxf36_oYXPPE_0zENJ8H4hSbcIEJnlp01bg",
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/jlab-logo.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "JLAB Fitness Gym Portal",
  "url": siteUrl,
  "logo": `${siteUrl}/jlab-logo.png`,
  "image": `${siteUrl}/jlab-logo.png`,
  "description": "Comprehensive gym management platform for member access, subscription tracking, and facility operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" sizes="any" />
        <link rel="icon" href="/jlab-logo.png" type="image/png" sizes="512x512" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${inter.className} min-h-screen text-zinc-100 bg-[#09090B] antialiased`}
      >
        <RealtimeSync />
        <AdminInactivityGuard />
        <AppLayout>{children}</AppLayout>
        <AppTutorial />
      </body>
    </html>
  );
}
