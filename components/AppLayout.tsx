'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = pathname === '/' || pathname === '/portal';

  if (pathname === '/') {
    return (
      <main className="h-dvh max-h-dvh overflow-hidden flex items-center justify-center p-4 w-full max-w-lg mx-auto">
        {children}
      </main>
    );
  }

  if (isPublicRoute) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 w-full max-w-xl mx-auto">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:pl-64">
        <div className="flex-1 p-3 sm:p-6 lg:p-10 pb-24 md:pb-6 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
