# Projet : site vitrine e-commerce « ELROPHE » — produits naturels

## Rôle
Tu es un développeur front-end senior avec un vrai sens du design. Tu construis la page d'accueil
d'ELROPHE, une marque de produits naturels (compléments en capsules, huiles, soins). Le rendu doit
être premium, doux, organique : niveau d'un site de marque haut de gamme, pas un template générique.

## Stack
- Si un projet existe déjà dans ce dossier : respecte sa stack.
- Sinon : Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion, icônes Lucide.
- Composants découpés proprement (`Navbar`, `Hero`, `TrustBadges`, `CategoryGrid`, etc.).
- Responsive complet (mobile 375px → desktop 1440px), accessible (contrastes AA, alt, focus visibles).

## Identité visuelle (à respecter strictement)

### Couleurs (tokens CSS)
--bg-sage:        #C9CBB9   /* fond principal, vert sauge grisé */
--bg-sage-light:  #DEDFD0   /* zones claires, reflets */
--surface-cream:  #F3F0E8   /* pilules, cartes claires */
--forest:         #1E3524   /* boutons principaux, onglet actif */
--ink:            #1A211B   /* titres et texte */
--ink-muted:      #4E554C   /* texte secondaire */
--leaf:           #3F7D34   /* accent : texte manuscrit, petits détails */
--lime:           #B6E15A   /* pastille du panier uniquement */
--line:           rgba(30,53,36,0.15) /* bordures fines */

### Typographie
- Titres : sans-serif géométrique très gras, serré (Plus Jakarta Sans 800, letter-spacing -0.02em).
- Accent manuscrit : police script élégante (Allura ou Great Vibes), couleur --leaf, avec un
  léger soulignement tracé à la main (SVG) sous le mot.
- Surtitres : petites capitales espacées (letter-spacing 0.3em, 11–12px), avec un mot en --leaf
  et une fine ligne horizontale qui prolonge le surtitre.
- Texte courant : Inter, 15–16px, --ink-muted.

### Matières et détails
- Coins très arrondis : pilules (999px), cartes 18–20px.
- Effet verre dépoli léger sur la navbar et les boutons ronds (backdrop-blur, fond crème à 80 %).
- Ombres très douces et diffuses, jamais dures.
- Bordures fines 1px (--line). Beaucoup d'air, rien de chargé.

## Arrière-plan (à générer en CSS, pas d'image)
Fond de page sauge, lumineux et organique :
1. Base : --bg-sage.
2. Halos : 2–3 `radial-gradient` superposés (crème en haut à gauche, vert un peu plus sombre en
   bas à droite) pour un éclairage naturel.
3. Grain : une texture de bruit SVG (`feTurbulence`) en superposition à ~4 % d'opacité.
4. Ombres de feuilles : crée `public/images/leaf-shadow.svg` (silhouettes de feuilles de palmier
   floues), placé en haut à droite du hero, opacité ~12 %, `filter: blur(6px)`,
   avec une très lente animation de balancement (respecter prefers-reduced-motion).

## Page d'accueil — sections

### 1. Navbar
- Logo à gauche : petite fleur/feuille stylisée (SVG) + « ELROPHE » en capitales espacées.
- Au centre, une pilule crème contenant : icône maison, Accueil (onglet actif = pilule --forest,
  texte blanc), Boutique, Meilleures ventes, Nouveautés, Rituels bien-être, À propos, Contact.
- À droite, trois boutons ronds en verre : panier (avec pastille --lime affichant le nombre),
  favoris (cœur), compte (utilisateur).
- Mobile : menu burger, panneau plein écran.

### 2. Hero (deux colonnes)
Colonne gauche :
- Surtitre : « COLLECTION ÉQUILIBRE NATUREL » (le mot « NATUREL » en --leaf) + ligne fine.
- Titre en 2 lignes : « Le meilleur de la nature. » / « Au cœur de votre bien-être, »
- Ligne manuscrite dessous : « chaque jour. » (police script, grande, --leaf, soulignement SVG).
- Sous-texte : « Pur. Efficace. Responsable. Des produits naturels pensés pour vous. »
- Actions : bouton pilule --forest « DÉCOUVRIR » + flèche → ; à côté, bouton rond crème avec
  icône lecture + texte « Notre engagement » / « Voir la vidéo ».
- Rangée de 3 badges de confiance (icône au trait dans un cercle fin + libellé sur 2 lignes) :
  Ingrédients naturels · Testé en laboratoire · Sans additifs.

Colonne droite :
- Image principale : `public/images/hero-capsule.png` (déjà fournie), via `next/image`, priority.
- Derrière l'image : un grand cercle fin (1px, crème semi-transparent) qui dépasse légèrement,
  comme un halo.
- Quelques feuilles vertes floues au premier plan en bas à droite (profondeur).
- Apparition douce : fondu + léger mouvement vers le haut, image légèrement décalée dans le temps.

### 3. Acheter par catégorie
- En-tête : « Acheter par catégorie » à gauche, ligne fine qui s'étire, lien « Voir tous les
  produits → » à droite.
- 6 cartes en ligne (desktop), carrousel horizontal défilant (mobile) :
  Compléments · Huiles essentielles · Tisanes · Soins visage · Soins corps · Superaliments.
- Chaque carte : photo produit sur fond beige avec pierres et feuilles (placeholders élégants
  en attendant les vraies images : `public/images/categories/*.jpg`), dégradé sombre en bas,
  nom en blanc gras, « Acheter → » en petit dessous.
- Survol : zoom léger de l'image, flèche qui glisse.

## Sections à imaginer (non visibles sur la maquette)
Prolonge exactement le même langage visuel : mêmes couleurs, mêmes pilules, mêmes surtitres
espacés, même accent manuscrit utilisé avec parcimonie (une fois par section maximum).

4. Meilleures ventes : 4 cartes produit (image, nom, bénéfice court, note étoiles, prix,
   bouton rond « + » --forest, cœur favoris). Onglets en pilules : Tous / Compléments / Soins.
5. Notre philosophie : bloc deux colonnes, grande photo arrondie + texte, avec 3 chiffres clés
   (ex. « 100 % origine naturelle », « 0 additif », « 12 000+ clients »).
6. Le rituel ELROPHE : 3 étapes numérotées (01 / 02 / 03) reliées par une ligne fine.
7. Ingrédients phares : grille de 4 ingrédients (moringa, curcuma, spiruline, ashwagandha)
   avec illustration, nom et bienfait.
8. Avis clients : carrousel de témoignages sur cartes crème, avatar rond, étoiles.
9. Newsletter : grande carte --forest, titre blanc avec un mot en script --lime, champ email
   en pilule + bouton crème.
10. Footer : logo, courte phrase de marque, 4 colonnes de liens, réseaux sociaux en boutons
    ronds, mentions légales. Fond légèrement plus sombre que la page.

## Contenu et données
- Tout le texte en français.
- Produits et catégories dans un fichier `data/` (tableau typé) pour faciliter le remplacement.
- Aucun texte « lorem ipsum » : rédige des textes crédibles et courts.

## Qualité attendue
- Animations sobres au scroll (fondu + 16px de déplacement), jamais d'effets tape-à-l'œil.
- Lighthouse : performance et accessibilité ≥ 90.
- Code propre, sans duplication, tokens de couleur centralisés.
- À la fin : lance le projet, vérifie le rendu desktop et mobile, corrige ce qui dépasse,
  et dis-moi comment le lancer.