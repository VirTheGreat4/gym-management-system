'use server';

import { createClient } from '@/lib/supabase/server';
import { SubscriptionPlan } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getSubscriptionPlans(): Promise<{ data: SubscriptionPlan[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to fetch subscription plans.' };
  }
}

export async function createSubscriptionPlan(
  payload: Omit<SubscriptionPlan, 'id'>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('subscription_plans').insert([payload]);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/subscriptions');
    revalidatePath('/members');
    revalidatePath('/');
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create subscription plan.' };
  }
}

export async function updateSubscriptionPlan(
  id: string,
  payload: Partial<Omit<SubscriptionPlan, 'id'>>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('subscription_plans')
      .update(payload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/subscriptions');
    revalidatePath('/members');
    revalidatePath('/');
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update subscription plan.' };
  }
}

export async function deleteSubscriptionPlan(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/subscriptions');
    revalidatePath('/members');
    revalidatePath('/');
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete subscription plan.' };
  }
}
