'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, ExternalLink, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { TABLES, updateRow } from '@/lib/admin';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { setFeatured } from './actions';
import { RichContentFields } from './ProductForm';

/** Choix du produit du moment + édition directe de son contenu enrichi */
export default function FeaturedTab({ rows, reload }: { rows: Product[]; reload: () => void }) {
  const featured = rows.find((p) => p.is_featured) ?? null;
  return (
    <div className="space-y-6">
      <div className="pz-card">
        <div className="pz-card-header flex-wrap">
          <div className="flex items-center gap-3">
            <span className="pz-stat-icon"><Sparkles className="h-4 w-4" /></span>
            <div>
              <h2 className="pz-card-title">Produit du moment</h2>
              <p className="text-xs text-slate-500">Mis en avant juste sous le hero de l’accueil, avec un badge sur sa page produit.</p>
            </div>
          </div>
          <select
            value={featured?.id ?? ''}
            onChange={async (e) => {
              const { error } = await setFeatured(e.target.value || null);
              if (error) toast.error(error);
              else toast.success(e.target.value ? 'Produit du moment mis à jour' : 'Produit du moment retiré');
              reload();
            }}
            aria-label="Choisir le produit du moment"
            className="min-w-64 border border-gray-300 bg-transparent px-3 py-2 text-black"
          >
            <option value="">— Aucun (meilleure vente la plus notée) —</option>
            {rows.map((p) => <option key={p.id} value={p.id}>{p.name}{p.is_active ? '' : ' (masqué)'}</option>)}
          </select>
        </div>
        {!featured && <div className="pz-empty">Choisissez un produit pour compléter sa mise en avant.</div>}
      </div>

      {/* key : le formulaire repart des valeurs du produit à chaque changement */}
      {featured && <FeaturedEditor key={featured.id} product={featured} reload={reload} />}
    </div>
  );
}

function FeaturedEditor({ product, reload }: { product: Product; reload: () => void }) {
  const [form, setForm] = useState<Partial<Product>>(product);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Product>) => setForm((f) => ({ ...f, ...patch }));

  const highlights = (form.highlights ?? []).filter((h) => h.trim());
  const benefits = (form.benefits ?? []).filter((b) => b.title.trim() && b.text.trim());
  const checks = [
    { label: 'Image principale', ok: !!form.image_url },
    { label: 'Accroche', ok: !!form.tagline?.trim() },
    { label: 'Description', ok: !!form.description?.trim() },
    { label: 'Au moins 3 points forts', ok: highlights.length >= 3 },
    { label: 'Histoire « Pourquoi on l’aime »', ok: !!form.story?.trim() },
    { label: '3 bienfaits (titre + texte)', ok: benefits.length >= 3 },
    { label: 'Composition et conseils', ok: !!form.ingredients?.trim() && !!form.usage?.trim() },
  ];
  const done = checks.filter((c) => c.ok).length;

  const save = async () => {
    setSaving(true);
    const { error } = await updateRow<Product>(TABLES.products, product.id, {
      tagline: form.tagline?.trim() || null,
      description: form.description ?? null,
      ingredients: form.ingredients ?? null,
      usage: form.usage ?? null,
      story: form.story?.trim() || null,
      highlights,
      benefits: (form.benefits ?? []).filter((b) => b.title.trim() || b.text.trim()),
    });
    setSaving(false);
    if (error) return toast.error(error);
    toast.success('Contenu enregistré — le site est à jour');
    reload();
  };

  const field = 'w-full border border-gray-300 bg-transparent px-3 py-2 text-black';

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="pz-card">
        <div className="pz-card-header">
          <h2 className="pz-card-title">Contenu de « {product.name} »</h2>
          <button className="pz-btn pz-btn-primary" onClick={save} disabled={saving}>
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
        <div className="space-y-4 p-5">
          <RichContentFields value={form} set={set} />
          <div>
            <label className="block" htmlFor="ft-desc">Description</label>
            <textarea id="ft-desc" rows={3} value={form.description ?? ''} onChange={(e) => set({ description: e.target.value })} className={field} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block" htmlFor="ft-ing">Composition</label>
              <textarea id="ft-ing" rows={3} value={form.ingredients ?? ''} onChange={(e) => set({ ingredients: e.target.value })} className={field} />
            </div>
            <div>
              <label className="block" htmlFor="ft-usage">Conseils d&apos;utilisation</label>
              <textarea id="ft-usage" rows={3} value={form.usage ?? ''} onChange={(e) => set({ usage: e.target.value })} className={field} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="pz-card p-5">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image_url || ''} alt="" className="h-20 w-20 rounded-md border border-gray-200 bg-gray-50 object-contain" />
            <div className="min-w-0">
              <p className="truncate font-extrabold text-[var(--pz-text)]">{product.name}</p>
              <p className="pz-num text-sm">{formatPrice(Number(product.price))}</p>
              <a href={`/produit/${product.slug}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[var(--pz-700)] hover:underline">
                Voir la page produit <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
        <div className="pz-card">
          <div className="pz-card-header">
            <h2 className="pz-card-title">Page complète</h2>
            <span className={`pz-badge ${done === checks.length ? 'pz-badge-up' : 'pz-badge-warn'}`}>{done}/{checks.length}</span>
          </div>
          <ul className="space-y-2.5 p-5">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-sm">
                {c.ok ? <CheckCircle2 className="h-4 w-4 text-[var(--pz-600)]" /> : <Circle className="h-4 w-4 text-slate-300" />}
                <span className={c.ok ? 'text-[var(--pz-text)]' : 'text-slate-500'}>{c.label}</span>
              </li>
            ))}
          </ul>
          <p className="px-5 pb-5 text-xs text-slate-500">Image, prix et galerie se modifient dans l’onglet Produits.</p>
        </div>
      </div>
    </div>
  );
}
