import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

/** Client service role : contourne la RLS. Uniquement dans les route handlers. */
export const supabaseService = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Vérifie qu'un jeton d'accès Supabase appartient à un administrateur ELROPHE */
export async function isAdminToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.rpc('elrophe_is_admin');
  return !error && data === true;
}
