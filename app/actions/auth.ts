'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === validPassword) {
    cookieStore.set('gym_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  }
  return { success: false, error: 'Incorrect password.' };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('gym_admin_session');
  redirect('/');
}
