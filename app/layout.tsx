import type { Metadata, Viewport } from "next";
import { Comic_Neue } from 'next/font/google';
import AppLayout from "@/components/AppLayout";
import RealtimeSync from "@/components/RealtimeSync";
import "./globals.css";

const comicNeue = Comic_Neue({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-comic-neue',
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
        className={`${comicNeue.variable} min-h-screen text-slate-900 bg-[#CBD5E1] antialiased`}
      >
        <RealtimeSync />
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
