// Optimisation des images via wsrv.nl (gratuit, cache Cloudflare) au lieu de l'optimiseur Vercel
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.elrophecare.com';

export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // En local, wsrv.nl ne peut pas joindre localhost : on sert le fichier tel quel
  if (process.env.NODE_ENV === 'development' && src.startsWith('/')) return `${src}?w=${width}`;

  const url = src.startsWith('/') ? `${siteUrl}${src}` : src;
  const params = new URLSearchParams({ url, w: String(width), q: String(quality || 75), output: 'webp', we: '' });
  return `https://wsrv.nl/?${params}`;
}
