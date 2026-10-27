'use server';

import { createClient } from '@/lib/supabase/server';
import { CustomBadge } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getCustomBadges(): Promise<{ data: CustomBadge[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('custom_badges')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Failed to fetch badges.' };
  }
}

export async function createCustomBadge(
  payload: Omit<CustomBadge, 'id'>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('custom_badges').insert([payload]);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/subscriptions');
    revalidatePath('/members');
    revalidatePath('/');
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create badge.' };
  }
}

export async function updateCustomBadge(
  id: string,
  payload: Partial<Omit<CustomBadge, 'id'>>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('custom_badges')
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
    return { success: false, error: err?.message || 'Failed to update badge.' };
  }
}

export async function deleteCustomBadge(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('custom_badges').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/subscriptions');
    revalidatePath('/members');
    revalidatePath('/');
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete badge.' };
  }
}
