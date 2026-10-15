import { clientIp, rateLimit } from '@/lib/rate-limit';
import { supabaseService } from '@/lib/supabase/server-admin';

export async function POST(request: Request) {
  if (!rateLimit(`news:${clientIp(request)}`, 5, 10 * 60_000)) {
    return Response.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 160) : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
  }
  const { error } = await supabaseService.from('elrophe_newsletter').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) {
    console.error('[elrophe] newsletter :', error.message);
    return Response.json({ error: 'Inscription momentanément indisponible.' }, { status: 500 });
  }
  return Response.json({ ok: true });
}
