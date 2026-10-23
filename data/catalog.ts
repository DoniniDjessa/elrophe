import type { Category, Ingredient, Product, Solution, Testimonial } from '@/lib/types';

/**
 * Catalogue de démonstration. Utilisé tant que Supabase n'est pas configuré,
 * et importé en base depuis le pilotage (Tableau de bord > Importer le catalogue).
 */

type Seed<T> = Omit<T, 'id'>;

export const seedCategories: Seed<Category>[] = [
  { slug: 'complements', name: 'Compléments', description: 'Capsules et gélules aux actifs végétaux concentrés.', image_url: '/images/categories/complements.svg', sort_order: 1, is_active: true },
  { slug: 'huiles-essentielles', name: 'Huiles essentielles', description: 'Huiles pures, 100 % naturelles, pour le corps et l’esprit.', image_url: '/images/categories/huiles-essentielles.svg', sort_order: 2, is_active: true },
  { slug: 'tisanes', name: 'Tisanes', description: 'Infusions de plantes sélectionnées pour chaque moment.', image_url: '/images/categories/tisanes.svg', sort_order: 3, is_active: true },
  { slug: 'soins-visage', name: 'Soins visage', description: 'Sérums et crèmes aux huiles végétales précieuses.', image_url: '/images/categories/soins-visage.svg', sort_order: 4, is_active: true },
  { slug: 'soins-corps', name: 'Soins corps', description: 'Beurres et huiles nourrissantes pour toute la famille.', image_url: '/images/categories/soins-corps.svg', sort_order: 5, is_active: true },
  { slug: 'superaliments', name: 'Superaliments', description: 'Poudres végétales riches en nutriments.', image_url: '/images/categories/superaliments.svg', sort_order: 6, is_active: true },
];

const p = (
  slug: string,
  name: string,
  category_slug: string,
  price: number,
  benefit: string,
  description: string,
  extra: Partial<Seed<Product>> = {},
): Seed<Product> => ({
  slug,
  name,
  category_slug,
  benefit,
  description,
  ingredients: null,
  usage: null,
  price,
  compare_at_price: null,
  image_url: `/images/products/${slug}.svg`,
  gallery: [],
  rating: 4.8,
  reviews_count: 0,
  stock: null,
  is_bestseller: false,
  is_new: false,
  is_featured: false,
  is_active: true,
  sort_order: 0,
  new_order: 0,
  bestseller_order: 0,
  tagline: null,
  highlights: [],
  story: null,
  benefits: [],
  ...extra,
});

