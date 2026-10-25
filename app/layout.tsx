import type { Metadata, Viewport } from "next";
import AppLayout from "@/components/AppLayout";
import RealtimeSync from "@/components/RealtimeSync";
import "./globals.css";

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
      <body suppressHydrationWarning className="min-h-screen text-slate-900 bg-[#CBD5E1] font-comic antialiased">
        <RealtimeSync />
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
