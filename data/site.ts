import type { SiteSettings } from '@/lib/types';

/**
 * Valeurs par défaut du site. Le pilotage (Personnalisation) enregistre ses modifications
 * dans la table elrophe_settings ; elles sont fusionnées par-dessus ces valeurs.
 */
export const defaultSettings: SiteSettings = {
  // Charte graphique (globals.css) : modifiable dans Pilotage › Personnalisation › Apparence
  theme: {
    ivory: '#F6F3EC',
    forest: '#17372C',
    champagne: '#C4AD86',
    anthracite: '#302F2A',
    muted: '#625F56',
    sage: '#78816B',
  },

  hero: {
    transparent_nav: false,
    kicker: 'EL ROPHE',
    heading: 'La nature nous inspire.',
    heading_accent: 'La qualité nous distingue.',
    intro: 'Une sélection exigeante de produits naturels haut de gamme, où tradition botanique et innovation se rencontrent.',
    button_label: 'Découvrir nos produits',
    button_href: '/boutique',
    photo_desktop: '/images/refonte/hero-desktop.png',
    photo_mobile: '/images/refonte/hero-mobile.png',
    photo_alt: 'Pylor Health Sulfomas, flacon de 120 capsules, entouré de feuillages, de fleurs de jasmin et de gingembre',
  },

  home: {
    selection: { kicker: 'Notre sélection', title: 'Une sélection pensée avec exigence.' },
    spotlight: { visible: true, badge: 'Notre best-seller', title: '', text: '', points: [], image_url: '', button_label: 'Découvrir le best-seller', show_price: true },
    maison: {
      kicker: 'Notre maison',
      title: 'L’exigence au cœur\nde notre maison.',
      paragraphs: [
        'Chez EL ROPHE, nous accordons une attention particulière à la sélection de nos produits, à la qualité des formulations et au choix de nos laboratoires partenaires.',
        'Notre ambition est de réunir les savoirs botaniques et les approches contemporaines dans une démarche de qualité, de sécurité et de transparence.',
      ],
      button_label: 'Découvrir notre maison',
      image_url: '/images/refonte/maison-feuille.png',
      image_alt: 'Feuille fraîche couverte de gouttes de rosée',
    },
    engagements: {
      kicker: 'Nos engagements',
      items: [
        { title: 'Sélection exigeante', text: 'Des produits choisis selon des critères de qualité clairement définis.' },
        { title: 'Qualité documentée', text: 'Des informations disponibles sur les formulations, les fabricants et les contrôles réalisés.' },
        { title: 'Transparence', text: 'Des compositions et des conseils d’utilisation présentés clairement.' },
      ],
    },
    reviews: { kicker: 'Témoignages clients', title: 'Ils partagent leur expérience.' },
  },

  brand: {
    countries: ['in', 'ca', 'us'],
    seo_title: 'EL ROPHE | Produits Naturels Haut de Gamme',
    seo_description:
      'Découvrez EL ROPHE, une maison de produits naturels haut de gamme. Formulations sélectionnées avec exigence, qualité et transparence pour votre bien-être.',
    marquee: ['Livraison fluide et rapide', 'Paiement à la livraison', 'Produits naturels sélectionnés', 'Service client à votre écoute'],
    name: 'El Rophe',
    footer_quote: 'La nature nous inspire.\nLa qualité nous distingue.',
    email: 'contact@elrophe.com',
    phone: '+225 07 00 00 00 00',
    whatsapp: '2250700000000',
    address: 'Abidjan, Côte d’Ivoire',
    hours: 'Lun – Sam · 8h – 19h',
    socials: { instagram: '', facebook: '', tiktok: '', youtube: '' },
    icon_url: '/icon2.png',
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
    returns_info:
      'Un produit abîmé ou non conforme à la livraison ? Signalez-le-nous sous 48 h : nous le remplaçons. Pour des raisons d’hygiène, un produit ouvert ne peut être ni repris ni échangé.',
    order_success_title: 'Merci pour votre commande',
    order_success_message: 'Votre commande est bien enregistrée. Nous vous appelons très vite pour confirmer la livraison.',
  },
  legal: {
    company: '',
    legal_form: '',
    capital: '',
    rccm: '',
    ncc: '',
    address: '',
    director: '',
    host_name: '',
    host_address: '',
    updated_at: '',
  },
};
