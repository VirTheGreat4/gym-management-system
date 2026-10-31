'use server';

import { createClient } from '@/lib/supabase/server';
import { GymSettings } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { DEFAULT_GYM_NAME, DEFAULT_LOGO_URL, DEFAULT_THEME_COLOR } from '@/lib/config';
import { isSpecialClosedDateExpired } from '@/lib/dateUtils';

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

    if (!data.logo_url) {
      data.logo_url = DEFAULT_LOGO_URL;
    }
    if (!data.name || data.name === 'JLAB Fitness' || data.name === 'JLAB Fitness Gym') {
      data.name = DEFAULT_GYM_NAME;
    }

    // Filter and auto-purge expired special closed dates at server layer
    if (data.schedule && Array.isArray(data.schedule.special_closed_dates)) {
      const originalDates = data.schedule.special_closed_dates;
      const validDates = originalDates.filter(
        (item: any) => item && item.date && !isSpecialClosedDateExpired(item.date)
      );

      data.schedule = {
        ...data.schedule,
        special_closed_dates: validDates,
      };

      // Automated purge mechanism: permanently delete expired entries from database
      if (validDates.length !== originalDates.length && data.id) {
        (async () => {
          try {
            await supabase
              .from('gym_settings')
              .update({ schedule: data.schedule, updated_at: new Date().toISOString() })
              .eq('id', data.id);
            revalidatePath('/settings');
            revalidatePath('/portal');
            revalidatePath('/dashboard');
            revalidatePath('/');
          } catch (purgeErr) {
            console.error('Failed to auto-purge expired closed dates in database:', purgeErr);
          }
        })();
      }
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

    // Filter out expired dates from payload before saving
    if (payload.schedule && Array.isArray(payload.schedule.special_closed_dates)) {
      payload.schedule = {
        ...payload.schedule,
        special_closed_dates: payload.schedule.special_closed_dates.filter(
          (item: any) => item && item.date && !isSpecialClosedDateExpired(item.date)
        ),
      };
    }
    
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

