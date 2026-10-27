'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { previewOrder } from '@/lib/preview';
import { byRank } from '@/lib/ranking';
import type { Category, Product } from '@/lib/types';
import ProductCard from './ProductCard';

const sorts = [
  { id: 'selection', label: 'Notre sélection' },
  { id: 'prix-croissant', label: 'Prix croissant' },
  { id: 'prix-decroissant', label: 'Prix décroissant' },
  { id: 'nom', label: 'Nom (A → Z)' },
] as const;

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Grille « Nos produits » : catégories, recherche et tri, état conservé dans l'URL */
export default function ShopView({ products, categories }: { products: Product[]; categories: Category[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // ?collection= : anciens liens (meilleures ventes, nouveautés)
  const collection = params.get('collection') ?? '';
  const category = params.get('categorie') ?? '';
  const query = params.get('q') ?? '';
  const sort = params.get('tri') ?? 'selection';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const list = useMemo(() => {
    let rows = products;
    if (collection === 'meilleures-ventes') rows = rows.filter((p) => p.is_bestseller);
    if (collection === 'nouveautes') rows = rows.filter((p) => p.is_new);
    if (category) rows = rows.filter((p) => p.category_slug === category);
    if (query) {
      const q = normalize(query);
      rows = rows.filter((p) => normalize(`${p.name} ${p.benefit ?? ''} ${p.description ?? ''}`).includes(q));
    }
    const sorted = [...rows];
    if (sort === 'prix-croissant') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'prix-decroissant') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'nom') sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    // « Notre sélection » : les produits mis en avant d'abord, puis l'ordre défini dans Pilotage › Boutique
    else {
      const rank = byRank(collection === 'nouveautes' ? 'new_order' : collection === 'meilleures-ventes' ? 'bestseller_order' : 'sort_order');
      const lead = (p: Product) => (previewOrder.includes(p.slug) ? previewOrder.indexOf(p.slug) : previewOrder.length);
      sorted.sort((a, b) => lead(a) - lead(b) || rank(a, b));
    }
    return sorted;
  }, [products, collection, category, query, sort]);

  return (
    <section aria-labelledby="shop-products" className="container-site pb-16">
      <h2 id="shop-products" className="sr-only">
        Produits
      </h2>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Catégories">
          {[{ slug: '', name: 'Tous' }, ...categories].map((c) => (
            <button key={c.slug || 'all'} type="button" aria-pressed={category === c.slug} onClick={() => setParam('categorie', c.slug)} className="chip">
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 lg:w-64 lg:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <label htmlFor="shop-search" className="sr-only">
              Rechercher un produit
            </label>
            <input id="shop-search" type="search" defaultValue={query} placeholder="Rechercher…" onChange={(e) => setParam('q', e.target.value.trim())} className="field pl-10!" />
          </div>
          <label htmlFor="shop-sort" className="sr-only">
            Trier par
          </label>
          <select id="shop-sort" value={sort} onChange={(e) => setParam('tri', e.target.value)} className="field w-auto! pr-8">
            {sorts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-6 text-[14px] text-muted" aria-live="polite">
        {list.length} produit{list.length > 1 ? 's' : ''}
      </p>

      {list.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="font-serif text-2xl">Aucun produit ne correspond à votre recherche.</p>
          <button type="button" className="btn btn-outline mt-6" onClick={() => router.replace(pathname)}>
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {list.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i < 2} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
