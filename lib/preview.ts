import { normalizeLanding } from './landing';
import type { Product } from './types';

/**
 * Préversion de la refonte (branche refonte-premium) : nouveaux visuels produit fournis par le client.
 * Aucune écriture en base : les images sont remplacées à la lecture, noms et prix restent ceux du catalogue.
 * À retirer une fois les visuels téléversés dans Pilotage › Boutique.
 */
export const previewVisuals: Record<string, string> = {
  'pylor-health-sulfomas': '/produits/pylor-health-sulfomas.png',
  'moringa-vitalite': '/produits/moringa-premium.png',
  'curcuma-poivre-noir': '/produits/curcuma-premium.png',
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
  const withVisuals = products.map((p) => (previewVisuals[p.slug] ? { ...p, image_url: previewVisuals[p.slug] } : p));
  const all = withVisuals.some((p) => p.slug === digesta.slug) ? withVisuals : [...withVisuals, digesta];
  const rank = (p: Product) => {
    const i = previewOrder.indexOf(p.slug);
    return i === -1 ? previewOrder.length : i;
  };
  // Tri stable : les 4 produits en tête, le reste du catalogue garde son ordre
  return [...all].sort((a, b) => rank(a) - rank(b));
}
