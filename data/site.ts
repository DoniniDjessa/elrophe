import type { SiteSettings } from '@/lib/types';

/**
 * Valeurs par défaut du site. Le pilotage (Personnalisation) enregistre ses modifications
 * dans la table elrophe_settings ; elles sont fusionnées par-dessus ces valeurs.
 */
export const defaultSettings: SiteSettings = {
  theme: {
    bg_sage: '#C9CBB9',
    bg_sage_light: '#DEDFD0',
    surface_cream: '#F3F0E8',
    forest: '#1E3524',
    ink: '#1A211B',
    ink_muted: '#4E554C',
    leaf: '#3F7D34',
    lime: '#B6E15A',
  },

  hero: {
    eyebrow: 'Collection équilibre',
    eyebrow_accent: 'naturel',
    title_line1: 'Le meilleur de la nature.',
    title_line2: 'Au cœur de votre bien-être,',
    script: 'chaque jour.',
    subtitle: 'Pur. Efficace. Responsable. Des produits naturels pensés pour vous.',
    cta_label: 'Découvrir',
    cta_href: '/boutique',
    video_label: 'Notre engagement',
    video_sublabel: 'Voir la vidéo',
    video_url: '',
    image_url: '/images/hero-product-cutout.png',
    image_alt: 'Flacon de compléments EL Rophe Health Pylor Health Sulfomas, 60 capsules',
    badges: [
      { icon: 'leaf', line1: 'Ingrédients', line2: 'naturels' },
      { icon: 'flask', line1: 'Testé en', line2: 'laboratoire' },
      { icon: 'ban', line1: 'Sans', line2: 'additifs' },
      { icon: 'rabbit', line1: 'Non testé sur', line2: 'les animaux' },
    ],
  },

  sections: {
    featured: {
      visible: true,
      eyebrow: 'Produit du',
      eyebrow_accent: 'moment',
      script: 'coup de cœur',
      cta_label: 'Ajouter au panier',
    },
    categories: { title: 'Acheter par catégorie', link_label: 'Voir tous les produits', visible: true },
    bestsellers: {
      visible: true,
      eyebrow: 'Les plus',
      eyebrow_accent: 'aimés',
      title: 'Meilleures ventes',
      script: 'adoptés',
      text: 'Les essentiels que nos clients rachètent, mois après mois.',
    },
    philosophy: {
      visible: true,
      eyebrow: 'Notre',
      eyebrow_accent: 'philosophie',
      title: 'Une nature exigeante, des formules honnêtes.',
      script: 'sincère',
      text:
        "Chez ELROPHE, chaque plante est choisie pour sa traçabilité et sa concentration en actifs. Nous travaillons avec des cultures locales et des laboratoires indépendants pour vous offrir des produits simples, sûrs et vraiment efficaces. Pas d'additifs superflus, pas de promesses creuses : seulement ce dont votre corps a besoin.",
      image_url: '/images/philosophy.svg',
      cta_label: 'En savoir plus',
      stats: [
        { value: '100 %', label: 'origine naturelle' },
        { value: '0', label: 'additif superflu' },
        { value: '12 000+', label: 'clients fidèles' },
      ],
    },
    ritual: {
      visible: true,
      eyebrow: 'Le rituel',
      eyebrow_accent: 'ELROPHE',
      title: 'Trois gestes pour prendre soin de vous',
      script: 'simplement',
      text: 'Un rituel court, pensé pour s’intégrer naturellement à vos journées.',
      steps: [
        { title: 'Choisir', text: 'Identifiez votre besoin : énergie, sommeil, immunité ou beauté de la peau.' },
        { title: 'Intégrer', text: 'Une prise par jour, au même moment, pour installer une habitude durable.' },
        { title: 'Ressentir', text: 'Après 3 à 4 semaines, observez les premiers bienfaits sur votre équilibre.' },
      ],
    },
    ingredients: {
      visible: true,
      eyebrow: 'Ingrédients',
      eyebrow_accent: 'phares',
      title: 'Le pouvoir des plantes',
      script: 'essentielles',
      text: 'Des actifs reconnus, sélectionnés à leur pic de concentration.',
    },
    testimonials: {
      visible: true,
      eyebrow: 'Ils nous font',
      eyebrow_accent: 'confiance',
      title: 'Avis clients',
      script: 'sincères',
      text: '',
    },
    newsletter: {
      visible: true,
      eyebrow: 'Newsletter',
      eyebrow_accent: '',
      title: 'Recevez nos conseils',
      script: 'bien-être',
      text: 'Rituels, nouveautés et offres réservées aux abonnés. Un e-mail par mois, pas plus.',
      button_label: "S'inscrire",
      success_message: 'Merci ! Votre inscription est confirmée.',
    },
  },

  brand: {
    name: 'ELROPHE',
    tagline: 'Produits naturels pour votre bien-être',
    footer_text: 'Des produits naturels, tracés et testés, pour prendre soin de vous chaque jour.',
    email: 'contact@elrophe.com',
    phone: '+225 07 00 00 00 00',
    whatsapp: '2250700000000',
    address: 'Abidjan, Côte d’Ivoire',
    hours: 'Lun – Sam · 8h – 19h',
    socials: { instagram: '', facebook: '', tiktok: '', youtube: '' },
    announcement: 'Livraison offerte dès 30 000 FCFA d’achat',
  },

  shop: {
    currency: 'FCFA',
    shipping_fee: 2000,
    free_shipping_threshold: 30000,
    cash_on_delivery: true,
    mobile_money: true,
    mobile_money_instructions:
      'Nous vous appelons pour confirmer la commande et vous transmettre le numéro Mobile Money (Orange, MTN, Moov, Wave).',
    delivery_info: 'Livraison sous 24 à 72 h à Abidjan, 3 à 5 jours ouvrés à l’intérieur du pays.',
  },
};
