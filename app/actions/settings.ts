'use server';

import { createClient } from '@/lib/supabase/server';
import { GymSettings } from '@/types/database';
import { revalidatePath } from 'next/cache';

const SINGLE_GYM_ID = '00000000-0000-0000-0000-000000000001';

export async function getGymSettings(): Promise<{ data: GymSettings | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('id', SINGLE_GYM_ID)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { data: null, error: error.message };
  }

  // Fallback defaults if record is not yet seeded
  if (!data) {
    const defaultSettings: GymSettings = {
      id: SINGLE_GYM_ID,
      name: 'PowerFit Studio',
      theme_color: '#3B82F6',
      logo_url: null,
    };
    return { data: defaultSettings, error: null };
  }

  return { data, error: null };
}

export async function updateGymSettings(
  payload: Partial<GymSettings>
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('gyms')
    .upsert({
      id: SINGLE_GYM_ID,
      ...payload,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/settings');
  revalidatePath('/');
  revalidatePath('/members');
  revalidatePath('/retention');
  return { success: true, error: null };
}

