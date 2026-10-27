import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import AppLayout from "@/components/AppLayout";
import RealtimeSync from "@/components/RealtimeSync";
import { AppTutorial } from "@/components/AppTutorial";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "JLAB Fitness Gym",
  description: "Modern Local Gym Management SaaS with AI Retention and White-Labeling",
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
        <AppLayout>{children}</AppLayout>
        <AppTutorial />
      </body>
    </html>
  );
}
