'use server';

import { createClient } from '@/lib/supabase/server';
import { Member } from '@/types/database';

export interface DashboardMetrics {
  totalActiveMembers: number;
  monthlyRevenueEstimate: number;
  expiringThisWeek: number;
  recentMembers: Member[];
}

export async function getDashboardMetrics(): Promise<{ data: DashboardMetrics | null; error: string | null }> {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const allMembers: Member[] = members || [];
  
  // Active: Expiration date is today or in the future
  const activeMembers = allMembers.filter((m) => m.expiration_date >= todayStr);
  
  // Expiring within next 7 days
  const expiringMembers = allMembers.filter(
    (m) => m.expiration_date >= todayStr && m.expiration_date <= inSevenDays
  );

  // Baseline revenue estimate (assume ₱2,000 / $40 per active member)
  const revenueEstimate = activeMembers.length * 2000;

  return {
    data: {
      totalActiveMembers: activeMembers.length,
      monthlyRevenueEstimate: revenueEstimate,
      expiringThisWeek: expiringMembers.length,
      recentMembers: allMembers.slice(0, 5),
    },
    error: null,
  };
}
