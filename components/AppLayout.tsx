'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = pathname === '/' || pathname === '/portal';

  if (pathname === '/') {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#0B0C10] text-zinc-100 relative overflow-hidden">
        {children}
      </main>
    );
  }

  if (isPublicRoute) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 w-full max-w-xl mx-auto bg-[#09090B] text-zinc-100">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#09090B] text-zinc-100">
      <Sidebar />
      <main className="flex-1 lg:pl-64 bg-[#09090B] text-zinc-100 min-h-screen">
        <div className="flex-1 p-3 sm:p-6 lg:p-10 pb-24 md:pb-6 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