const catalog: Seed<Product>[] = [
  p('pylor-health-sulfomas', 'Pylor Health Sulfomas', 'complements', 18500, 'Confort gastrique et digestif',
    'Complément alimentaire en capsules, formulé pour accompagner l’équilibre de la flore gastrique et le confort digestif au quotidien. Flacon de 60 capsules, soit un mois de cure.',
    {
      image_url: '/images/hero-product-cutout.png',
      ingredients: 'Sulfomas (extrait végétal breveté), probiotiques Lactobacillus, vitamine C, magnésium. Gélule végétale.',
      usage: '2 capsules par jour avec un grand verre d’eau, avant le repas principal. Cure d’un mois, renouvelable.',
      rating: 4.9, reviews_count: 64, is_bestseller: true, is_new: true, is_featured: true,
      tagline: 'La cure de 30 jours qui prend soin de votre estomac, en douceur.',
      highlights: ['60 capsules · 1 mois de cure', 'Probiotiques + vitamine C', 'Fabriqué selon les normes GMP', 'Sans additif superflu'],
      story:
        'Brûlures, ballonnements, digestion lente : l’inconfort gastrique pèse sur tout le reste de la journée. Pylor Health Sulfomas associe un extrait végétal à des probiotiques sélectionnés pour soutenir l’équilibre naturel de la flore gastrique. Une formule courte, lisible et sans superflu, pensée pour une cure simple : deux capsules par jour pendant un mois.',
      benefits: [
        { title: 'Équilibre de la flore', text: 'Les probiotiques Lactobacillus accompagnent une flore gastrique et intestinale équilibrée.' },
        { title: 'Confort après les repas', text: 'Une formule pensée pour une digestion plus légère au quotidien.' },
        { title: 'Défenses naturelles', text: 'La vitamine C contribue au fonctionnement normal du système immunitaire.' },
      ],
    }),
  p('moringa-vitalite', 'Moringa Vitalité', 'complements', 12500, 'Énergie et vitalité au quotidien',
    'Feuilles de moringa oleifera séchées à basse température et mises en gélules végétales. Riche en fer, calcium et antioxydants, il soutient la vitalité et réduit la sensation de fatigue.',
    { ingredients: 'Poudre de feuille de moringa (Moringa oleifera) 500 mg, gélule végétale (HPMC).', usage: '2 gélules par jour avec un grand verre d’eau, de préférence le matin.', rating: 4.9, reviews_count: 128, is_bestseller: true, sort_order: 1 }),
  p('curcuma-poivre-noir', 'Curcuma & Poivre noir', 'complements', 13500, 'Confort articulaire et digestion',
    'Association synergique de curcuma longa et de pipérine pour une meilleure assimilation des curcuminoïdes. Soutient la souplesse articulaire et le confort digestif.',
    { ingredients: 'Curcuma (Curcuma longa) 450 mg, poivre noir (Piper nigrum) 5 mg, gélule végétale.', usage: '2 gélules par jour au cours d’un repas.', rating: 4.8, reviews_count: 96, is_bestseller: true, sort_order: 2 }),
  p('ashwagandha-serenite', 'Ashwagandha Sérénité', 'complements', 14900, 'Gestion du stress et sommeil',
    'Racine d’ashwagandha, plante adaptogène de la tradition ayurvédique, pour aider l’organisme à mieux gérer le stress et retrouver un sommeil réparateur.',
    { ingredients: 'Extrait de racine d’ashwagandha (Withania somnifera) 300 mg, gélule végétale.', usage: '1 à 2 gélules par jour, le soir.', rating: 4.7, reviews_count: 74, is_new: true, sort_order: 3 }),
  p('spiruline-bio', 'Spiruline Bio', 'superaliments', 11000, 'Protéines végétales et fer',
    'Spiruline cultivée en bassins contrôlés, séchée à basse température. Source naturelle de protéines, de fer et de vitamine B12.',
    { ingredients: 'Spiruline (Arthrospira platensis) 100 %.', usage: '1 cuillère à café (3 g) par jour dans un jus ou un smoothie.', rating: 4.8, reviews_count: 112, is_bestseller: true, sort_order: 4 }),
  p('baobab-poudre', 'Poudre de Baobab', 'superaliments', 7500, 'Vitamine C et fibres',
    'Pulpe de fruit de baobab récoltée en Afrique de l’Ouest. Naturellement riche en vitamine C et en fibres prébiotiques.',
    { ingredients: 'Pulpe de fruit de baobab (Adansonia digitata) 100 %.', usage: '1 à 2 cuillères à café par jour dans un yaourt, un jus ou une bouillie.', rating: 4.6, reviews_count: 38, is_new: true, sort_order: 5 }),
  p('huile-lavande', 'Huile essentielle de Lavande', 'huiles-essentielles', 8500, 'Détente et sommeil apaisé',
    'Lavande vraie distillée à la vapeur d’eau. Quelques gouttes en diffusion ou sur l’oreiller pour une atmosphère apaisante.',
    { ingredients: 'Huile essentielle de lavande vraie (Lavandula angustifolia) 100 %. 10 ml.', usage: 'Diffusion : 5 gouttes. Usage cutané : diluer dans une huile végétale.', rating: 4.9, reviews_count: 61, sort_order: 6 }),
  p('huile-eucalyptus', 'Huile essentielle d’Eucalyptus', 'huiles-essentielles', 8000, 'Respiration et fraîcheur',
    'Eucalyptus radiata pour dégager les voies respiratoires et purifier l’air de la maison.',
    { ingredients: 'Huile essentielle d’eucalyptus radié (Eucalyptus radiata) 100 %. 10 ml.', usage: 'Diffusion ou inhalation : 3 à 5 gouttes. Ne pas avaler.', rating: 4.7, reviews_count: 29, sort_order: 7 }),
  p('tisane-nuit-calme', 'Tisane Nuit Calme', 'tisanes', 6500, 'Endormissement naturel',
    'Mélange de verveine, camomille et citronnelle pour préparer le corps au sommeil. 20 sachets en coton biodégradable.',
    { ingredients: 'Verveine, camomille, citronnelle, fleur d’oranger.', usage: '1 sachet dans 25 cl d’eau frémissante, infuser 5 minutes.', rating: 4.8, reviews_count: 54, sort_order: 8 }),
  p('tisane-detox', 'Tisane Détox Kinkéliba', 'tisanes', 6000, 'Digestion et légèreté',
    'Feuilles de kinkéliba, gingembre et menthe : l’infusion traditionnelle revisitée pour une digestion légère.',
    { ingredients: 'Kinkéliba, gingembre, menthe poivrée.', usage: '1 à 2 tasses par jour après les repas.', rating: 4.6, reviews_count: 31, is_new: true, sort_order: 9 }),
  p('serum-eclat-baobab', 'Sérum Éclat au Baobab', 'soins-visage', 16500, 'Teint lumineux et unifié',
    'Sérum léger à l’huile de baobab et à la vitamine C naturelle. Pénètre rapidement et révèle l’éclat du teint.',
    { ingredients: 'Huile de baobab, huile de jojoba, extrait d’hibiscus, vitamine E. 30 ml.', usage: '3 gouttes matin et soir sur peau propre.', rating: 4.9, reviews_count: 87, is_bestseller: true, compare_at_price: 19500, sort_order: 10 }),
  p('creme-karite-visage', 'Crème Karité Hydratante', 'soins-visage', 12000, 'Hydratation 24 h',
    'Crème fondante au beurre de karité non raffiné et à l’aloe vera pour les peaux sèches à normales.',
    { ingredients: 'Beurre de karité, aloe vera, huile d’amande douce, glycérine végétale. 50 ml.', usage: 'Appliquer matin et soir sur le visage et le cou.', rating: 4.7, reviews_count: 45, sort_order: 11 }),
  p('beurre-karite-corps', 'Beurre de Karité Pur', 'soins-corps', 7000, 'Nutrition intense',
    'Beurre de karité brut, pressé à froid par des coopératives de femmes. Nourrit peau, cheveux et lèvres.',
    { ingredients: 'Beurre de karité (Butyrospermum parkii) 100 %. 200 g.', usage: 'Chauffer une noisette entre les mains et appliquer sur peau sèche.', rating: 4.9, reviews_count: 142, is_bestseller: true, sort_order: 12 }),
  p('huile-coco-corps', 'Huile de Coco Vierge', 'soins-corps', 6500, 'Peau douce et cheveux brillants',
    'Huile de coco vierge pressée à froid, multi-usage : corps, cheveux et démaquillage.',
    { ingredients: 'Huile de coco vierge (Cocos nucifera) 100 %. 250 ml.', usage: 'Appliquer sur peau humide ou en bain d’huile sur les longueurs.', rating: 4.7, reviews_count: 58, sort_order: 13 }),
];

