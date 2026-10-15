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
  created_at?: string;
}

export interface ProductBenefit {
  title: string;
  text: string;
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
}

export interface ShopSettings {
  currency: string;
  shipping_fee: number;
  free_shipping_threshold: number;
  cash_on_delivery: boolean;
  mobile_money: boolean;
  mobile_money_instructions: string;
  delivery_info: string;
}

export interface SiteSettings {
  theme: ThemeSettings;
  hero: HeroSettings;
  sections: SectionsSettings;
  brand: BrandSettings;
  shop: ShopSettings;
}

export type SettingsKey = keyof SiteSettings;
