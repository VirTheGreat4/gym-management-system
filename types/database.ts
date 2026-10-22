export interface GymSettings {
  id?: string;
  name: string;
  theme_color: string;
  logo_url: string | null;
  updated_at?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  category: 'Standard' | 'Student' | 'VIP' | 'Daily' | 'Custom';
  description?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  plan_type?: string;
  amount_paid?: number;
  payment_method?: 'Cash' | 'GCash' | 'Card' | 'Bank Transfer';
  join_date: string;
  expiration_date: string;
  is_banned?: boolean;
  ban_reason?: string | null;
  warning_count?: number;
  violation_notes?: string | null;
  created_at: string;
}