/** Ordres de la boutique et des collections déduits de la liste ci-dessus */
let newRank = 0;
let bestRank = 0;
export const seedProducts: Seed<Product>[] = catalog.map((product, i) => ({
  ...product,
  sort_order: i + 1,
  new_order: product.is_new ? ++newRank : 0,
  bestseller_order: product.is_bestseller ? ++bestRank : 0,
}));

export const seedTestimonials: Seed<Testimonial>[] = [
  { name: 'Aïcha K.', location: 'Abidjan', rating: 5, avatar_url: null, product_name: 'Moringa Vitalité', is_active: true, sort_order: 1,
    text: 'Je prends le Moringa depuis deux mois : beaucoup moins de coups de fatigue l’après-midi. Livraison rapide et emballage soigné.' },
  { name: 'Serge D.', location: 'Bouaké', rating: 5, avatar_url: null, product_name: 'Curcuma & Poivre noir', is_active: true, sort_order: 2,
    text: 'Mes genoux me remercient. Produit sérieux, composition claire, et le service client répond vraiment.' },
  { name: 'Mariam T.', location: 'Yamoussoukro', rating: 5, avatar_url: null, product_name: 'Sérum Éclat au Baobab', is_active: true, sort_order: 3,
    text: 'Le sérum au baobab a changé ma routine. Teint plus lumineux en trois semaines, sans effet gras.' },
  { name: 'Jean-Marc A.', location: 'San-Pédro', rating: 4, avatar_url: null, product_name: 'Tisane Nuit Calme', is_active: true, sort_order: 4,
    text: 'La tisane du soir est devenue un rituel familial. Goût doux, on dort mieux.' },
  { name: 'Fatou B.', location: 'Abidjan', rating: 5, avatar_url: null, product_name: 'Beurre de Karité Pur', is_active: true, sort_order: 5,
    text: 'Un karité d’une qualité rare, très fondant. J’en commande pour toute la famille.' },
];

