# ELROPHE — boutique de produits naturels

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Framer Motion · Lucide · Supabase.

- **Vitrine** : `/` (accueil), `/boutique`, `/meilleures-ventes`, `/nouveautes`, `/produit/[slug]`, `/panier`, `/commande`, `/favoris`, `/compte` (suivi de commande), `/a-propos`, `/contact`, `/mentions-legales`.
- **Pilotage** (back-office, même structure que `atelierzo/app/pilotage`) : `/pilotage` — tableau de bord, commandes, clients, produits, catégories, ingrédients, avis clients, newsletter et **Personnalisation** (couleurs, textes du hero et des sections, marque & contact, livraison et paiement).

## Installation

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés Supabase
```

### 1. Base de données (une seule fois)

Dans Supabase › **SQL Editor**, exécuter le contenu de [`supabase/elrophe-schema.sql`](supabase/elrophe-schema.sql).
Il crée les tables `elrophe_*` (le projet Supabase est partagé : tout est préfixé), les règles RLS,
la fonction de commande `elrophe_place_order` et le bucket d'images `elrophe-media`.
Le script est idempotent : on peut le relancer sans risque.

Tant que ce script n'est pas exécuté, le site affiche le contenu de démonstration de `data/`.

### 2. Accès au pilotage

Ouvrir `/pilotage` et saisir le code d'accès : **0044** par défaut.
Le modifier ensuite dans **Pilotage › Code d'accès** (4 à 32 chiffres ou lettres ; il est stocké haché, lisible uniquement par le serveur).
Techniquement, le code ouvre une session Supabase sur un compte administrateur partagé (`pilotage@elrophe.app`, créé automatiquement) :
les règles RLS restent celles d'un vrai compte admin. 5 essais par quart d'heure et par adresse IP.

### 3. Contenu de départ

Sur `/pilotage`, **Tableau de bord › Importer le catalogue** : catégories, produits,
ingrédients, avis et textes du site sont copiés depuis `data/` vers Supabase, et deviennent modifiables.
Équivalent en ligne de commande : `npm run seed` (n’écrase rien de ce qui existe déjà).

## Lancer

```bash
npm run dev      # développement → http://localhost:3000
npm run build && npm start   # production
```

## Fonctionnement

| Sujet | Où |
| --- | --- |
| Couleurs (tokens CSS) | `app/globals.css` (valeurs par défaut) + Pilotage › Personnalisation › Apparence |
| Textes et visuels par défaut | `data/site.ts`, catalogue de démo dans `data/catalog.ts` |
| Lecture des données (cache) | `lib/data.ts` — `'use cache'` + tag `elrophe`, invalidé par `/api/revalidate` à chaque enregistrement dans le pilotage |
| Commandes | `POST /api/orders` → RPC `elrophe_place_order` (prix relus en base, stock verrouillé) |
| Sécurité | RLS : lecture publique du catalogue visible, écriture réservée aux comptes de `elrophe_admins`. Commandes et newsletter passent uniquement par le serveur (clé service role). |

## Visuels

Les images de `public/images/` sont des **SVG provisoires** générés pour la maquette.
Remplacez-les depuis le pilotage (envoi d'image sur chaque produit, catégorie, ingrédient, et
Personnalisation › Accueil pour l'image du hero). Les images envoyées sont converties en WebP.
