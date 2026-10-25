import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import AppLayout from "@/components/AppLayout";
import RealtimeSync from "@/components/RealtimeSync";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Gym Management SaaS | White-Label Portal",
  description: "Modern Local Gym Management SaaS with AI Retention and White-Labeling",
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
      </body>
    </html>
  );
}
