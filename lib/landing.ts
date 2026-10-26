import type { LandingOffer, Product, ProductLanding } from './types';

/** Éléments affichés sur le site : les masqués restent dans le pilotage */
export const visible = <T extends { hidden?: boolean }>(items: T[]) => items.filter((x) => !x.hidden);

/** Page de vente du produit spécial */
export const SPECIAL_PATH = '/best-seller';

export const defaultLanding: ProductLanding = {
  hero_title: '',
  hero_text: '',
  hero_image: null,
  blocks: {
    gallery: true,
    tagline: true,
    description: true,
    ingredients: true,
    usage: true,
    hero_text: true,
    highlights: true,
    trust: true,
    story: true,
    sections: true,
    benefits: true,
    reviews: true,
    faq: true,
  },
  trust: ['Livraison express sous 24 h', 'Paiement à la livraison', 'Formule premium sélectionnée', 'Conseil personnalisé par téléphone'],
  sections: [],
  reviews: [],
  offers: [],
  faq: [],
  order_title: 'Passez votre commande directe',
  order_subtitle: 'Choisissez l’offre qui vous convient',
  order_badge: 'Paiement uniquement à la livraison',
  delivery_title: 'Livraison express gratuite',
  delivery_text: 'Expédition sous 24 h ouvrées. Règlement sécurisé à la réception du colis.',
  free_shipping: true,
};

export const newOfferId = () => Math.random().toString(36).slice(2, 10);

/** Complète une page de vente lue en base (champs manquants, valeurs vides) */
export function normalizeLanding(value: Partial<ProductLanding> | null | undefined): ProductLanding {
  const v = value ?? {};
  return {
    ...defaultLanding,
    ...v,
    hero_title: v.hero_title ?? '',
    hero_text: v.hero_text ?? '',
    hero_image: v.hero_image || null,
    blocks: { ...defaultLanding.blocks, ...v.blocks },
    trust: (v.trust ?? defaultLanding.trust).filter(Boolean),
    sections: (v.sections ?? []).filter((s) => s?.title || s?.text || s?.image_url),
    reviews: (v.reviews ?? []).filter((r) => r?.name && r?.text),
    faq: (v.faq ?? []).filter((f) => f?.question && f?.answer),
    offers: (v.offers ?? [])
      .filter((o) => o?.id && o.label && Number(o.price) > 0)
      .map((o) => ({
        ...o,
        subtitle: o.subtitle ?? '',
        badge: o.badge ?? '',
        price: Number(o.price),
        compare_at_price: o.compare_at_price ? Number(o.compare_at_price) : null,
        units: Math.max(1, Math.floor(Number(o.units) || 1)),
        sold_out: !!o.sold_out,
        hidden: !!o.hidden,
      })),
  };
}

/** Produit spécial : celui choisi dans le pilotage, sinon la meilleure vente la plus notée */
export const pickSpecialProduct = (products: Product[]) =>
  products.find((p) => p.is_featured) ??
  [...products].sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller) || b.reviews_count - a.reviews_count)[0];

/** Lien d'un produit : le produit spécial a sa propre page */
export const productHref = (product: Pick<Product, 'slug' | 'is_featured'>) => (product.is_featured ? SPECIAL_PATH : `/produit/${product.slug}`);

export const emptyVariant = (): LandingOffer => ({
  id: newOfferId(),
  label: '',
  subtitle: '',
  price: 0,
  compare_at_price: null,
  units: 1,
  badge: '',
  sold_out: false,
  hidden: false,
});

/** Variantes visibles du produit, sinon le produit à l'unité */
export function landingOffers(product: Product): LandingOffer[] {
  const offers = (product.landing?.offers ?? []).filter((o) => !o.hidden);
  if (offers.length) return offers;
  return [
    {
      id: '',
      label: product.name,
      subtitle: product.benefit ?? '',
      price: product.price,
      compare_at_price: product.compare_at_price,
      units: 1,
      badge: '',
      sold_out: false,
      hidden: false,
    },
  ];
}

/** Rupture : cochée à la main, ou stock suivi insuffisant pour une offre */
export const offerSoldOut = (product: Product, offer: LandingOffer, quantity = 1) =>
  offer.sold_out || (product.stock !== null && product.stock < offer.units * quantity);

/**
 * Applique les blocs et éléments masqués dans le pilotage : le site ne reçoit que ce qui est affiché
 * (fiche produit, page /best-seller, produit spécial de l'accueil). Le pilotage lit, lui, les données brutes.
 */
export function applyVisibility(product: Product): Product {
  const landing = normalizeLanding(product.landing);
  const show = landing.blocks;
  return {
    ...product,
    gallery: show.gallery ? product.gallery : [],
    tagline: show.tagline ? product.tagline : null,
    description: show.description ? product.description : null,
    ingredients: show.ingredients ? product.ingredients : null,
    usage: show.usage ? product.usage : null,
    highlights: show.highlights ? product.highlights : [],
    story: show.story ? product.story : null,
    benefits: show.benefits ? product.benefits : [],
    landing: product.landing
      ? {
          ...landing,
          hero_text: show.hero_text ? landing.hero_text : '',
          trust: show.trust ? landing.trust : [],
          sections: show.sections ? visible(landing.sections) : [],
          reviews: show.reviews ? visible(landing.reviews) : [],
          faq: show.faq ? visible(landing.faq) : [],
        }
      : null,
  };
}
