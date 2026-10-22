'use server';

import { createClient } from '@/lib/supabase/server';
import { Member } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getMembers(): Promise<{ data: Member[] | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function createMember(
  payload: Omit<Member, 'id' | 'created_at'>
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from('members').insert([payload]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/members');
  revalidatePath('/');
  revalidatePath('/retention');
  return { success: true, error: null };
}

export async function updateMember(
  id: string,
  payload: Partial<Omit<Member, 'id' | 'created_at'>>
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('members')
    .update(payload)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/members');
  revalidatePath('/');
  revalidatePath('/retention');
  return { success: true, error: null };
}

export async function deleteMember(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from('members').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/members');
  revalidatePath('/');
  revalidatePath('/retention');
  return { success: true, error: null };
}

export async function issueWarning(
  id: string,
  note: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const { data: member, error: fetchError } = await supabase
    .from('members')
    .select('warning_count, violation_notes')
    .eq('id', id)
    .single();

  if (fetchError || !member) {
    return { success: false, error: fetchError?.message || 'Member not found' };
  }

  const currentCount = member.warning_count || 0;
  const newCount = currentCount + 1;
  const timestamp = new Date().toISOString();
  const formattedNote = `[${timestamp}] ${note}`;
  const updatedNotes = member.violation_notes
    ? `${member.violation_notes}\n${formattedNote}`
    : formattedNote;

  const { error } = await supabase
    .from('members')
    .update({
      warning_count: newCount,
      violation_notes: updatedNotes,
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/members');
  revalidatePath('/');
  revalidatePath('/retention');
  return { success: true, error: null };
}

export async function banMember(
  id: string,
  reason: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('members')
    .update({
      is_banned: true,
      ban_reason: reason,
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/members');
  revalidatePath('/');
  revalidatePath('/retention');
  return { success: true, error: null };
}

export async function unbanMember(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('members')
    .update({
      is_banned: false,
      ban_reason: null,
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/members');
  revalidatePath('/');
  revalidatePath('/retention');
  return { success: true, error: null };
}

