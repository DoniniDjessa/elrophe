-- Page /best-seller de « Pylor Health Sulfomas » (produit spécial)
-- À exécuter dans l'éditeur SQL de Supabase, après migration-page-de-vente.sql.
-- Remplace uniquement la page de vente du produit ; tout reste modifiable dans Pilotage › Boutique › Produit spécial.
-- Les avis clients sont laissés vides : à remplir avec de vrais retours dans le pilotage.

update public.elrophe_products
set landing = $json$
{
  "hero_title": "Pylor Health Sulfomas",
  "hero_text": "Brûlures, ballonnements, remontées acides ? Une formule nutraceutique premium, avec 4 actifs complémentaires, pour retrouver un estomac apaisé au quotidien.",
  "hero_image": null,
  "trust": ["Livraison express gratuite sous 24 h", "Paiement uniquement à la livraison", "4 actifs premium dans une gélule", "Conseil personnalisé par téléphone"],
  "reviews": [],
  "sections": [
    {
      "title": "Votre estomac mérite mieux que l’inconfort",
      "text": "Brûlures après le repas, ventre gonflé, remontées acides, sensation de lourdeur qui dure des heures… Ces petits signaux finissent par peser sur le quotidien : on mange moins bien, on dort moins bien, on profite moins.\n\nPylor Health Sulfomas a été pensé pour accompagner votre confort gastrique jour après jour, avec une formule complète plutôt qu’un simple actif isolé.",
      "image_url": "https://tvhqldvmmbslrcbcwhhs.supabase.co/storage/v1/object/public/elrophe-media/products/1792803887044-sujgco.webp"
    },
    {
      "title": "4 actifs complémentaires dans une seule gélule",
      "text": "• Pylopass™ : une souche brevetée de Lactobacillus reuteri, étudiée pour son interaction avec la muqueuse gastrique.\n• Sulforaphane : issu du brocoli, reconnu pour ses propriétés antioxydantes.\n• Gomme de mastic (Pistacia lentiscus) : une résine méditerranéenne utilisée depuis l’Antiquité pour le confort de l’estomac.\n• NAC (N-acétylcystéine) : étudiée pour son action sur le mucus gastrique.\n\nEnsemble, ils agissent en synergie pour soutenir l’équilibre de la flore gastrique et une digestion plus légère.",
      "image_url": null
    },
    {
      "title": "Une cure simple à suivre",
      "text": "1 à 2 gélules matin, midi et soir, au moment des repas, avec un grand verre d’eau. Pour de meilleurs résultats, suivez la cure complète d’un mois sans interruption.\n\nAssociez-la à quelques bons réflexes : repas réguliers, moins d’aliments gras, épicés ou très acides, et pas de coucher juste après le dîner.",
      "image_url": null
    },
    {
      "title": "Une qualité sans compromis",
      "text": "120 capsules par flacon, fabriquées en Inde, sans additif superflu. Chaque lot est sélectionné par notre équipe avant d’arriver chez vous.\n\nVous commandez en toute sérénité : nous vous appelons pour confirmer, nous livrons rapidement et vous ne payez qu’à la réception du colis.",
      "image_url": null
    }
  ],
  "offers": [
    {
      "id": "pylor60",
      "label": "1 flacon (60 gélules) 15 jours",
      "subtitle": "Cure début",
      "price": 22000,
      "compare_at_price": null,
      "units": 1,
      "badge": "",
      "sold_out": true,
      "hidden": false
    },
    {
      "id": "pylor120",
      "label": "1 flacon (120 gélules) 1 mois",
      "subtitle": "Populaire cas chronique",
      "price": 35000,
      "compare_at_price": null,
      "units": 1,
      "badge": "Populaire",
      "sold_out": false,
      "hidden": false
    }
  ],
  "faq": [
    {
      "question": "Quelle cure choisir ?",
      "answer": "Le flacon de 60 gélules (15 jours) permet de découvrir le produit. Pour un inconfort qui revient souvent, nous conseillons le flacon de 120 gélules : une cure complète d’un mois."
    },
    {
      "question": "Au bout de combien de temps vais-je ressentir les effets ?",
      "answer": "Chaque organisme est différent. La régularité est la clé : prenez vos gélules à chaque repas et suivez la cure jusqu’au bout pour en tirer le meilleur."
    },
    {
      "question": "Puis-je le prendre avec un traitement ?",
      "answer": "Si vous suivez un traitement médical, êtes enceinte ou allaitez, demandez l’avis de votre médecin ou de votre pharmacien avant de commencer. Ne convient pas aux enfants."
    },
    {
      "question": "Est-ce un médicament ?",
      "answer": "Non. Pylor Health Sulfomas est un complément alimentaire : il ne remplace pas une alimentation variée et équilibrée, ni un traitement prescrit. En cas de douleurs persistantes, consultez un médecin."
    },
    {
      "question": "Comment se passent la livraison et le paiement ?",
      "answer": "Après votre commande, nous vous appelons pour confirmer. Le colis est expédié sous 24 h ouvrées et vous payez uniquement à la réception, en espèces ou par Mobile Money."
    }
  ],
  "order_title": "Passez votre commande directe",
  "order_subtitle": "Choisissez l’offre qui vous convient",
  "order_badge": "Paiement uniquement à la livraison",
  "delivery_title": "Livraison express gratuite",
  "delivery_text": "Expédition sous 24 h ouvrées. Règlement sécurisé à la réception du colis.",
  "free_shipping": true
}
$json$::jsonb
where slug = 'pylor-health-sulfomas';
