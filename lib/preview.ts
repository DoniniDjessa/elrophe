import { normalizeLanding } from './landing';
import type { Product } from './types';

/**
 * Préversion de la refonte (branche refonte-premium) : nouveaux visuels produit fournis par le client.
 * Tant que la base garde les anciennes images, elles sont remplacées à la lecture. Dès qu'une autre image
 * est enregistrée (script scripts/catalogue-refonte.mjs ou Pilotage › Boutique), c'est elle qui s'affiche.
 */
export const previewVisuals: Record<string, { from: string; to: string }> = {
  'pylor-health-sulfomas': { from: '1792803887044-sujgco.webp', to: '/produits/pylor-health-sulfomas.png' },
  'moringa-vitalite': { from: '1792799984985-lo9rfs.webp', to: '/produits/moringa-premium.png' },
  'curcuma-poivre-noir': { from: '/images/products/curcuma-poivre-noir.svg', to: '/produits/curcuma-premium.png' },
};

/** Ordre de mise en avant : accueil (3 premiers) et tête de « Nos produits » (4) */
export const previewOrder = ['pylor-health-sulfomas', 'moringa-vitalite', 'curcuma-poivre-noir', 'digesta-premium'];

/** Digesta Premium : pas encore au catalogue, affiché « Bientôt disponible » (ni prix ni commande) */
const digesta: Product = {
  id: 'preview-digesta-premium',
  slug: 'digesta-premium',
  name: 'Digesta Premium',
  category_slug: 'complements',
  benefit: 'Gingembre et citron',
  description: null,
  ingredients: null,
  usage: null,
  price: 0,
  compare_at_price: null,
  image_url: '/produits/digesta-premium.png',
  gallery: [],
  rating: 5,
  reviews_count: 0,
  stock: null,
  is_bestseller: false,
  is_new: true,
  is_featured: false,
  is_active: true,
  sort_order: 0,
  new_order: 0,
  bestseller_order: 0,
  tagline: null,
  highlights: [],
  story: null,
  benefits: [],
  landing: { ...normalizeLanding(null), format: '500 mg | 60 gélules' },
  coming_soon: true,
};

export function applyPreview(products: Product[]): Product[] {
  const withVisuals = products.map((p) => {
    const v = previewVisuals[p.slug];
    return v && p.image_url?.endsWith(v.from) ? { ...p, image_url: v.to } : p;
  });
  const all = withVisuals.some((p) => p.slug === digesta.slug) ? withVisuals : [...withVisuals, digesta];
  const rank = (p: Product) => {
    const i = previewOrder.indexOf(p.slug);
    return i === -1 ? previewOrder.length : i;
  };
  // Tri stable : les 4 produits en tête, le reste du catalogue garde son ordre
  return [...all].sort((a, b) => rank(a) - rank(b));
}
