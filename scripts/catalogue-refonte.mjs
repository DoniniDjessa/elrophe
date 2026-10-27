// Catalogue de la refonte : ne garder que les 4 produits phares, avec leurs nouveaux visuels.
// Usage : node scripts/catalogue-refonte.mjs
// 1. Téléverse les visuels (public/produits/*.png → WebP) dans le stockage Supabase « elrophe-media »
// 2. Associe les visuels à Pylor Health Sulfomas, Moringa et Curcuma
// 3. Crée Digesta Premium (prix 0 = « Bientôt disponible », stock 0 = non commandable)
// 4. Masque les autres produits (is_active = false) : réactivables dans Pilotage › Boutique, rien n'est supprimé
// Attention : la base est partagée avec le site en ligne, qui affichera aussi ce catalogue.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]),
);
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY absent de .env.local');
const auth = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const visuals = [
  { file: 'pylor-health-sulfomas', slug: 'pylor-health-sulfomas' },
  { file: 'moringa-premium', slug: 'moringa-vitalite' },
  { file: 'curcuma-premium', slug: 'curcuma-poivre-noir' },
  { file: 'digesta-premium', slug: 'digesta-premium' },
];
const keep = visuals.map((v) => v.slug);

async function rest(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { ...init, headers: { ...auth, 'Content-Type': 'application/json', Prefer: 'return=representation', ...init.headers } });
  const body = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status} ${body}`);
  return body ? JSON.parse(body) : null;
}

// 1. Visuels
const urls = {};
for (const v of visuals) {
  const webp = await sharp(`public/produits/${v.file}.png`).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const path = `products/refonte-${v.file}.webp`;
  const res = await fetch(`${URL}/storage/v1/object/elrophe-media/${path}`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'image/webp', 'x-upsert': 'true' },
    body: webp,
  });
  if (!res.ok) throw new Error(`Téléversement ${path} → ${res.status} ${await res.text()}`);
  urls[v.slug] = `${URL}/storage/v1/object/public/elrophe-media/${path}`;
  console.log(`✓ visuel ${v.file} (${Math.round(webp.length / 1024)} Ko)`);
}

// 2. Visuels des produits existants, en tête du catalogue
for (const [i, slug] of keep.slice(0, 3).entries()) {
  await rest(`elrophe_products?slug=eq.${slug}`, { method: 'PATCH', body: JSON.stringify({ image_url: urls[slug], sort_order: i + 1, is_active: true }) });
  console.log(`✓ ${slug} : nouveau visuel`);
}

// 3. Digesta Premium (créé, ou complété s'il existe déjà)
await rest('elrophe_products?on_conflict=slug', {
  method: 'POST',
  headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify({
    slug: 'digesta-premium',
    name: 'Digesta Premium',
    category_slug: 'complements',
    benefit: 'Gingembre et citron',
    price: 0,
    stock: 0,
    image_url: urls['digesta-premium'],
    is_active: true,
    is_new: true,
    sort_order: 4,
    landing: { format: '500 mg | 60 gélules' },
  }),
});
console.log('✓ digesta-premium : créé (bientôt disponible)');

// 4. Les autres produits sont masqués
const hidden = await rest(`elrophe_products?slug=not.in.(${keep.join(',')})&is_active=eq.true`, { method: 'PATCH', body: JSON.stringify({ is_active: false }) });
console.log(`✓ ${hidden.length} autre(s) produit(s) masqué(s) : ${hidden.map((p) => p.slug).join(', ') || '—'}`);
console.log('Terminé. Enregistrez une modification dans le pilotage (ou redémarrez le site) pour vider le cache.');
