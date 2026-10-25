'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import GeometricBackground from './GeometricBackground';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = pathname === '/' || pathname === '/portal';

  if (pathname === '/') {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#09090B] text-zinc-100 relative overflow-hidden">
        {children}
      </main>
    );
  }

  if (isPublicRoute) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 w-full mx-auto bg-[#09090B] text-zinc-100 relative overflow-hidden">
        <GeometricBackground />
        <div className="relative z-10 w-full max-w-xl mx-auto">
          {children}
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#09090B] text-zinc-100 relative overflow-hidden select-none">
      <GeometricBackground />
      <Sidebar />
      <main className="flex-1 lg:pl-68 bg-transparent text-zinc-100 min-h-screen relative z-10">
        <div className="flex-1 p-3 sm:p-6 lg:p-10 pb-24 md:pb-6 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

