import { isValidCode, openPilotageSession, verifyCode } from '@/lib/pilotage-auth';
import { clientIp, rateLimit } from '@/lib/rate-limit';

/** Connexion au pilotage par code : renvoie une session Supabase du compte administrateur partagé */
export async function POST(request: Request) {
  // Un code court se devine vite : 5 essais par quart d'heure et par adresse IP
  if (!rateLimit(`pilotage:${clientIp(request)}`, 5, 15 * 60_000)) {
    return Response.json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, { status: 429 });
  }
  const { code } = await request.json().catch(() => ({ code: null }));
  if (!isValidCode(code)) return Response.json({ error: 'Code incorrect' }, { status: 401 });

  const { ok, error } = await verifyCode(code);
  if (error) return Response.json({ error }, { status: 503 });
  if (!ok) return Response.json({ error: 'Code incorrect' }, { status: 401 });

  try {
    return Response.json(await openPilotageSession());
  } catch (err) {
    console.error('[elrophe] session pilotage :', err);
    return Response.json({ error: 'Connexion impossible pour le moment.' }, { status: 500 });
  }
}
