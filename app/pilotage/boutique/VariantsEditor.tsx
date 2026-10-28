'use client';

import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { emptyVariant } from '@/lib/landing';
import type { LandingOffer } from '@/lib/types';
import { Field, Switch } from '../components/ui';

/**
 * Variantes d'un produit (ex. 1 flacon 60 gélules / 1 flacon 120 gélules) : ajout, ordre, rupture et masquage.
 * Le client les coche dans « Détails de la commande » ; une variante masquée n'est ni affichée ni commandable.
 */
export default function VariantsEditor({ value, onChange }: { value: LandingOffer[]; onChange: (variants: LandingOffer[]) => void }) {
  const update = (i: number, patch: Partial<LandingOffer>) => onChange(value.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="rounded-md bg-gray-50 p-3 text-xs text-slate-500">Aucune variante : le produit est vendu à l’unité, au prix de sa fiche.</p>
      )}
      {value.map((v, i) => (
        <div key={v.id} className={`rounded-md border p-4 ${v.hidden ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-200'}`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-extrabold text-slate-500">
              Variante {i + 1}
              {v.hidden ? (
                <span className="inline-flex items-center gap-1 rounded bg-gray-200 px-1.5 py-0.5 font-bold text-slate-600"><EyeOff className="h-3 w-3" />Masquée</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700"><Eye className="h-3 w-3" />Visible</span>
              )}
            </span>
            <div className="flex gap-1">
              <button type="button" className="pz-btn pz-btn-ghost px-2!" aria-label="Monter" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
              <button type="button" className="pz-btn pz-btn-ghost px-2!" aria-label="Descendre" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
              <button type="button" className="pz-btn pz-btn-ghost px-2!" aria-label="Supprimer la variante" onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Libellé" value={v.label} onChange={(x) => update(i, { label: x })} placeholder="Ex. 1 flacon (60 gélules) 15 jours" />
              <Field label="Sous-titre" value={v.subtitle} onChange={(x) => update(i, { subtitle: x })} placeholder="Ex. Cure début" />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="Prix (FCFA)" type="number" value={v.price || ''} onChange={(x) => update(i, { price: Number(x) })} />
              <Field label="Prix barré" type="number" value={v.compare_at_price ?? ''} onChange={(x) => update(i, { compare_at_price: x === '' ? null : Number(x) })} />
              <Field label="Unités (stock)" type="number" value={v.units} onChange={(x) => update(i, { units: Number(x) })} />
              <Field label="Badge" value={v.badge} onChange={(x) => update(i, { badge: x })} placeholder="Ex. Populaire" />
            </div>
            <div className="flex flex-wrap gap-6">
              <Switch label="Visible sur le site" checked={!v.hidden} onChange={(on) => update(i, { hidden: !on })} hint="Décochée : la variante est masquée aux clients." />
              <Switch label="En rupture de stock" checked={v.sold_out} onChange={(on) => update(i, { sold_out: on })} hint="Affichée avec le tag « Rupture de stock », non cochable." />
              <Switch label="Prix affiché sur la carte" checked={!!v.card} onChange={(on) => update(i, { card: on })} hint="Carte produit et best-seller. Aucune ou toutes cochées : le plus gros prix." />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="pz-btn pz-btn-outline" onClick={() => onChange([...value, emptyVariant()])}>
        <Plus className="h-3.5 w-3.5" />
        Ajouter une variante
      </button>
    </div>
  );
}

/** Vérifie les variantes avant enregistrement ; renvoie un message d'erreur ou null */
export function variantsError(variants: LandingOffer[]): string | null {
  const bad = variants.findIndex((v) => !v.label.trim() || !(Number(v.price) > 0));
  return bad === -1 ? null : `Variante ${bad + 1} : libellé et prix obligatoires`;
}

/** Nettoie les variantes pour l'enregistrement */
export const cleanVariants = (variants: LandingOffer[]): LandingOffer[] =>
  variants.map((v) => ({ ...v, label: v.label.trim(), price: Number(v.price), units: Math.max(1, Math.floor(Number(v.units) || 1)), hidden: !!v.hidden, card: !!v.card }));
