'use server';

import { createClient } from '@/lib/supabase/server';
import { Member } from '@/types/database';

export interface AtRiskMember extends Member {
  daysLeft: number;
  urgency: 'critical' | 'warning' | 'expired';
  aiSuggestedOffer: string;
  smsUrl: string;
}

export async function getAtRiskMembers(): Promise<{ data: AtRiskMember[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('expiration_date', { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const atRiskList: AtRiskMember[] = [];

  for (const member of (members || [])) {
    const expDate = new Date(member.expiration_date);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Target members expiring in <= 3 days or expired up to 3 days ago
    if (daysLeft >= -3 && daysLeft <= 3) {
      let urgency: 'critical' | 'warning' | 'expired' = 'warning';
      let offer = 'Renew today for 10% off your next month!';

      if (daysLeft < 0) {
        urgency = 'expired';
        offer = 'We miss you! Re-activate this week and we will waive registration fees.';
      } else if (daysLeft <= 1) {
        urgency = 'critical';
        offer = 'Lock in your early renewal rate today to avoid subscription lapse!';
      }

      const cleanPhone = member.phone.replace(/[^0-9]/g, '');
      const message = `Hi ${member.name}! Your gym membership ${
        daysLeft < 0 ? 'recently lapsed' : daysLeft === 0 ? 'expires today' : `expires in ${daysLeft} days`
      }. ${offer} Reply here to confirm your extension!`;

      const smsUrl = `sms:${cleanPhone}?&body=${encodeURIComponent(message)}`;

      atRiskList.push({
        ...member,
        daysLeft,
        urgency,
        aiSuggestedOffer: offer,
        smsUrl,
      });
    }
  }

  return { data: atRiskList, error: null };
}
