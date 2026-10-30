-- Blog (à exécuter une fois dans l'éditeur SQL de Supabase)
-- Crée la table des articles, ses règles d'accès, le compteur de vues et 4 articles d'exemple.
-- Peut être relancé sans risque : les articles d'exemple ne sont ajoutés que si leur slug n'existe pas.

create table if not exists public.elrophe_blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_url text,
  cover_alt text not null default '',
  -- Catégorie définie dans Pilotage › Blog › Page du blog (pas de clé étrangère)
  category_slug text,
  author text not null default '',
  published_at date not null default current_date,
  reading_minutes int not null default 5,
  views int not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists elrophe_blog_posts_published_idx on public.elrophe_blog_posts(published_at desc);

drop trigger if exists elrophe_blog_posts_touch on public.elrophe_blog_posts;
create trigger elrophe_blog_posts_touch before update on public.elrophe_blog_posts
  for each row execute function public.elrophe_touch_updated_at();

alter table public.elrophe_blog_posts enable row level security;

drop policy if exists "elrophe_blog_posts_read" on public.elrophe_blog_posts;
create policy "elrophe_blog_posts_read" on public.elrophe_blog_posts for select using (is_active or public.elrophe_is_admin());
drop policy if exists "elrophe_blog_posts_admin" on public.elrophe_blog_posts;
create policy "elrophe_blog_posts_admin" on public.elrophe_blog_posts for all
  using (public.elrophe_is_admin()) with check (public.elrophe_is_admin());

-- Compteur de vues : seule la colonne views est modifiée (appelé par le serveur, /api/blog/view)
create or replace function public.elrophe_blog_view(p_slug text)
returns void
language sql security definer set search_path = public
as $$
  update public.elrophe_blog_posts set views = views + 1 where slug = p_slug and is_active;
$$;
revoke all on function public.elrophe_blog_view(text) from public, anon, authenticated;

-- ---------- Articles d'exemple (modifiables dans Pilotage › Blog) ----------
insert into public.elrophe_blog_posts (slug, title, excerpt, content, cover_url, cover_alt, category_slug, author, published_at, reading_minutes, is_featured, sort_order)
values
(
  'comprendre-helicobacter-pylori',
  'Comprendre Helicobacter pylori : ce qu’il faut savoir',
  'Découvrez ce qu’est Helicobacter pylori, comment il affecte l’équilibre gastrique et quelles approches naturelles peuvent accompagner le confort digestif.',
  'Helicobacter pylori est une bactérie qui peut coloniser la muqueuse de l’estomac. Elle est très répandue dans le monde et passe souvent inaperçue.

## Pourquoi en parle-t-on autant ?

Chez certaines personnes, sa présence est associée à un inconfort digestif : sensations de brûlure, ballonnements, digestion difficile. Seul un professionnel de santé peut confirmer sa présence, grâce à des tests adaptés, et proposer une prise en charge.

## Les bons réflexes au quotidien

- Privilégier des repas réguliers et pris dans le calme
- Limiter les aliments très gras, épicés ou acides si vous les tolérez mal
- Rester bien hydraté tout au long de la journée

## Et les approches naturelles ?

Certains ingrédients, comme la gomme de mastic, le brocoli ou des ferments sélectionnés, sont étudiés pour leur rôle dans le confort digestif. Ils peuvent compléter une hygiène de vie adaptée, sans jamais remplacer un avis médical.

> En cas de symptômes persistants, consultez votre médecin.',
  '/images/refonte/ingredient-mastic.png', 'Ingrédients naturels pour le confort digestif', 'confort-digestif', 'Équipe EL ROPHE', '2026-10-28', 8, true, 1
),
(
  'plantes-detox-foie',
  'Plantes détox pour le foie : comment les intégrer au quotidien',
  'Artichaut, radis noir, curcuma : quelques plantes traditionnellement associées au foie, et des idées simples pour les intégrer à vos habitudes.',
  'Le foie participe à de nombreuses fonctions de l’organisme. Une alimentation variée et une bonne hydratation restent la base pour en prendre soin.

## Des plantes de tradition

- L’artichaut, utilisé depuis longtemps en cuisine et en infusion
- Le radis noir, à consommer cru ou en jus
- Le curcuma, associé au poivre noir dans de nombreuses recettes

## Comment les intégrer ?

Ajoutez-les progressivement à vos repas, en variant les préparations. Si vous suivez un traitement, demandez conseil à votre pharmacien avant de prendre un complément alimentaire.',
  '/images/refonte/ingredient-brocoli.png', 'Légumes et plantes vertes', 'equilibre-metabolique', 'Équipe EL ROPHE', '2026-10-25', 6, false, 2
),
(
  'antioxydants-naturels-peau',
  'Antioxydants naturels : le secret d’une peau lumineuse',
  'Fruits colorés, thé vert, huiles végétales : ce que l’on sait des antioxydants et des gestes simples pour prendre soin de sa peau.',
  'Les antioxydants sont des composés présents naturellement dans de nombreux aliments. Ils font partie d’une alimentation équilibrée.

## Où les trouver ?

- Les fruits et légumes colorés : baies, agrumes, légumes verts
- Le thé vert et certaines plantes aromatiques
- Les huiles végétales de qualité

## Les gestes qui comptent

Une peau lumineuse dépend aussi du sommeil, de l’hydratation et de la protection solaire. Les compléments alimentaires ne remplacent pas ces habitudes.',
  '/images/refonte/maison-feuille.png', 'Feuille fraîche couverte de rosée', 'beaute-peau', 'Équipe EL ROPHE', '2026-10-22', 5, false, 3
),
(
  'energie-naturelle-plantes-tonus',
  'Énergie naturelle : les plantes qui soutiennent le tonus',
  'Moringa, ginseng, café vert : tour d’horizon des plantes associées à la vitalité et des habitudes qui aident à garder son énergie.',
  'La fatigue passagère a souvent des causes simples : manque de sommeil, alimentation déséquilibrée, stress. Commencer par ces leviers est essentiel.

## Des plantes appréciées pour la vitalité

- Le moringa, riche en nutriments
- Le ginseng, utilisé de longue date en Asie
- Le café et le thé, à consommer avec modération

## Au quotidien

Bougez régulièrement, exposez-vous à la lumière du jour et gardez des horaires de sommeil réguliers. Si la fatigue persiste, parlez-en à un professionnel de santé.',
  '/images/refonte/bestseller-feuillage.png', 'Feuillage tropical', 'vitalite-energie', 'Équipe EL ROPHE', '2026-10-18', 6, false, 4
)
on conflict (slug) do nothing;
