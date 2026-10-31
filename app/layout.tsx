import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import AppLayout from "@/components/AppLayout";
import RealtimeSync from "@/components/RealtimeSync";
import { AppTutorial } from "@/components/AppTutorial";
import AdminInactivityGuard from "@/components/AdminInactivityGuard";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: "JLAB Fitness Gym Portal",
    template: "%s | JLAB Fitness Gym Portal",
  },
  description: "Modern Local Gym Management SaaS with AI Retention and White-Labeling",
  openGraph: {
    title: "JLAB Fitness Gym Portal",
    description: "Modern Local Gym Management SaaS with AI Retention and White-Labeling",
    siteName: "JLAB Fitness Gym Portal",
  },
  twitter: {
    card: "summary_large_image",
    title: "JLAB Fitness Gym Portal",
    description: "Modern Local Gym Management SaaS with AI Retention and White-Labeling",
  },
  verification: {
    google: "DH-cARQFpxf36_oYXPPE_0zENJ8H4hSbcIEJnlp01bg",
  },
  icons: {
    icon: "/jlab-logo.svg",
    shortcut: "/jlab-logo.svg",
    apple: "/jlab-logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
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
