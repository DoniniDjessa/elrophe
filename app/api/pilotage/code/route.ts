import { isValidCode, saveCode, verifyCode } from '@/lib/pilotage-auth';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { isAdminToken } from '@/lib/supabase/server-admin';

/** Changement du code d'accès : réservé à une session pilotage, avec le code actuel */
export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!(await isAdminToken(token))) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  if (!rateLimit(`pilotage-code:${clientIp(request)}`, 5, 15 * 60_000)) {
    return Response.json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, { status: 429 });
  }

  const { current, next } = await request.json().catch(() => ({}));
  if (!isValidCode(current) || !(await verifyCode(current)).ok) {
    return Response.json({ error: 'Le code actuel est incorrect.' }, { status: 400 });
  }
  if (!isValidCode(next)) {
    return Response.json({ error: 'Le nouveau code doit contenir de 4 à 32 chiffres ou lettres.' }, { status: 400 });
  }
  const { error } = await saveCode(next);
  if (error) return Response.json({ error }, { status: 500 });
  return Response.json({ ok: true });
}
