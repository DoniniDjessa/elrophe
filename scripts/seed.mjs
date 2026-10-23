// Importe le catalogue de démonstration (data/) dans Supabase, sans écraser l'existant.
// Usage : npm run seed   (nécessite SUPABASE_SERVICE_ROLE_KEY dans .env.local)
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Les fichiers data/*.ts ne contiennent que des types à effacer : Node les lit directement
const { seedCategories, seedProducts, seedTestimonials, seedIngredients, seedSolutions } = await import('../data/catalog.ts');
const { defaultSettings } = await import('../data/site.ts');

const count = async (table) => (await supabase.from(table).select('*', { count: 'exact', head: true })).count ?? 0;
const step = async (label, promise) => {
  const { error } = await promise;
  if (error) throw new Error(`${label} : ${error.message}`);
  console.log(`✓ ${label}`);
};

await step(`${seedCategories.length} catégories`, supabase.from('elrophe_categories').upsert(seedCategories, { onConflict: 'slug', ignoreDuplicates: true }));
await step(`${seedProducts.length} produits`, supabase.from('elrophe_products').upsert(seedProducts, { onConflict: 'slug', ignoreDuplicates: true }));
await step(`${seedSolutions.length} solutions`, supabase.from('elrophe_solutions').upsert(seedSolutions, { onConflict: 'slug', ignoreDuplicates: true }));
// Avis et ingrédients n'ont pas de clé naturelle : importés seulement si la table est vide
if ((await count('elrophe_testimonials')) === 0) await step(`${seedTestimonials.length} avis`, supabase.from('elrophe_testimonials').insert(seedTestimonials));
if ((await count('elrophe_ingredients')) === 0) await step(`${seedIngredients.length} ingrédients`, supabase.from('elrophe_ingredients').insert(seedIngredients));
await step(
  'réglages du site',
  supabase.from('elrophe_settings').upsert(Object.entries(defaultSettings).map(([key, value]) => ({ key, value })), { onConflict: 'key', ignoreDuplicates: true }),
);
console.log('Import terminé. Le contenu est modifiable dans /pilotage.');
