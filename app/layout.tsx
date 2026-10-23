import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

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
    <html lang="en" suppressHydrationWarning className="h-full bg-slate-300">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body suppressHydrationWarning className="min-h-screen text-slate-900 bg-slate-300 font-sans antialiased">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <Sidebar />
          <main className="flex-1 lg:pl-72 flex flex-col min-h-screen">
            <div className="flex-1 p-3 sm:p-6 lg:p-10 pb-24 md:pb-6 max-w-7xl w-full mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
