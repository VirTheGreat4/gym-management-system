export interface ScheduleDay {
  day: string;
  open: string;
  close: string;
  is_closed: boolean;
}

export interface SpecialClosedDate {
  id: string;
  date: string;
  reason: string;
}

export interface GymSchedule {
  is_open_now: boolean;
  manual_override: boolean;
  announcement?: string;
  regular_hours: ScheduleDay[];
  special_closed_dates: SpecialClosedDate[];
}

export interface GymSettings {
  id?: string;
  name: string;
  theme_color: string;
  logo_url: string | null;
  schedule?: GymSchedule;
  updated_at?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  category?: 'Standard' | 'Student' | 'VIP' | 'Daily' | 'Custom';
  description?: string;
}

export interface CustomBadge {
  id: string;
  name: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'rose' | 'slate';
  discount_percent?: number; // e.g. 15 for 15% off plans
  description?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  badges?: string[]; // Array of CustomBadge names or IDs
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
