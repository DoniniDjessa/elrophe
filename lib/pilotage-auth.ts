import 'server-only';
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase/env';
import { supabaseService } from './supabase/server-admin';

const scrypt = promisify(scryptCb) as (password: string, salt: string, keylen: number) => Promise<Buffer>;

export const DEFAULT_CODE = '0044';
/** Compte Supabase partagé dans lequel le code d'accès connecte le pilotage */
const PILOTAGE_EMAIL = 'pilotage@elrophe.app';

export const isValidCode = (code: unknown): code is string => typeof code === 'string' && /^[0-9A-Za-z]{4,32}$/.test(code);

export async function hashCode(code: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(code, salt, 32);
  return `${salt}:${hash.toString('hex')}`;
}

async function matches(code: string, stored: string): Promise<boolean> {
  const [salt, hex] = stored.split(':');
  if (!salt || !hex) return false;
  const expected = Buffer.from(hex, 'hex');
  const actual = await scrypt(code, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

/** Vérifie le code ; sans code enregistré en base, le code par défaut (0044) s'applique */
export async function verifyCode(code: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabaseService.from('elrophe_pilotage_access').select('code_hash').eq('id', 1).maybeSingle();
  if (error) return { ok: false, error: 'Base de données non configurée : exécutez supabase/elrophe-schema.sql.' };
  if (!data) return { ok: code === DEFAULT_CODE };
  return { ok: await matches(code, data.code_hash) };
}

export async function saveCode(code: string) {
  const { error } = await supabaseService
    .from('elrophe_pilotage_access')
    .upsert({ id: 1, code_hash: await hashCode(code), updated_at: new Date().toISOString() });
  return { error: error?.message ?? null };
}

let cachedUserId: string | null = null;

/** Retrouve (ou crée) le compte partagé du pilotage et s'assure qu'il est administrateur */
async function ensurePilotageUser(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  const { data: created } = await supabaseService.auth.admin.createUser({
    email: PILOTAGE_EMAIL,
    password: randomBytes(24).toString('hex'),
    email_confirm: true,
  });
  let id = created?.user?.id;
  for (let page = 1; !id; page++) {
    const { data } = await supabaseService.auth.admin.listUsers({ page, perPage: 200 });
    if (!data?.users.length) break;
    id = data.users.find((u) => u.email === PILOTAGE_EMAIL)?.id;
  }
  if (!id) throw new Error('Compte pilotage introuvable');
  const { error } = await supabaseService.from('elrophe_admins').upsert({ user_id: id, email: PILOTAGE_EMAIL });
  if (error) throw new Error(error.message);
  cachedUserId = id;
  return id;
}

/**
 * Ouvre une session Supabase pour le pilotage. Le mot de passe du compte partagé est
 * renouvelé à chaque connexion et n'est jamais envoyé au navigateur : seul le code y donne accès.
 */
export async function openPilotageSession() {
  const id = await ensurePilotageUser();
  const password = randomBytes(24).toString('hex');
  const { error: updateError } = await supabaseService.auth.admin.updateUserById(id, { password });
  if (updateError) throw new Error(updateError.message);
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInWithPassword({ email: PILOTAGE_EMAIL, password });
  if (error || !data.session) throw new Error(error?.message ?? 'Session impossible');
  return { access_token: data.session.access_token, refresh_token: data.session.refresh_token };
}
