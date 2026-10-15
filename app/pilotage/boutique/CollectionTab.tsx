'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/format';
import { byRank } from '@/lib/ranking';
import type { Product } from '@/lib/types';
import { ORDER_COLUMN, reorderProducts, setInCollection, type CollectionKey } from './actions';

/** Nouveautés / Meilleures ventes : quels produits y figurent, et dans quel ordre */
export default function CollectionTab({
  rows,
  collection,
  label,
  publicPath,
  reload,
}: {
  rows: Product[];
  collection: CollectionKey;
  label: string;
  publicPath: string;
  reload: () => void;
}) {
  const column = ORDER_COLUMN[collection];
  const members = rows.filter((p) => p[collection]).sort(byRank(column));
  const others = rows.filter((p) => !p[collection]);
  const [adding, setAdding] = useState('');

  const run = async (promise: Promise<{ error: string | null }>, success?: string) => {
    const { error } = await promise;
    if (error) toast.error(error);
    else if (success) toast.success(success);
    reload();
  };

  const move = (index: number, dir: -1 | 1) => {
    const ids = members.map((m) => m.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(reorderProducts(ids, column));
  };

  const add = () => {
    const product = rows.find((p) => p.id === adding);
    if (!product) return;
    setAdding('');
    run(setInCollection(product, collection, true, members.length + 1), `« ${product.name} » ajouté`);
  };

  return (
    <div className="pz-card">
      <div className="pz-card-header flex-wrap">
        <div>
          <h2 className="pz-card-title">{members.length} produit{members.length > 1 ? 's' : ''} dans « {label} »</h2>
          <p className="text-xs text-slate-500">Affichés dans cet ordre sur la page {label} (tri « Notre sélection »).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={adding} onChange={(e) => setAdding(e.target.value)} aria-label={`Produit à ajouter à ${label}`} className="border border-gray-300 bg-transparent px-3 py-1.5 text-black">
            <option value="">Ajouter un produit…</option>
            {others.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className="pz-btn pz-btn-primary" disabled={!adding} onClick={add}><Plus className="h-3.5 w-3.5" />Ajouter</button>
          <a href={publicPath} target="_blank" rel="noopener noreferrer" className="pz-btn pz-btn-outline"><ExternalLink className="h-3.5 w-3.5" />Voir</a>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="pz-empty">Aucun produit pour le moment</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {members.map((p, i) => (
            <li key={p.id} className={`flex items-center gap-3 p-4 ${p.is_active ? '' : 'opacity-60'}`}>
              <span className={`pz-rank ${i === 0 ? 'is-top' : ''}`}>{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url || ''} alt="" className="h-11 w-11 shrink-0 rounded-md border border-gray-200 bg-gray-50 object-contain" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold text-[var(--pz-text)]">{p.name}</p>
                <p className="text-xs text-slate-500">
                  {formatPrice(Number(p.price))}
                  {!p.is_active && ' · masqué sur le site'}
                </p>
              </div>
              <button className="pz-btn pz-btn-ghost px-2!" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Monter ${p.name}`}><ArrowUp className="h-3.5 w-3.5" /></button>
              <button className="pz-btn pz-btn-ghost px-2!" disabled={i === members.length - 1} onClick={() => move(i, 1)} aria-label={`Descendre ${p.name}`}><ArrowDown className="h-3.5 w-3.5" /></button>
              <button className="pz-btn pz-btn-ghost px-2! text-red-600!" onClick={() => run(setInCollection(p, collection, false, 0), `« ${p.name} » retiré`)} aria-label={`Retirer ${p.name} de ${label}`}>
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
