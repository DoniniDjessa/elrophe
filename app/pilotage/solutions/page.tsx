'use client';

import { useState } from 'react';
import { TABLES } from '@/lib/admin';
import { slugify } from '@/lib/format';
import type { Product, Solution } from '@/lib/types';
import AdminGate from '../components/AdminGate';
import CrudList from '../components/CrudList';
import { Field, ImageField, Switch, useRows } from '../components/ui';

/** Cases à cocher des produits affichés sur la page de la solution (ordre = ordre de sélection) */
function ProductPicker({ products, value, onChange }: { products: Product[]; value: string[]; onChange: (ids: string[]) => void }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const visible = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <div>
      <span className="mb-[0.4rem] block text-[0.6875rem] font-extrabold tracking-[0.04em] text-[var(--pz-muted)] uppercase">
        Produits de la solution ({value.length})
      </span>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un produit…"
        className="mb-2 w-full border border-gray-300 bg-transparent px-3 py-2 text-black focus:outline-none"
      />
      <ul className="max-h-72 divide-y divide-gray-200 overflow-y-auto rounded-md border border-gray-200">
        {visible.length === 0 && <li className="p-3 text-sm text-slate-500">Aucun produit</li>}
        {visible.map((p) => {
          const position = value.indexOf(p.id);
          return (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50">
                <input type="checkbox" checked={position !== -1} onChange={() => toggle(p.id)} className="h-4 w-4 accent-indigo-600" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url || ''} alt="" className="h-9 w-9 shrink-0 rounded border border-gray-200 bg-gray-50 object-cover" />
                <span className={`min-w-0 flex-1 truncate text-sm ${p.is_active ? 'text-[var(--pz-text)]' : 'text-slate-400'}`}>
                  {p.name}
                  {!p.is_active && ' (masqué)'}
                </span>
                {position !== -1 && <span className="pz-badge pz-badge-up">{position + 1}</span>}
              </label>
            </li>
          );
        })}
      </ul>
      <p className="mt-1 text-xs text-slate-500">Les produits s’affichent dans l’ordre où vous les cochez.</p>
    </div>
  );
}

function Solutions() {
  const products = useRows<Product>(TABLES.products);

  return (
    <CrudList<Solution>
      table={TABLES.solutions}
      eyebrow="Catalogue"
      title="Solutions"
      subtitle="Cartes défilantes sous le hero (Santé du foie, Vitalité…). Chaque solution a sa page avec les produits cochés."
      itemLabel="une solution"
      emptyItem={{ slug: '', title: '', description: '', image_url: '', product_ids: [], is_active: true }}
      summary={(s) => ({ image: s.image_url, title: s.title, subtitle: `${s.product_ids?.length ?? 0} produit(s) · ${s.description ?? ''}` })}
      validate={(s) => (!s.title?.trim() ? 'Titre obligatoire' : !s.slug?.trim() ? 'Slug obligatoire' : null)}
      renderForm={(s, set, isNew) => (
        <>
          <Field label="Titre" required value={s.title} onChange={(v) => set(isNew ? { title: v, slug: slugify(v) } : { title: v })} />
          <Field label="Slug" value={s.slug} onChange={(v) => set({ slug: slugify(v) })} hint={`Adresse de la page : /solution/${s.slug || '…'}`} />
          <Field label="Description" textarea value={s.description} onChange={(v) => set({ description: v })} />
          <ImageField label="Image (format paysage 4:3)" value={s.image_url} onChange={(v) => set({ image_url: v })} folder="solutions" aspect="aspect-[4/3]" />
          <ProductPicker products={products.rows} value={s.product_ids ?? []} onChange={(ids) => set({ product_ids: ids })} />
          <Switch label="Visible sur le site" checked={!!s.is_active} onChange={(v) => set({ is_active: v })} />
        </>
      )}
    />
  );
}

export default function SolutionsPage() {
  return (
    <AdminGate>
      <Solutions />
    </AdminGate>
  );
}
