'use server';

import { createClient } from '@/lib/supabase/server';
import { GymSettings } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { DEFAULT_GYM_NAME, DEFAULT_LOGO_URL, DEFAULT_THEME_COLOR } from '@/lib/config';

export async function getGymSettings(): Promise<{ data: GymSettings | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('gym_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      const defaultSettings: GymSettings = {
        name: DEFAULT_GYM_NAME,
        theme_color: DEFAULT_THEME_COLOR,
        logo_url: DEFAULT_LOGO_URL,
      };
      return { data: defaultSettings, error: null };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function updateGymSettings(
  payload: Partial<GymSettings>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    
    // Fetch the existing record's id
    const { data: existing } = await supabase
      .from('gym_settings')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let mutationError;

    if (existing?.id) {
      const { error } = await supabase
        .from('gym_settings')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      mutationError = error;
    } else {
      const { error } = await supabase
        .from('gym_settings')
        .insert([{ ...payload, updated_at: new Date().toISOString() }]);
      mutationError = error;
    }

    if (mutationError) {
      return { success: false, error: mutationError.message };
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath('/portal');
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

