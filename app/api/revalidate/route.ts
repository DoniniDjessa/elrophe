import { revalidateTag } from 'next/cache';
import { SITE_TAG } from '@/lib/data';
import { isAdminToken } from '@/lib/supabase/server-admin';

/** Appelé par le pilotage après chaque modification : le site affiche aussitôt le nouveau contenu */
export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!(await isAdminToken(token))) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 });
  }
  revalidateTag(SITE_TAG, { expire: 0 });
  return Response.json({ revalidated: true });
}
