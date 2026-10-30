import { cacheLife, cacheTag } from 'next/cache';
import { supabasePublic } from './supabase/public';
import { applyVisibility, normalizeLanding } from './landing';
import { applyPreview } from './preview';
import { mergeSettings } from './settings';
import { defaultSettings } from '@/data/site';
import { fallbackCategories, fallbackIngredients, fallbackProducts, fallbackSolutions, fallbackTestimonials } from '@/data/catalog';
import type { BlogPost, Category, Ingredient, Product, SiteSettings, Solution, Testimonial } from './types';

/**
 * Tag commun à tout le contenu du site : le pilotage l'invalide après chaque modification.
 * Durée « minutes » (revalidation chaque minute) : la base est partagée entre plusieurs déploiements
 * (site en ligne, préversion, local) et l'invalidation n'atteint que celui où l'on enregistre.
 */
export const SITE_TAG = 'elrophe';

const normalizeProduct = (p: Product): Product => ({
  ...p,
  price: Number(p.price),
  compare_at_price: p.compare_at_price == null ? null : Number(p.compare_at_price),
  rating: Number(p.rating),
  gallery: p.gallery ?? [],
  highlights: (p.highlights ?? []).filter(Boolean),
  benefits: (p.benefits ?? []).filter((b) => b?.title || b?.text),
  is_featured: !!p.is_featured,
  new_order: p.new_order ?? 0,
  bestseller_order: p.bestseller_order ?? 0,
  // Prix à 0 : produit annoncé, pas encore en vente (« Bientôt disponible »)
  coming_soon: !(Number(p.price) > 0),
  landing: p.landing ? normalizeLanding(p.landing) : null,
});

/** Lit une table ; en cas d'erreur (table absente, réseau) renvoie le contenu de démonstration */
async function readTable<T>(table: string, fallback: T[], order = 'sort_order'): Promise<T[]> {
  const { data, error } = await supabasePublic.from(table).select('*').eq('is_active', true).order(order);
  if (error) {
    console.warn(`[elrophe] ${table} indisponible, contenu par défaut utilisé : ${error.message}`);
    return fallback;
  }
  return data as T[];
}

export async function getSettings(): Promise<SiteSettings> {
  'use cache';
  cacheLife('minutes');
  cacheTag(SITE_TAG);
  const { data, error } = await supabasePublic.from('elrophe_settings').select('key, value');
  if (error) return defaultSettings;
  return mergeSettings(data ?? []);
}

export async function getCategories(): Promise<Category[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(SITE_TAG);
  return readTable<Category>('elrophe_categories', fallbackCategories);
}

export async function getProducts(): Promise<Product[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(SITE_TAG);
  const rows = await readTable<Product>('elrophe_products', fallbackProducts);
  return applyPreview(rows.map(normalizeProduct).map(applyVisibility));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(SITE_TAG);
  return readTable<Testimonial>('elrophe_testimonials', fallbackTestimonials);
}

export async function getIngredients(): Promise<Ingredient[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(SITE_TAG);
  return readTable<Ingredient>('elrophe_ingredients', fallbackIngredients);
}

export async function getSolutions(): Promise<Solution[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(SITE_TAG);
  const rows = await readTable<Solution>('elrophe_solutions', fallbackSolutions);
  return rows.map((s) => ({ ...s, product_ids: s.product_ids ?? [] }));
}

export async function getSolutionBySlug(slug: string): Promise<Solution | null> {
  const solutions = await getSolutions();
  return solutions.find((s) => s.slug === slug) ?? null;
}

/** Articles du blog visibles, du plus récent au plus ancien (table absente : aucun article) */
export async function getBlogPosts(): Promise<BlogPost[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(SITE_TAG);
  const { data, error } = await supabasePublic
    .from('elrophe_blog_posts')
    .select('*')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .order('sort_order');
  if (error) {
    console.warn(`[elrophe] elrophe_blog_posts indisponible : ${error.message}`);
    return [];
  }
  return (data as BlogPost[]).map((p) => ({ ...p, views: Number(p.views) || 0, reading_minutes: Number(p.reading_minutes) || 0 }));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}
