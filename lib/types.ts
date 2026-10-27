export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category_slug: string | null;
  benefit: string | null;
  description: string | null;
  ingredients: string | null;
  usage: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  gallery: string[];
  rating: number;
  reviews_count: number;
  /** null = stock non suivi */
  stock: number | null;
  is_bestseller: boolean;
  is_new: boolean;
  /** Produit du moment (un seul à la fois) */
  is_featured: boolean;
  is_active: boolean;
  /** Ordre dans la boutique */
  sort_order: number;
  /** Ordre dans « Nouveautés » et « Meilleures ventes » */
  new_order: number;
  bestseller_order: number;
  /* Contenu enrichi (page produit et mise en avant) */
  tagline: string | null;
  highlights: string[];
  story: string | null;
  benefits: ProductBenefit[];
  /** Contenu de la page /best-seller quand le produit est le produit spécial */
  landing?: ProductLanding | null;
  /** Pas encore en vente : affiché sans prix, non commandable */
  coming_soon?: boolean;
  created_at?: string;
}

export interface ProductBenefit {
  title: string;
  text: string;
}

export interface LandingSection {
  title: string;
  text: string;
  image_url: string | null;
  hidden?: boolean;
}

/** Offre du bloc « Commande directe » : prix relu en base au moment de la commande */
export interface LandingOffer {
  id: string;
  label: string;
  subtitle: string;
  price: number;
  compare_at_price: number | null;
  /** Unités déduites du stock pour 1 offre commandée */
  units: number;
  badge: string;
  sold_out: boolean;
  /** Masquée : ni affichée ni commandable */
  hidden: boolean;
}

export interface LandingFaq {
  question: string;
  answer: string;
  hidden?: boolean;
}

export interface LandingReview {
  name: string;
  location: string;
  text: string;
  hidden?: boolean;
}

/** Carte « Ingrédients principaux » de la page /best-seller */
export interface LandingIngredient {
  name: string;
  image_url: string | null;
  hidden?: boolean;
}

/** Blocs du produit que l'on peut afficher ou masquer (fiche produit, page /best-seller, accueil) */
export interface LandingBlocks {
  about: boolean;
  ingredient_cards: boolean;
  precautions: boolean;
  reasons: boolean;
  gallery: boolean;
  tagline: boolean;
  description: boolean;
  ingredients: boolean;
  usage: boolean;
  hero_text: boolean;
  highlights: boolean;
  trust: boolean;
  story: boolean;
  sections: boolean;
  benefits: boolean;
  reviews: boolean;
  faq: boolean;
}

