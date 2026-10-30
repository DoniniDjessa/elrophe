import { clientIp, rateLimit } from '@/lib/rate-limit';
import { supabaseService } from '@/lib/supabase/server-admin';

/** Compte une lecture d'article (une par article, par visiteur et par heure) */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const slug = typeof body.slug === 'string' ? body.slug.slice(0, 160) : '';
  if (!/^[a-z0-9-]+$/.test(slug)) return Response.json({ error: 'Article inconnu' }, { status: 400 });
  if (!rateLimit(`blog-view:${clientIp(request)}:${slug}`, 1, 60 * 60_000)) return Response.json({ ok: true });
  const { error } = await supabaseService.rpc('elrophe_blog_view', { p_slug: slug });
  if (error) console.warn('[elrophe] vue du blog :', error.message);
  return Response.json({ ok: true });
}