export const seedIngredients: Seed<Ingredient>[] = [
  { name: 'Moringa', latin_name: 'Moringa oleifera', benefit: 'Riche en fer et en antioxydants, il soutient l’énergie et l’immunité.', image_url: '/images/ingredients/moringa.svg', is_active: true, sort_order: 1 },
  { name: 'Curcuma', latin_name: 'Curcuma longa', benefit: 'Ses curcuminoïdes favorisent le confort articulaire et digestif.', image_url: '/images/ingredients/curcuma.svg', is_active: true, sort_order: 2 },
  { name: 'Spiruline', latin_name: 'Arthrospira platensis', benefit: 'Micro-algue riche en protéines végétales, en fer et en vitamine B12.', image_url: '/images/ingredients/spiruline.svg', is_active: true, sort_order: 3 },
  { name: 'Ashwagandha', latin_name: 'Withania somnifera', benefit: 'Plante adaptogène qui aide à mieux gérer le stress et le sommeil.', image_url: '/images/ingredients/ashwagandha.svg', is_active: true, sort_order: 4 },
];

// Les produits de chaque solution se cochent dans Pilotage › Solutions
export const seedSolutions: Seed<Solution>[] = [
  { slug: 'sante-du-foie', title: 'Santé du foie', description: 'Des plantes qui accompagnent la détoxification et le bon fonctionnement du foie.', image_url: '/images/products/tisane-detox.svg', product_ids: [], is_active: true, sort_order: 1 },
  { slug: 'sante-des-reins', title: 'Santé des reins', description: 'Une sélection pour soutenir l’élimination et le confort urinaire au quotidien.', image_url: '/images/categories/tisanes.svg', product_ids: [], is_active: true, sort_order: 2 },
  { slug: 'vitalite', title: 'Vitalité', description: 'Énergie, tonus et résistance à la fatigue grâce aux superaliments.', image_url: '/images/products/moringa-vitalite.svg', product_ids: [], is_active: true, sort_order: 3 },
  { slug: 'confort-digestif', title: 'Confort digestif', description: 'Pour une digestion légère et un ventre apaisé.', image_url: '/images/products/curcuma-poivre-noir.svg', product_ids: [], is_active: true, sort_order: 4 },
  { slug: 'sommeil-serenite', title: 'Sommeil & sérénité', description: 'Retrouvez des nuits calmes et gérez mieux le stress.', image_url: '/images/products/tisane-nuit-calme.svg', product_ids: [], is_active: true, sort_order: 5 },
];

/** Version avec identifiants stables, utilisée comme repli quand la base n'est pas configurée */
const withIds = <T,>(prefix: string, rows: Seed<T>[]) =>
  rows.map((row, i) => ({ id: `${prefix}-${i + 1}`, ...row }) as T);

export const fallbackCategories = withIds<Category>('cat', seedCategories);
export const fallbackProducts = withIds<Product>('prd', seedProducts);
export const fallbackTestimonials = withIds<Testimonial>('tst', seedTestimonials);
export const fallbackIngredients = withIds<Ingredient>('ing', seedIngredients);
export const fallbackSolutions = withIds<Solution>('sol', seedSolutions);
