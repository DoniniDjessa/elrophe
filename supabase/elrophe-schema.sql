-- =====================================================================
-- ELROPHE — schéma Supabase
-- À exécuter une fois dans Supabase > SQL Editor (idempotent : peut être relancé).
-- Toutes les tables sont préfixées "elrophe_" (projet Supabase partagé).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Administrateurs ----------
create table if not exists public.elrophe_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.elrophe_is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.elrophe_admins where user_id = auth.uid());
$$;

-- ---------- Code d'accès au pilotage ----------
-- Une seule ligne ; le code (haché, scrypt) n'est lisible que par le serveur (service role) :
-- RLS activée sans aucune politique. Sans ligne, le code par défaut est 0044.
create table if not exists public.elrophe_pilotage_access (
  id int primary key default 1 check (id = 1),
  code_hash text not null,
  updated_at timestamptz not null default now()
);
alter table public.elrophe_pilotage_access enable row level security;

-- ---------- updated_at ----------
create or replace function public.elrophe_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Catégories ----------
create table if not exists public.elrophe_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Produits ----------
create table if not exists public.elrophe_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_slug text references public.elrophe_categories(slug) on update cascade on delete set null,
  benefit text,
  description text,
  ingredients text,
  usage text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2),
  image_url text,
  gallery text[] not null default '{}',
  rating numeric(2,1) not null default 5,
  reviews_count int not null default 0,
  stock int, -- null = stock non suivi
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  new_order int not null default 0,
  bestseller_order int not null default 0,
  tagline text,
  highlights text[] not null default '{}',
  story text,
  benefits jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Colonnes ajoutées après la première version (sans effet si elles existent déjà)
alter table public.elrophe_products
  add column if not exists is_featured boolean not null default false,
  add column if not exists new_order int not null default 0,
  add column if not exists bestseller_order int not null default 0,
  add column if not exists tagline text,
  add column if not exists highlights text[] not null default '{}',
  add column if not exists story text,
  add column if not exists benefits jsonb not null default '[]';
create index if not exists elrophe_products_category_idx on public.elrophe_products(category_slug);
-- Un seul « produit du moment » à la fois
create unique index if not exists elrophe_products_one_featured on public.elrophe_products(is_featured) where is_featured;

-- ---------- Commandes ----------
create table if not exists public.elrophe_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text not null,
  city text,
  notes text,
  items jsonb not null default '[]',
  subtotal numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_method text not null default 'cash_on_delivery',
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists elrophe_orders_created_idx on public.elrophe_orders(created_at desc);
create index if not exists elrophe_orders_phone_idx on public.elrophe_orders(customer_phone);

-- ---------- Avis clients ----------
create table if not exists public.elrophe_testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  text text not null,
  rating int not null default 5 check (rating between 1 and 5),
  avatar_url text,
  product_name text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Ingrédients phares ----------
create table if not exists public.elrophe_ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latin_name text,
  benefit text,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Réglages du site (personnalisation) ----------
