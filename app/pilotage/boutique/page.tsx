'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { TABLES } from '@/lib/admin';
import { slugify } from '@/lib/format';
import type { Category, Product } from '@/lib/types';
import AdminGate from '../components/AdminGate';
import CrudList from '../components/CrudList';
import { Field, ImageField, PageTitle, Switch, useRows } from '../components/ui';
import CollectionTab from './CollectionTab';
import SpecialTab from './SpecialTab';
import ProductsTab from './ProductsTab';

const tabs = [
  { id: 'produits', label: 'Produits' },
  { id: 'categories', label: 'Catégories' },
  { id: 'nouveautes', label: 'Nouveautés' },
  { id: 'meilleures-ventes', label: 'Meilleures ventes' },
  { id: 'produit-special', label: 'Produit spécial' },
] as const;
type TabId = (typeof tabs)[number]['id'];

function CategoriesTab() {
  return (
    <CrudList<Category>
      embedded
      table={TABLES.categories}
      eyebrow="Boutique"
      title="Catégories"
      subtitle="Affichées dans « Acheter par catégorie » et dans les filtres de la boutique, dans cet ordre."
      itemLabel="une catégorie"
      emptyItem={{ slug: '', name: '', description: '', image_url: '', is_active: true }}
      summary={(c) => ({ image: c.image_url, title: c.name, subtitle: `/${c.slug} · ${c.description ?? ''}` })}
      validate={(c) => (!c.name?.trim() ? 'Nom obligatoire' : null)}
      renderForm={(c, set, isNew) => (
        <>
          <Field label="Nom" required value={c.name} onChange={(v) => set(isNew ? { name: v, slug: slugify(v) } : { name: v })} />
          <Field label="Slug" value={c.slug} onChange={(v) => set({ slug: slugify(v) })} hint="Utilisé dans les liens. Le modifier met à jour les produits rattachés." />
          <Field label="Description" textarea value={c.description} onChange={(v) => set({ description: v })} />
          <ImageField label="Image (format portrait 4:5)" value={c.image_url} onChange={(v) => set({ image_url: v })} folder="categories" aspect="aspect-[4/5]" />
          <Switch label="Visible sur le site" checked={!!c.is_active} onChange={(v) => set({ is_active: v })} />
        </>
      )}
    />
  );
}

function Boutique() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: TabId = tabs.some((t) => t.id === params.get('tab')) ? (params.get('tab') as TabId) : 'produits';
  const products = useRows<Product>(TABLES.products);
  const categories = useRows<Category>(TABLES.categories);
  const rows = products.rows.map((p) => ({ ...p, highlights: p.highlights ?? [], benefits: p.benefits ?? [], gallery: p.gallery ?? [] }));

  const counts: Partial<Record<TabId, number>> = {
    produits: rows.length,
    categories: categories.rows.length,
    nouveautes: rows.filter((p) => p.is_new).length,
    'meilleures-ventes': rows.filter((p) => p.is_bestseller).length,
  };

  return (
    <>
      <PageTitle
        eyebrow="Catalogue"
        title="Boutique"
        subtitle="Produits, catégories, collections, et produit spécial."
        actions={<a href="/boutique" target="_blank" rel="noopener noreferrer" className="pz-btn pz-btn-outline"><ExternalLink className="h-3.5 w-3.5" />Voir la boutique</a>}
      />

      <div className="pz-seg mb-6" role="tablist" aria-label="Sections de la boutique">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => router.replace(`${pathname}?tab=${t.id}`, { scroll: false })}>
            {t.label}
            {counts[t.id] !== undefined && <span className="ml-1.5 opacity-60">{counts[t.id]}</span>}
          </button>
        ))}
      </div>

      {tab === 'produits' && <ProductsTab rows={rows} categories={categories.rows} loading={products.loading} missing={products.missing} reload={products.reload} />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'nouveautes' && <CollectionTab rows={rows} collection="is_new" label="Nouveautés" publicPath="/boutique?collection=nouveautes" reload={products.reload} />}
      {tab === 'meilleures-ventes' && <CollectionTab rows={rows} collection="is_bestseller" label="Meilleures ventes" publicPath="/boutique?collection=meilleures-ventes" reload={products.reload} />}
      {tab === 'produit-special' && <SpecialTab rows={rows} reload={products.reload} />}
    </>
  );
}

export default function BoutiquePage() {
  return (
    <AdminGate>
      <Suspense fallback={<div className="pz-empty">Chargement…</div>}>
        <Boutique />
      </Suspense>
    </AdminGate>
  );
}
