'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RealtimeSync() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to all changes on all tables in the public schema
    const channel = supabase
      .channel('global-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        // Triggers a seamless Next.js Server Component data refetch
        router.refresh();
        // Dispatch universal browser window event for client-side useState hooks across devices
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('supabase-realtime-update', { detail: payload }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null; // Headless component, renders nothing
}