create table if not exists public.elrophe_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ---------- Newsletter ----------
create table if not exists public.elrophe_newsletter (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- Triggers updated_at ----------
do $$
declare t text;
begin
  foreach t in array array['elrophe_categories','elrophe_products','elrophe_orders','elrophe_testimonials','elrophe_ingredients','elrophe_settings']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.elrophe_touch_updated_at()', t, t);
  end loop;
end $$;

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.elrophe_admins       enable row level security;
alter table public.elrophe_categories   enable row level security;
alter table public.elrophe_products     enable row level security;
alter table public.elrophe_orders       enable row level security;
alter table public.elrophe_testimonials enable row level security;
alter table public.elrophe_ingredients  enable row level security;
alter table public.elrophe_settings     enable row level security;
alter table public.elrophe_newsletter   enable row level security;

-- Admins : chacun peut vérifier sa propre ligne
drop policy if exists "elrophe_admins_self" on public.elrophe_admins;
create policy "elrophe_admins_self" on public.elrophe_admins for select using (user_id = auth.uid());

-- Lecture publique du catalogue et du contenu visible
drop policy if exists "elrophe_categories_read" on public.elrophe_categories;
create policy "elrophe_categories_read" on public.elrophe_categories for select using (is_active or public.elrophe_is_admin());
drop policy if exists "elrophe_products_read" on public.elrophe_products;
create policy "elrophe_products_read" on public.elrophe_products for select using (is_active or public.elrophe_is_admin());
drop policy if exists "elrophe_testimonials_read" on public.elrophe_testimonials;
create policy "elrophe_testimonials_read" on public.elrophe_testimonials for select using (is_active or public.elrophe_is_admin());
drop policy if exists "elrophe_ingredients_read" on public.elrophe_ingredients;
create policy "elrophe_ingredients_read" on public.elrophe_ingredients for select using (is_active or public.elrophe_is_admin());
drop policy if exists "elrophe_settings_read" on public.elrophe_settings;
create policy "elrophe_settings_read" on public.elrophe_settings for select using (true);

-- Écriture : administrateurs uniquement
do $$
declare t text;
begin
  foreach t in array array['elrophe_categories','elrophe_products','elrophe_orders','elrophe_testimonials','elrophe_ingredients','elrophe_settings','elrophe_newsletter']
  loop
    execute format('drop policy if exists "%s_admin" on public.%I', t, t);
    execute format('create policy "%s_admin" on public.%I for all using (public.elrophe_is_admin()) with check (public.elrophe_is_admin())', t, t);
  end loop;
end $$;
-- Commandes et newsletter : aucune lecture/écriture publique, elles passent par le serveur (service role).

-- =====================================================================
-- Passage de commande (appelé uniquement par le serveur Next.js)
-- Les prix sont relus en base, le stock est verrouillé et décrémenté.
-- =====================================================================
create or replace function public.elrophe_place_order(payload jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  item jsonb;
  prod public.elrophe_products%rowtype;
  qty int;
  lines jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_fee numeric := coalesce((payload->>'shipping_fee')::numeric, 0);
  v_threshold numeric := nullif(payload->>'free_shipping_threshold', '')::numeric;
  v_number text;
  v_id uuid;
begin
  if jsonb_typeof(payload->'items') is distinct from 'array' or jsonb_array_length(payload->'items') = 0 then
    raise exception 'EMPTY_CART';
  end if;
  if coalesce(trim(payload->>'customer_name'), '') = ''
     or coalesce(trim(payload->>'customer_phone'), '') = ''
     or coalesce(trim(payload->>'address'), '') = '' then
    raise exception 'MISSING_FIELDS';
  end if;

  for item in select * from jsonb_array_elements(payload->'items') loop
    qty := greatest(1, least(99, coalesce((item->>'quantity')::int, 1)));
    select * into prod from public.elrophe_products
      where id = (item->>'product_id')::uuid and is_active
      for update;
    if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
    if prod.stock is not null and prod.stock < qty then
      raise exception 'OUT_OF_STOCK:%', prod.name;
    end if;
    if prod.stock is not null then
      update public.elrophe_products set stock = stock - qty where id = prod.id;
    end if;
    v_subtotal := v_subtotal + prod.price * qty;
    lines := lines || jsonb_build_object(
      'product_id', prod.id, 'slug', prod.slug, 'name', prod.name,
      'image_url', prod.image_url, 'price', prod.price, 'quantity', qty);
  end loop;

  v_shipping := case when v_threshold is not null and v_threshold > 0 and v_subtotal >= v_threshold then 0 else v_fee end;
  v_number := 'ELR-' || to_char(now() at time zone 'utc', 'YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 5));

  insert into public.elrophe_orders
    (order_number, customer_name, customer_phone, customer_email, address, city, notes,
     items, subtotal, shipping, total, payment_method)
  values
    (v_number, trim(payload->>'customer_name'), trim(payload->>'customer_phone'),
     nullif(trim(payload->>'customer_email'), ''), trim(payload->>'address'),
     nullif(trim(payload->>'city'), ''), nullif(trim(payload->>'notes'), ''),
     lines, v_subtotal, v_shipping, v_subtotal + v_shipping,
     coalesce(nullif(payload->>'payment_method', ''), 'cash_on_delivery'))
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'order_number', v_number, 'total', v_subtotal + v_shipping);
end $$;

revoke all on function public.elrophe_place_order(jsonb) from public, anon, authenticated;
grant execute on function public.elrophe_place_order(jsonb) to service_role;

-- =====================================================================
-- Stockage des images : bucket public "elrophe-media"
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('elrophe-media', 'elrophe-media', true)
on conflict (id) do nothing;

drop policy if exists "elrophe_media_read" on storage.objects;
create policy "elrophe_media_read" on storage.objects for select using (bucket_id = 'elrophe-media');
drop policy if exists "elrophe_media_insert" on storage.objects;
create policy "elrophe_media_insert" on storage.objects for insert with check (bucket_id = 'elrophe-media' and public.elrophe_is_admin());
drop policy if exists "elrophe_media_update" on storage.objects;
create policy "elrophe_media_update" on storage.objects for update using (bucket_id = 'elrophe-media' and public.elrophe_is_admin());
drop policy if exists "elrophe_media_delete" on storage.objects;
create policy "elrophe_media_delete" on storage.objects for delete using (bucket_id = 'elrophe-media' and public.elrophe_is_admin());
