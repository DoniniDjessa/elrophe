-- Page /best-seller (refonte) : contenu des nouvelles zones pour « Pylor Health Sulfomas »
-- À exécuter dans l'éditeur SQL de Supabase. Tout reste modifiable dans Pilotage › Boutique › Produit spécial.

-- 1) Nouvelles zones de la maquette : AJOUTÉES sans toucher au reste de la page.
--    Le site en ligne (branche main) ignore ces champs : sans effet sur lui.
update public.elrophe_products
set landing = coalesce(landing, '{}'::jsonb) || $json$
{
  "hero_badge": "Santé digestive",
  "about_text": "Pylor Health Sulfomas est une formule complète à base d’extraits végétaux soigneusement sélectionnés, pensée pour accompagner votre confort digestif au quotidien.",
  "ingredient_cards": [
    { "name": "Pylopass™", "image_url": "/images/refonte/ingredient-pylopass.png" },
    { "name": "Sulforaphane (brocoli)", "image_url": "/images/refonte/ingredient-brocoli.png" },
    { "name": "Gomme de mastic", "image_url": "/images/refonte/ingredient-mastic.png" },
    { "name": "NAC", "image_url": "/images/refonte/ingredient-nac.png" }
  ],
  "precautions": "Complément alimentaire. Ne se substitue pas à une alimentation variée et équilibrée ni à un mode de vie sain. Ne pas dépasser la dose journalière recommandée. Tenir hors de portée des enfants. Déconseillé aux femmes enceintes ou allaitantes.",
  "reasons": [
    "Formule naturelle et complète",
    "Ingrédients de qualité sélectionnés",
    "Adapté à une utilisation quotidienne",
    "Sans additifs inutiles"
  ]
}
$json$::jsonb
where slug = 'pylor-health-sulfomas';

-- 2) Textes communs avec la page de vente actuelle : À EXÉCUTER AU PASSAGE EN PRODUCTION
--    (ils modifient aussi le site en ligne). Ou les saisir directement dans le pilotage.
-- update public.elrophe_products
-- set landing = landing || $json$
-- {
--   "hero_text": "Complément alimentaire à base d’extraits végétaux sélectionnés.",
--   "trust": ["Ingrédients naturels", "Qualité contrôlée", "Livraison express gratuite"],
--   "order_title": "Commandez maintenant",
--   "order_subtitle": "Choisissez l’offre qui vous convient",
--   "delivery_text": "Expédition sous 24 h ouvrées. Paiement à la livraison."
-- }
-- $json$::jsonb
-- where slug = 'pylor-health-sulfomas';
