import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;

export type AppRole = 'admin' | 'partner' | 'student';
export interface AppUser {
  id: string;
  username: string;
  role: AppRole;
  status: 'active' | 'pending' | 'rejected';
  created_by: string | null;
}

export const invokeAccountAction = async <T>(body: Record<string, unknown>): Promise<T> => {
  if (!supabase) throw new Error('Supabase não está configurado.');
  const { data, error } = await supabase.functions.invoke('auth-accounts', { body });
  if (error) {
    const context = 'context' in error ? error.context : undefined;
    if (context instanceof Response) {
      const responseBody = await context.clone().json().catch(() => null) as { error?: string } | null;
      if (responseBody?.error) throw new Error(responseBody.error);
    }
    throw new Error(error.message);
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
};
