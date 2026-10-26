'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { byRank } from '@/lib/ranking';
import type { Category, Product } from '@/lib/types';
import ProductCard from './ProductCard';

const collections = [
  { id: '', label: 'Tous les produits' },
  { id: 'meilleures-ventes', label: 'Meilleures ventes' },
  { id: 'nouveautes', label: 'Nouveautés' },
] as const;

const sorts = [
  { id: 'selection', label: 'Notre sélection' },
  { id: 'populaires', label: 'Popularité' },
  { id: 'prix-croissant', label: 'Prix croissant' },
  { id: 'prix-decroissant', label: 'Prix décroissant' },
  { id: 'nom', label: 'Nom (A → Z)' },
] as const;

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Grille de la boutique : filtre catégorie / recherche / tri, état conservé dans l'URL */
export default function ShopView({ products, categories }: { products: Product[]; categories: Category[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
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
    else if (sort === 'populaires') sorted.sort((a, b) => b.reviews_count - a.reviews_count || a.sort_order - b.sort_order);
    // « Notre sélection » : l'ordre défini dans Pilotage › Boutique
    else sorted.sort(byRank(collection === 'nouveautes' ? 'new_order' : collection === 'meilleures-ventes' ? 'bestseller_order' : 'sort_order'));
    return sorted;
  }, [products, collection, category, query, sort]);

  return (
    <section aria-labelledby="shop-products" className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10">
      <h2 id="shop-products" className="sr-only">Produits</h2>
      <div className="no-scrollbar -mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="group" aria-label="Collections" className="glass inline-flex gap-1 rounded-full p-1.5">
          {collections.map((c) => (
            <button
              key={c.id || 'all'}
              type="button"
              aria-pressed={collection === c.id}
              onClick={() => setParam('collection', c.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors ${
                collection === c.id ? 'bg-forest text-white shadow-sm' : 'text-ink hover:bg-white/60'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 border-y border-line py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Catégories">
          {[{ slug: '', name: 'Tout' }, ...categories].map((c) => (
            <button
              key={c.slug || 'all'}
              type="button"
              aria-pressed={category === c.slug}
              onClick={() => setParam('categorie', c.slug)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                category === c.slug ? 'border-forest bg-forest text-white' : 'border-line bg-cream/60 text-ink hover:bg-cream'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <label htmlFor="shop-search" className="sr-only">
              Rechercher un produit
            </label>
            <input
              id="shop-search"
              type="search"
              defaultValue={query}
              placeholder="Rechercher…"
              onChange={(e) => setParam('q', e.target.value.trim())}
              className="field py-2.5! pl-10!"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <label htmlFor="shop-sort" className="sr-only">
              Trier par
            </label>
            <select id="shop-sort" value={sort} onChange={(e) => setParam('tri', e.target.value)} className="field appearance-none py-2.5! pr-8! pl-10!">
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
        {list.length} produit{list.length > 1 ? 's' : ''}
      </p>

      {list.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-lg font-bold">Aucun produit ne correspond à votre recherche.</p>
          <button type="button" className="btn-ghost mt-5" onClick={() => router.replace(pathname)}>
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
          {list.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
