'use client';

import { useState, type ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { insertRow, TABLES, updateRow } from '@/lib/admin';
import { slugify } from '@/lib/format';
import { normalizeLanding } from '@/lib/landing';
import type { Category, LandingBlocks, Product, ProductBenefit } from '@/lib/types';
import { Field, ImageField, Modal, Shown, Switch } from '../components/ui';
import { setFeatured } from './actions';
import VariantsEditor, { cleanVariants, variantsError } from './VariantsEditor';

export const emptyProduct: Partial<Product> = {
  name: '',
  slug: '',
  category_slug: null,
  benefit: '',
  description: '',
  ingredients: '',
  usage: '',
  price: 0,
  compare_at_price: null,
  image_url: '',
  gallery: [],
  rating: 5,
  reviews_count: 0,
  stock: null,
  is_bestseller: false,
  is_new: true,
  is_featured: false,
  is_active: true,
  tagline: '',
  highlights: [],
  story: '',
  benefits: [],
};

const MAX_HIGHLIGHTS = 4;
const BENEFIT_SLOTS = 3;

/**
 * Accroche, points forts, histoire et bienfaits : affichés sur la page produit,
 * et sur la page /best-seller quand le produit est le produit spécial.
 */
export function RichContentFields({
  value,
  set,
  blocks,
  onBlock,
}: {
  value: Partial<Product>;
  set: (patch: Partial<Product>) => void;
  /** Interrupteurs « Affiché » par bloc (absents : pas d'interrupteur) */
  blocks?: LandingBlocks;
  onBlock?: (key: keyof LandingBlocks, shown: boolean) => void;
}) {
  const toggle = (key: keyof LandingBlocks, node: ReactNode) =>
    blocks && onBlock ? <Shown shown={blocks[key]} onChange={(v) => onBlock(key, v)}>{node}</Shown> : node;
  const highlights = Array.from({ length: MAX_HIGHLIGHTS }, (_, i) => value.highlights?.[i] ?? '');
  const benefits = Array.from({ length: BENEFIT_SLOTS }, (_, i) => value.benefits?.[i] ?? { title: '', text: '' });
  const setBenefit = (i: number, patch: Partial<ProductBenefit>) =>
    set({ benefits: benefits.map((b, j) => (j === i ? { ...b, ...patch } : b)) });

  return (
    <div className="space-y-4">
      {toggle('tagline', <Field label="Accroche" value={value.tagline} onChange={(v) => set({ tagline: v })} placeholder="Ex. La cure de 30 jours qui prend soin de votre estomac." hint="Une phrase forte, affichée sous le nom du produit." />)}
      {toggle('highlights', <div>
        <span className="mb-2 block text-[0.6875rem] font-extrabold tracking-[0.04em] text-[var(--pz-muted)] uppercase">Points forts (4 max.)</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {highlights.map((h, i) => (
            <input
              key={i}
              value={h}
              onChange={(e) => set({ highlights: highlights.map((x, j) => (j === i ? e.target.value : x)) })}
              placeholder={['Ex. 60 capsules · 1 mois de cure', 'Ex. Sans additif superflu', 'Ex. Fabriqué selon les normes GMP', 'Ex. Formule 100 % végétale'][i]}
              aria-label={`Point fort ${i + 1}`}
              className="w-full border border-gray-300 bg-transparent px-3 py-2 text-black"
            />
          ))}
        </div>
      </div>)}
      {toggle('story', <Field label="Pourquoi on l'aime (histoire du produit)" textarea rows={4} value={value.story} onChange={(v) => set({ story: v })} hint="Section « Pourquoi on l’aime » de la page produit." />)}
      {toggle('benefits', <div>
        <span className="mb-2 block text-[0.6875rem] font-extrabold tracking-[0.04em] text-[var(--pz-muted)] uppercase">Bienfaits (3 cartes)</span>
        <div className="space-y-3">
          {benefits.map((b, i) => (
            <div key={i} className="grid gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-[1fr_2fr]">
              <input value={b.title} onChange={(e) => setBenefit(i, { title: e.target.value })} placeholder={`Titre ${i + 1}`} aria-label={`Titre du bienfait ${i + 1}`} className="border border-gray-300 bg-transparent px-3 py-2 text-black" />
              <input value={b.text} onChange={(e) => setBenefit(i, { text: e.target.value })} placeholder="Explication courte" aria-label={`Texte du bienfait ${i + 1}`} className="border border-gray-300 bg-transparent px-3 py-2 text-black" />
            </div>
          ))}
        </div>
      </div>)}
    </div>
  );
}

/** Nettoie le formulaire avant enregistrement */
export function toPayload(form: Partial<Product>) {
  const payload: Partial<Product> & { id?: string; created_at?: string; updated_at?: string } = {
    ...form,
    slug: form.slug?.trim() || slugify(form.name ?? ''),
    category_slug: form.category_slug || null,
    gallery: (form.gallery ?? []).filter(Boolean),
    highlights: (form.highlights ?? []).map((h) => h.trim()).filter(Boolean),
    benefits: (form.benefits ?? []).filter((b) => b.title.trim() || b.text.trim()),
  };
  if (form.landing) payload.landing = { ...form.landing, offers: cleanVariants(form.landing.offers ?? []) };
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;
  // is_featured passe par setFeatured (un seul produit du moment à la fois)
  delete payload.is_featured;
  return payload;
}

export default function ProductForm({
  product,
  categories,
  nextOrder,
  onClose,
  onSaved,
}: {
  product: Partial<Product>;
  categories: Category[];
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Product>>(product);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Product>) => setForm((f) => ({ ...f, ...patch }));
  const num = (v: string) => (v === '' ? null : Number(v));
  const blocks = normalizeLanding(form.landing).blocks;
  const setBlock = (key: keyof LandingBlocks, shown: boolean) =>
    set({ landing: { ...normalizeLanding(form.landing), ...form.landing, blocks: { ...blocks, [key]: shown } } });

  const save = async () => {
    if (!form.name?.trim() || !form.price) return toast.error('Nom et prix obligatoires');
    const invalid = variantsError(form.landing?.offers ?? []);
    if (invalid) return toast.error(invalid);
    setSaving(true);
    const payload = toPayload(form);
    let id = product.id;
    if (id) {
      const { error } = await updateRow<Product>(TABLES.products, id, payload);
      if (error) return fail(error);
    } else {
      const { data, error } = await insertRow<Product>(TABLES.products, { ...payload, sort_order: nextOrder });
      if (error || !data) return fail(error ?? 'Création impossible');
      id = data.id;
    }
    if (!!form.is_featured !== !!product.is_featured) {
      const { error } = await setFeatured(form.is_featured ? id : null);
      if (error) return fail(error);
    }
    setSaving(false);
    toast.success(product.id ? 'Produit mis à jour' : 'Produit créé');
    onSaved();
    onClose();
  };

  const fail = (error: string) => {
    setSaving(false);
    toast.error(error.includes('duplicate') ? 'Ce slug existe déjà' : error);
  };

  return (
    <Modal
      title={product.id ? `Modifier « ${product.name} »` : 'Nouveau produit'}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="pz-btn pz-btn-outline" onClick={onClose}>Annuler</button>
          <button className="pz-btn pz-btn-primary" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nom" required value={form.name} onChange={(v) => set({ name: v, slug: product.id ? form.slug : slugify(v) })} />
        <Field label="Slug (URL)" value={form.slug} onChange={(v) => set({ slug: slugify(v) })} hint={`/produit/${form.slug || '…'}`} />
        <div>
          <label className="block" htmlFor="cat">Catégorie</label>
          <select id="cat" value={form.category_slug ?? ''} onChange={(e) => set({ category_slug: e.target.value || null })} className="w-full border border-gray-300 bg-transparent px-3 py-2 text-black">
            <option value="">— Aucune —</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <Field label="Bénéfice court" value={form.benefit} onChange={(v) => set({ benefit: v })} placeholder="Ex. Énergie et vitalité au quotidien" />
        <Field label="Prix (FCFA)" type="number" required value={form.price} onChange={(v) => set({ price: Number(v) })} />
        <Field label="Prix barré (optionnel)" type="number" value={form.compare_at_price} onChange={(v) => set({ compare_at_price: num(v) })} />
        <Field label="Stock" type="number" value={form.stock} onChange={(v) => set({ stock: num(v) })} hint="Laisser vide pour ne pas suivre le stock" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Note (1–5)" type="number" value={form.rating} onChange={(v) => set({ rating: Math.min(5, Math.max(0, Number(v))) })} />
          <Field label="Nb d'avis" type="number" value={form.reviews_count} onChange={(v) => set({ reviews_count: Number(v) })} />
        </div>
        <div className="md:col-span-2">
          <ImageField label="Image principale" value={form.image_url} onChange={(v) => set({ image_url: v })} folder="products" />
        </div>
        <div className="md:col-span-2">
          <Shown shown={blocks.gallery} onChange={(v) => setBlock('gallery', v)}>
          <span className="mb-2 block text-[0.6875rem] font-extrabold tracking-[0.04em] text-[var(--pz-muted)] uppercase">Galerie</span>
          <div className="space-y-3">
            {(form.gallery ?? []).map((url, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <ImageField label={`Photo ${i + 2}`} value={url} folder="products" onChange={(v) => set({ gallery: (form.gallery ?? []).map((g, j) => (j === i ? v : g)) })} />
                </div>
                <button className="pz-btn pz-btn-ghost px-2!" aria-label="Retirer la photo" onClick={() => set({ gallery: (form.gallery ?? []).filter((_, j) => j !== i) })}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button className="pz-btn pz-btn-outline" onClick={() => set({ gallery: [...(form.gallery ?? []), ''] })}><Plus className="h-3.5 w-3.5" />Ajouter une photo</button>
          </div>
          </Shown>
        </div>
        <div className="md:col-span-2">
          <Shown shown={blocks.description} onChange={(v) => setBlock('description', v)}>
            <Field label="Description" textarea rows={4} value={form.description} onChange={(v) => set({ description: v })} />
          </Shown>
        </div>
        <Shown shown={blocks.ingredients} onChange={(v) => setBlock('ingredients', v)}>
          <Field label="Composition" textarea value={form.ingredients} onChange={(v) => set({ ingredients: v })} />
        </Shown>
        <Shown shown={blocks.usage} onChange={(v) => setBlock('usage', v)}>
          <Field label="Conseils d'utilisation" textarea value={form.usage} onChange={(v) => set({ usage: v })} />
        </Shown>

        <div className="md:col-span-2 border-t border-[var(--pz-border)] pt-4">
          <p className="pz-card-title mb-1">Variantes</p>
          <p className="mb-4 text-xs text-slate-500">
            Ex. 1 flacon (60 gélules) 15 jours, 1 flacon (120 gélules) 1 mois. Le client coche celles qu’il veut dans « Détails de la commande ».
            Décochez « Visible sur le site » pour masquer une variante sans la supprimer.
          </p>
          <VariantsEditor
            value={form.landing?.offers ?? []}
            onChange={(offers) => set({ landing: { ...normalizeLanding(form.landing), ...form.landing, offers } })}
          />
        </div>

        <div className="md:col-span-2 border-t border-[var(--pz-border)] pt-4">
          <p className="pz-card-title mb-1">Contenu enrichi</p>
          <p className="mb-4 text-xs text-slate-500">Décochez « Affiché » pour masquer un bloc sur le site sans perdre son contenu.</p>
          <RichContentFields value={form} set={set} blocks={blocks} onBlock={setBlock} />
        </div>

        <div className="flex flex-wrap gap-6 md:col-span-2">
          <Switch label="Visible sur le site" checked={!!form.is_active} onChange={(v) => set({ is_active: v })} />
          <Switch label="Meilleure vente" checked={!!form.is_bestseller} onChange={(v) => set({ is_bestseller: v })} />
          <Switch label="Nouveauté" checked={!!form.is_new} onChange={(v) => set({ is_new: v })} />
          <Switch label="Produit spécial" checked={!!form.is_featured} onChange={(v) => set({ is_featured: v })} hint="Remplace le produit spécial actuel (page /best-seller)" />
        </div>
      </div>
    </Modal>
  );
}
