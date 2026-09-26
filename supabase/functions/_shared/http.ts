import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') ?? 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bootstrap-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });

export const serviceClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export const anonClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export const userClient = (authorization: string) => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { global: { headers: { Authorization: authorization } }, auth: { autoRefreshToken: false, persistSession: false } },
);

export interface Caller {
  id: string;
  username: string;
  role: 'admin' | 'partner' | 'student';
  status: 'active' | 'pending' | 'rejected';
  created_by: string | null;
}

export const getCaller = async (authorization: string): Promise<{ db: SupabaseClient; caller: Caller }> => {
  const db = userClient(authorization);
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) throw new Error('Sessão inválida.');
  const { data: caller, error } = await serviceClient()
    .from('users').select('id, username, role, status, created_by').eq('id', user.id).single();
  if (error || !caller || caller.status !== 'active') throw new Error('Conta inativa.');
  return { db, caller: caller as Caller };
};

export const randomPassword = (): string => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const alphabet = `${letters}${digits}`;
  const values = new Uint8Array(16);
  crypto.getRandomValues(values);
  const characters = Array.from(values, (value) => alphabet[value % alphabet.length]);
  characters[0] = letters[values[0] % letters.length];
  characters[1] = digits[values[1] % digits.length];
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = values[index] % (index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }
  return characters.join('');
};

export const syntheticEmail = (username: string): string => `${username.toLowerCase()}@internal.local`;

export const hashRateKey = async (value: string): Promise<string> => {
  const pepper = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const bytes = new TextEncoder().encode(`${pepper}:${value}`);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
};
