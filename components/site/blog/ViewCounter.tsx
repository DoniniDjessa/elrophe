'use client';

import { useEffect } from 'react';

/** Compte une lecture de l'article (le serveur limite à une par visiteur et par heure) */
export default function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    void fetch('/api/blog/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }), keepalive: true }).catch(() => undefined);
  }, [slug]);
  return null;
}