/** Page de vente du produit spécial (/best-seller) */
export interface ProductLanding {
  /** Format et quantité affichés sur les cartes et la fiche (ex. 120 capsules | 500 mg) */
  format: string;
  /** Précautions et informations réglementaires (fiche produit) */
  precautions: string;
  /** Bannière : titre, texte et visuel (sinon nom, accroche et photo du produit) */
  hero_title: string;
  hero_text: string;
  hero_image: string | null;
  /** Pastille au-dessus du titre (ex. Santé digestive) */
  hero_badge: string;
  /** « À propos du produit » (vide : description du produit) */
  about_text: string;
  ingredient_cards: LandingIngredient[];
  /** « Pourquoi choisir … ? » */
  reasons: string[];
  reasons_image: string | null;
  blocks: LandingBlocks;
  /** Arguments courts sous la bannière (livraison, qualité…) */
  trust: string[];
  sections: LandingSection[];
  reviews: LandingReview[];
  offers: LandingOffer[];
  faq: LandingFaq[];
  order_title: string;
  order_subtitle: string;
  order_badge: string;
  delivery_title: string;
  delivery_text: string;
  /** Livraison offerte pour les commandes passées depuis la page */
  free_shipping: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  text: string;
  rating: number;
  avatar_url: string | null;
  product_name: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Ingredient {
  id: string;
  name: string;
  latin_name: string | null;
  benefit: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

/** Solution bien-être (Santé du foie, Vitalité…) : carte sous le hero et page qui liste ses produits */
export interface Solution {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  /** Produits affichés sur la page de la solution, dans cet ordre */
  product_ids: string[];
  is_active: boolean;
  sort_order: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  product_id: string;
  slug: string;
  name: string;
  image_url: string | null;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  city: string | null;
  notes: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  status: OrderStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

/* ---------- Réglages personnalisables depuis le pilotage ---------- */

export interface ThemeSettings {
  bg_sage: string;
  bg_sage_light: string;
  surface_cream: string;
  forest: string;
  ink: string;
  ink_muted: string;
  leaf: string;
  lime: string;
}

export interface Badge {
  icon: 'leaf' | 'flask' | 'ban' | 'rabbit' | 'sprout' | 'shield' | 'droplet' | 'sparkles';
  line1: string;
  line2: string;
}

export interface HeroSettings {
  eyebrow: string;
  eyebrow_accent: string;
  title_line1: string;
  title_line2: string;
  script: string;
  subtitle: string;
  cta_label: string;
  cta_href: string;
  video_label: string;
  video_sublabel: string;
  video_url: string;
  image_url: string;
  image_alt: string;
  badges: Badge[];
  /** Texte tapé lettre par lettre au-dessus du surtitre (vide : masqué) */
  typed_text: string;
  /** Étiquette animée sur l'image (vide : masquée) */
  recommended_label: string;
  recommended_cta: string;
  /** Vide : page du produit du moment */
  recommended_href: string;
  /** Accueil : barre de navigation transparente posée sur l'image du hero (sinon fond clair) */
  transparent_nav: boolean;
}

export interface SectionHeading {
  eyebrow: string;
  eyebrow_accent: string;
  title: string;
  script: string;
  text: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface RitualStep {
  title: string;
  text: string;
}

/** Habillage de la section « Produit du moment » ; le produit et ses textes se gèrent dans Boutique */
export interface FeaturedSettings {
  visible: boolean;
  eyebrow: string;
  eyebrow_accent: string;
  script: string;
  cta_label: string;
}

export interface SectionsSettings {
  featured: FeaturedSettings;
  solutions: SectionHeading & { visible: boolean };
  categories: { title: string; link_label: string; visible: boolean };
  bestsellers: SectionHeading & { visible: boolean };
  philosophy: SectionHeading & { visible: boolean; image_url: string; stats: Stat[]; cta_label: string };
  ritual: SectionHeading & { visible: boolean; steps: RitualStep[] };
  ingredients: SectionHeading & { visible: boolean };
  testimonials: SectionHeading & { visible: boolean };
  newsletter: SectionHeading & { visible: boolean; button_label: string; success_message: string };
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
}

export interface BrandSettings {
  name: string;
  tagline: string;
  footer_text: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  socials: SocialLinks;
  announcement: string;
  /** Logo complet (pied de page) */
  logo_url: string;
  /** Emblème seul (barre de navigation, menu mobile) */
  icon_url: string;
  /** Sous le nom dans le menu mobile */
  slogan: string;
  /** Pays de présence : drapeaux de l'en-tête (codes ISO, ex. ci, in, us) */
  countries: string[];
  /** Bande défilante au-dessus de la barre de navigation (vide : masquée) */
  marquee: string[];
  /** Référencement : titre et méta-description de l'accueil (résultats Google, partages) */
  seo_title: string;
  seo_description: string;
}

export interface ShopSettings {
  currency: string;
  shipping_fee: number;
  free_shipping_threshold: number;
  cash_on_delivery: boolean;
  mobile_money: boolean;
  mobile_money_instructions: string;
  delivery_info: string;
  /** Politique de retour, affichée sur les fiches produit */
  returns_info: string;
}

/** Informations légales (Pilotage › Personnalisation › Légal) : mentions légales et CGV */
export interface LegalSettings {
  /** Raison sociale (ex. EL ROPHE SARL) */
  company: string;
  legal_form: string;
  capital: string;
  rccm: string;
  /** Numéro de compte contribuable (Côte d'Ivoire) */
  ncc: string;
  address: string;
  director: string;
  host_name: string;
  host_address: string;
  /** Date de dernière mise à jour des CGV et mentions */
  updated_at: string;
}

export interface SiteSettings {
  theme: ThemeSettings;
  hero: HeroSettings;
  sections: SectionsSettings;
  brand: BrandSettings;
  shop: ShopSettings;
  legal: LegalSettings;
}

export type SettingsKey = keyof SiteSettings;
