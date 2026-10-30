'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteImage, deleteRow, TABLES, updateRow } from '@/lib/admin';
import { formatPrice } from '@/lib/format';
import type { Category, Product } from '@/lib/types';
import { MigrationNotice } from '../components/AdminGate';
import { setFeatured, setInCollection, reorderProducts } from './actions';
import ProductForm, { emptyProduct } from './ProductForm';

export default function ProductsTab({
  rows,
  categories,
  reloadCategories,
  loading,
  missing,
  reload,
}: {
  rows: Product[];
  categories: Category[];
  reloadCategories: () => void;
  loading: boolean;
  missing: boolean;
  reload: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const filtered = !!search || !!category;
  const list = rows.filter((p) => (!category || p.category_slug === category) && (!search || p.name.toLowerCase().includes(search.toLowerCase())));
  const catName = (slug: string | null) => categories.find((c) => c.slug === slug)?.name ?? '—';

  const run = async (promise: Promise<{ error: string | null }>, success?: string) => {
    const { error } = await promise;
    if (error) toast.error(error);
    else if (success) toast.success(success);
    reload();
  };

  const move = (index: number, dir: -1 | 1) => {
    const ids = rows.map((r) => r.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(reorderProducts(ids));
  };

  const toggleCollection = (p: Product, key: 'is_new' | 'is_bestseller') =>
    run(setInCollection(p, key, !p[key], rows.filter((r) => r[key]).length + 1));

  const remove = async (p: Product) => {
    if (!confirm(`Supprimer « ${p.name} » ? Les commandes passées gardent leur copie du produit.`)) return;
    const { error } = await deleteRow(TABLES.products, p.id);
    if (error) return toast.error(error);
    await Promise.all([p.image_url, ...p.gallery].map((u) => deleteImage(u)));
    toast.success('Produit supprimé');
    reload();
  };

  return (
    <>
      {missing && <MigrationNotice />}
      <div className="pz-card">
        <div className="pz-card-header flex-wrap">
          <div className="flex flex-wrap items-center gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filtrer par catégorie" className="border border-gray-300 bg-transparent px-3 py-1.5 text-black">
              <option value="">Toutes les catégories</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="w-full border border-gray-300 bg-transparent py-1.5 pr-3 pl-8 text-black" />
            </div>
          </div>
          <button className="pz-btn pz-btn-primary" disabled={missing} onClick={() => setEditing({ ...emptyProduct })}>
            <Plus className="h-3.5 w-3.5" />
            Nouveau produit
          </button>
        </div>
        <p className="border-b border-[var(--pz-border)] px-5 py-2 text-xs text-slate-500">
          {filtered
            ? 'Retirez les filtres pour changer l’ordre des produits.'
            : 'L’ordre ci-dessous est celui de la boutique (« Notre sélection »). Utilisez les flèches pour classer les produits.'}
        </p>

        {loading ? (
          <div className="pz-empty">Chargement…</div>
        ) : list.length === 0 ? (
          <div className="pz-empty">Aucun produit</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="w-16">Ordre</th>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th className="text-right">Prix</th>
                  <th className="text-right">Stock</th>
                  <th title="Produit spécial (page /best-seller)">Spécial</th>
                  <th>Visible</th>
                  <th>Top vente</th>
                  <th>Nouveau</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const index = rows.indexOf(p);
                  return (
                    <tr key={p.id} className={p.is_active ? '' : 'opacity-60'}>
                      <td>
                        <div className="flex items-center gap-0.5">
                          <button className="pz-btn pz-btn-ghost px-1.5! py-1!" disabled={filtered || index === 0} onClick={() => move(index, -1)} aria-label={`Monter ${p.name}`}><ArrowUp className="h-3.5 w-3.5" /></button>
                          <button className="pz-btn pz-btn-ghost px-1.5! py-1!" disabled={filtered || index === rows.length - 1} onClick={() => move(index, 1)} aria-label={`Descendre ${p.name}`}><ArrowDown className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image_url || ''} alt="" className="h-11 w-11 rounded-md border border-gray-200 bg-gray-50 object-contain" />
                          <div className="min-w-0">
                            <p className="truncate text-[var(--pz-text)]">{p.name}</p>
                            <p className="truncate text-xs font-normal text-slate-500">{p.benefit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">{catName(p.category_slug)}</td>
                      <td className="text-right pz-num whitespace-nowrap">{formatPrice(Number(p.price))}</td>
                      <td className="text-right">
                        {p.stock === null ? <span className="text-slate-400">—</span> : <span className={`pz-badge ${p.stock <= 0 ? 'pz-badge-down' : p.stock <= 5 ? 'pz-badge-warn' : 'pz-badge-neutral'}`}>{p.stock}</span>}
                      </td>
                      <td>
                        <button
                          className="pz-btn pz-btn-ghost px-1.5!"
                          onClick={() => run(setFeatured(p.is_featured ? null : p.id), p.is_featured ? 'Produit spécial retiré' : `« ${p.name} » est le produit spécial`)}
                          aria-pressed={p.is_featured}
                          aria-label={p.is_featured ? `Retirer ${p.name} du produit du moment` : `Faire de ${p.name} le produit du moment`}
                          title="Produit spécial"
                        >
                          <Star className={`h-4 w-4 ${p.is_featured ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                        </button>
                      </td>
                      <td><input type="checkbox" checked={p.is_active} onChange={() => run(updateRow<Product>(TABLES.products, p.id, { is_active: !p.is_active }))} aria-label={`Visible : ${p.name}`} /></td>
                      <td><input type="checkbox" checked={p.is_bestseller} onChange={() => toggleCollection(p, 'is_bestseller')} aria-label={`Meilleure vente : ${p.name}`} /></td>
                      <td><input type="checkbox" checked={p.is_new} onChange={() => toggleCollection(p, 'is_new')} aria-label={`Nouveauté : ${p.name}`} /></td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button className="pz-btn pz-btn-ghost px-2!" onClick={() => setEditing(p)} aria-label={`Modifier ${p.name}`}><Pencil className="h-3.5 w-3.5" /></button>
                          <button className="pz-btn pz-btn-ghost px-2! text-red-600!" onClick={() => remove(p)} aria-label={`Supprimer ${p.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <ProductForm product={editing} categories={categories} onCategoryCreated={reloadCategories} nextOrder={rows.length + 1} onClose={() => setEditing(null)} onSaved={reload} />}
    </>
  );
}
