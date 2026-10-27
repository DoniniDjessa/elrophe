'use client';

import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { TABLES, updateRow } from '@/lib/admin';
import { defaultLanding, normalizeLanding, SPECIAL_PATH } from '@/lib/landing';
import type { LandingBlocks, LandingFaq, LandingIngredient, LandingReview, LandingSection, Product, ProductLanding } from '@/lib/types';
import { Field, ImageField, Shown, Switch } from '../components/ui';
import { setFeatured } from './actions';
import { RichContentFields } from './ProductForm';
import VariantsEditor, { cleanVariants, variantsError } from './VariantsEditor';

const input = 'w-full border border-gray-300 bg-transparent px-3 py-2 text-black';
const reasonExamples = ['Ex. Formule naturelle et complète', 'Ex. Ingrédients de qualité sélectionnés', 'Ex. Adapté à une utilisation quotidienne', 'Ex. Sans additifs inutiles', ''];

/**
 * Produit spécial : un seul produit, mis en avant sur l'accueil et présenté sur sa propre page /best-seller
 * (grande présentation + commande directe). Son contenu se remplit ici.
 */
export default function SpecialTab({ rows, reload }: { rows: Product[]; reload: () => void }) {
  const special = rows.find((p) => p.is_featured) ?? null;
  // Meilleures ventes en premier dans la liste
  const options = [...rows].sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller) || a.name.localeCompare(b.name, 'fr'));

  return (
    <div className="space-y-6">
      <div className="pz-card">
        <div className="pz-card-header flex-wrap">
          <div className="flex items-center gap-3">
            <span className="pz-stat-icon"><Sparkles className="h-4 w-4" /></span>
            <div>
              <h2 className="pz-card-title">Produit spécial</h2>
              <p className="text-xs text-slate-500">
                Mis en avant sous le hero de l’accueil. Sa carte mène à sa page de vente <code>{SPECIAL_PATH}</code>, avec le formulaire de commande en bas.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={special?.id ?? ''}
              onChange={async (e) => {
                const { error } = await setFeatured(e.target.value || null);
                if (error) toast.error(error);
                else toast.success(e.target.value ? 'Produit spécial mis à jour' : 'Produit spécial retiré');
                reload();
              }}
              aria-label="Choisir le produit spécial"
              className="min-w-64 border border-gray-300 bg-transparent px-3 py-2 text-black"
            >
              <option value="">— Choisir un produit —</option>
              {options.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.is_bestseller ? ' — meilleure vente' : ''}
                  {p.is_active ? '' : ' (masqué)'}
                </option>
              ))}
            </select>
            {special && (
              <a href={SPECIAL_PATH} target="_blank" rel="noopener noreferrer" className="pz-btn pz-btn-outline">
                <ExternalLink className="h-3.5 w-3.5" />
                Voir la page
              </a>
            )}
          </div>
        </div>
        {!special && <div className="pz-empty">Choisissez le produit spécial pour remplir sa page de vente.</div>}
      </div>

      {/* key : le formulaire repart des valeurs du produit à chaque changement */}
      {special && <SpecialEditor key={special.id} product={special} reload={reload} />}
    </div>
  );
}

function SpecialEditor({ product, reload }: { product: Product; reload: () => void }) {
  const [landing, setLanding] = useState<ProductLanding>(() => (product.landing ? normalizeLanding(product.landing) : defaultLanding));
  const [info, setInfo] = useState<Partial<Product>>(product);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<ProductLanding>) => setLanding((l) => ({ ...l, ...patch }));
  const setInfoPatch = (patch: Partial<Product>) => setInfo((f) => ({ ...f, ...patch }));
  const trust = Array.from({ length: 4 }, (_, i) => landing.trust[i] ?? '');
  const reasons = Array.from({ length: 5 }, (_, i) => landing.reasons[i] ?? '');
  const block = (key: keyof LandingBlocks) => ({
    shown: landing.blocks[key],
    onShown: (v: boolean) => set({ blocks: { ...landing.blocks, [key]: v } }),
  });

  const checks = [
    { label: 'Bannière (texte ou visuel)', ok: !!(landing.hero_text.trim() || landing.hero_image || info.tagline?.trim()) },
    { label: '3 points forts ou plus', ok: (info.highlights ?? []).filter((h) => h.trim()).length >= 3 },
    { label: 'Texte « À propos »', ok: !!(landing.about_text.trim() || info.description?.trim()) },
    { label: '4 ingrédients illustrés', ok: landing.ingredient_cards.filter((c) => c.name.trim() && c.image_url).length >= 4 },
    { label: 'Conseils et précautions', ok: !!info.usage?.trim() && !!landing.precautions.trim() },
    { label: '« Pourquoi choisir » (3 lignes)', ok: landing.reasons.filter((r) => r.trim()).length >= 3 },
    { label: 'Au moins une offre visible', ok: landing.offers.some((o) => !o.hidden) },
  ];
  const done = checks.filter((c) => c.ok).length;

  const save = async () => {
    const invalid = variantsError(landing.offers);
    if (invalid) return toast.error(invalid);
    setSaving(true);
    const { error } = await updateRow<Product>(TABLES.products, product.id, {
      tagline: info.tagline?.trim() || null,
      description: info.description ?? null,
      ingredients: info.ingredients ?? null,
      usage: info.usage ?? null,
      story: info.story?.trim() || null,
      highlights: (info.highlights ?? []).map((h) => h.trim()).filter(Boolean),
      benefits: (info.benefits ?? []).filter((b) => b.title.trim() || b.text.trim()),
      landing: {
        ...landing,
        hero_image: landing.hero_image || null,
        trust: landing.trust.map((t) => t.trim()).filter(Boolean),
        sections: landing.sections.filter((s) => s.title.trim() || s.text.trim() || s.image_url),
        reviews: landing.reviews.filter((r) => r.name.trim() && r.text.trim()),
        faq: landing.faq.filter((f) => f.question.trim() && f.answer.trim()),
        ingredient_cards: landing.ingredient_cards.filter((c) => c.name.trim()),
        reasons: landing.reasons.map((r) => r.trim()).filter(Boolean),
        reasons_image: landing.reasons_image || null,
        offers: cleanVariants(landing.offers),
      },
    });
    setSaving(false);
    if (error) {
      return toast.error(error.includes('landing') ? 'Colonne « landing » absente : exécutez supabase/migration-page-de-vente.sql dans Supabase.' : error);
    }
    toast.success('Page du produit spécial enregistrée — le site est à jour');
    reload();
  };

  const saveButton = (
    <button className="pz-btn pz-btn-primary" onClick={save} disabled={saving}>
      <Save className="h-3.5 w-3.5" />
      {saving ? 'Enregistrement…' : 'Enregistrer'}
    </button>
  );

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <Card title="1. Bannière" hint="Haut de la page /best-seller. Vides : catégorie, nom et accroche du produit, feuillage par défaut.">
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <Field label="Pastille au-dessus du titre" value={landing.hero_badge} onChange={(v) => set({ hero_badge: v })} placeholder="Ex. Santé digestive" />
              <Field label="Grand titre" value={landing.hero_title} onChange={(v) => set({ hero_title: v })} placeholder={product.name} />
              <Shown shown={landing.blocks.hero_text} onChange={block('hero_text').onShown}>
                <Field label="Sous-titre" textarea rows={3} value={landing.hero_text} onChange={(v) => set({ hero_text: v })} placeholder="Ex. Complément alimentaire à base d’extraits végétaux sélectionnés." />
              </Shown>
            </div>
            <ImageField label="Visuel de fond (paysage, sujet à droite)" value={landing.hero_image} onChange={(v) => set({ hero_image: v })} folder="landing" aspect="aspect-[4/3]" />
          </div>
        </Card>

        <Card title="2. Pictogrammes de la bannière" hint="3 ou 4 libellés courts sous le titre (ex. Ingrédients naturels, Livraison express gratuite)." {...block('trust')}>
          <div className="grid gap-2 sm:grid-cols-2">
            {trust.map((t, i) => (
              <input
                key={i}
                value={t}
                onChange={(e) => set({ trust: trust.map((x, j) => (j === i ? e.target.value : x)) })}
                placeholder={defaultLanding.trust[i]}
                aria-label={`Pictogramme ${i + 1}`}
                className={input}
              />
            ))}
          </div>
        </Card>

        <Card title="3. À propos du produit" hint="Texte de présentation, puis 4 pictogrammes : les points forts ci-dessous." {...block('about')}>
          <div className="space-y-4">
            <Field label="Texte « À propos du produit »" textarea rows={4} value={landing.about_text} onChange={(v) => set({ about_text: v })} placeholder={info.description || 'Vide : description du produit'} />
            <RichContentFields value={info} set={setInfoPatch} blocks={landing.blocks} onBlock={(key, v) => block(key).onShown(v)} />
            <Shown shown={landing.blocks.description} onChange={block('description').onShown}>
              <Field label="Description du produit" textarea rows={3} value={info.description} onChange={(v) => setInfoPatch({ description: v })} hint="Utilisée sur la fiche produit et l’accueil." />
            </Shown>
          </div>
        </Card>

        <ListCard<LandingIngredient>
          title="4. Ingrédients principaux"
          hint="Cartes illustrées (4 conseillées). Le bouton « Voir la liste complète » affiche la composition ci-dessous."
          {...block('ingredient_cards')}
          items={landing.ingredient_cards}
          onChange={(ingredient_cards) => set({ ingredient_cards })}
          empty={{ name: '', image_url: '' }}
          addLabel="Ajouter un ingrédient"
          render={(c, update) => (
            <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
              <Field label="Nom" value={c.name} onChange={(v) => update({ name: v })} placeholder="Ex. Gomme de mastic" />
              <ImageField label="Photo (carrée)" value={c.image_url} onChange={(v) => update({ image_url: v })} folder="landing" />
            </div>
          )}
        />

        <Card title="5. Composition, conseils et précautions">
          <div className="space-y-4">
            <Shown shown={landing.blocks.ingredients} onChange={block('ingredients').onShown}>
              <Field label="Liste complète des ingrédients" textarea rows={3} value={info.ingredients} onChange={(v) => setInfoPatch({ ingredients: v })} />
            </Shown>
            <Shown shown={landing.blocks.usage} onChange={block('usage').onShown}>
              <Field label="Conseils d’utilisation" textarea rows={3} value={info.usage} onChange={(v) => setInfoPatch({ usage: v })} />
            </Shown>
            <Shown shown={landing.blocks.precautions} onChange={block('precautions').onShown}>
              <Field
                label="Précautions"
                textarea
                rows={3}
                value={landing.precautions}
                onChange={(v) => set({ precautions: v })}
                placeholder="Ex. Complément alimentaire. Ne se substitue pas à une alimentation variée et équilibrée. Tenir hors de portée des enfants."
              />
            </Shown>
          </div>
        </Card>

        <Card title={`6. « Pourquoi choisir ${product.name} ? »`} hint="Liste cochée en bas de la présentation (5 lignes max.)." {...block('reasons')}>
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-2">
              {reasons.map((r, i) => (
                <input
                  key={i}
                  value={r}
                  onChange={(e) => set({ reasons: reasons.map((x, j) => (j === i ? e.target.value : x)) })}
                  placeholder={reasonExamples[i]}
                  aria-label={`Raison ${i + 1}`}
                  className={input}
                />
              ))}
            </div>
            <ImageField label="Visuel (portrait)" value={landing.reasons_image} onChange={(v) => set({ reasons_image: v })} folder="landing" aspect="aspect-[3/4]" />
          </div>
        </Card>

        <ListCard<LandingSection>
          title="7. Sections complémentaires (facultatif)"
          hint="Une bannière par section : titre, image en grand, puis le texte."
          {...block('sections')}
          items={landing.sections}
          onChange={(sections) => set({ sections })}
          empty={{ title: '', text: '', image_url: '' }}
          addLabel="Ajouter une section"
          render={(s, update) => (
            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
              <div className="space-y-3">
                <Field label="Titre" value={s.title} onChange={(v) => update({ title: v })} placeholder="Ex. 4 actifs complémentaires dans une seule gélule" />
                <Field label="Texte" textarea rows={6} value={s.text} onChange={(v) => update({ text: v })} />
              </div>
              <ImageField label="Image (paysage 4:3)" value={s.image_url} onChange={(v) => update({ image_url: v })} folder="landing" aspect="aspect-[4/3]" />
            </div>
          )}
        />

        <Card
          title="8. Offres du formulaire « Commandez maintenant »"
          hint="Le client les coche dans « Détails de la commande ». Aussi modifiables depuis la fiche du produit (onglet Produits)."
        >
          <VariantsEditor value={landing.offers} onChange={(offers) => set({ offers })} />
        </Card>

        <ListCard<LandingReview>
          title="9. Avis clients"
          hint="Section « Ils l’ont adopté ». Utilisez de vrais retours clients."
          {...block('reviews')}
          items={landing.reviews}
          onChange={(reviews) => set({ reviews })}
          empty={{ name: '', location: '', text: '' }}
          addLabel="Ajouter un avis"
          render={(r, update) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={r.name} onChange={(e) => update({ name: e.target.value })} placeholder="Prénom et initiale" aria-label="Nom" className={input} />
                <input value={r.location} onChange={(e) => update({ location: e.target.value })} placeholder="Ville" aria-label="Ville" className={input} />
              </div>
              <textarea value={r.text} onChange={(e) => update({ text: e.target.value })} placeholder="Son avis" aria-label="Avis" rows={2} className={input} />
            </div>
          )}
        />

        <ListCard<LandingFaq>
          title="10. Questions fréquentes"
          hint="Affichées avant le formulaire, après la composition et les conseils d’utilisation."
          {...block('faq')}
          items={landing.faq}
          onChange={(faq) => set({ faq })}
          empty={{ question: '', answer: '' }}
          addLabel="Ajouter une question"
          render={(f, update) => (
            <div className="space-y-3">
              <input value={f.question} onChange={(e) => update({ question: e.target.value })} placeholder="Question" aria-label="Question" className={input} />
              <textarea value={f.answer} onChange={(e) => update({ answer: e.target.value })} placeholder="Réponse" aria-label="Réponse" rows={2} className={input} />
            </div>
          )}
        />

        <Card title="11. Formulaire de commande">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Titre" value={landing.order_title} onChange={(v) => set({ order_title: v })} />
            <Field label="Sous-titre" value={landing.order_subtitle} onChange={(v) => set({ order_subtitle: v })} />
            <Field label="Pastille" value={landing.order_badge} onChange={(v) => set({ order_badge: v })} hint="Ex. Paiement uniquement à la livraison" />
            <Field label="Titre livraison" value={landing.delivery_title} onChange={(v) => set({ delivery_title: v })} />
            <Field className="md:col-span-2" label="Texte livraison" value={landing.delivery_text} onChange={(v) => set({ delivery_text: v })} />
            <div className="md:col-span-2">
              <Switch
                label="Livraison offerte"
                checked={landing.free_shipping}
                onChange={(v) => set({ free_shipping: v })}
                hint="Pour les commandes passées depuis cette page. Sinon, les frais de livraison de la boutique s’appliquent."
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">{saveButton}</div>
      </div>

      <aside className="pz-card p-5 lg:sticky lg:top-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image_url || ''} alt="" className="h-16 w-16 rounded-md border border-gray-200 bg-gray-50 object-contain" />
          <div className="min-w-0">
            <p className="truncate font-extrabold">{product.name}</p>
            <p className="text-xs text-slate-500">
              Page remplie à {done}/{checks.length}
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm">
          {checks.map((c) => (
            <li key={c.label} className={c.ok ? 'text-emerald-700' : 'text-slate-400'}>
              {c.ok ? '✓' : '○'} {c.label}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-2">
          {saveButton}
          <a href={SPECIAL_PATH} target="_blank" rel="noopener noreferrer" className="pz-btn pz-btn-outline justify-center">
            <ExternalLink className="h-3.5 w-3.5" />
            Voir la page
          </a>
        </div>
      </aside>
    </div>
  );
}

function Card({
  title,
  hint,
  shown,
  onShown,
  children,
}: {
  title: string;
  hint?: string;
  /** Bloc affiché sur la page (absent : toujours affiché) */
  shown?: boolean;
  onShown?: (v: boolean) => void;
  children: ReactNode;
}) {
  const hidden = shown === false;
  return (
    <div className="pz-card">
      <div className="pz-card-header flex-wrap">
        <div>
          <h2 className="pz-card-title">
            {title}
            {hidden && <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">Masqué</span>}
          </h2>
          {hint && <p className="text-xs text-slate-500">{hint}</p>}
        </div>
        {onShown && <Switch label="Affiché sur la page" checked={!hidden} onChange={onShown} />}
      </div>
      <div className={`p-5 ${hidden ? 'opacity-55' : ''}`}>{children}</div>
    </div>
  );
}

/** Liste éditable : déplacer, masquer, supprimer, ajouter */
function ListCard<T extends { hidden?: boolean }>({
  title,
  hint,
  shown,
  onShown,
  items,
  onChange,
  empty,
  addLabel,
  render,
}: {
  title: string;
  hint: string;
  shown?: boolean;
  onShown?: (v: boolean) => void;
  items: T[];
  onChange: (items: T[]) => void;
  empty: T | (() => T);
  addLabel: string;
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  const update = (i: number, patch: Partial<T>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <Card title={title} hint={hint} shown={shown} onShown={onShown}>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className={`rounded-md border p-4 ${item.hidden ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-200'}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-extrabold text-slate-500">
                #{i + 1}
                {item.hidden && <span className="rounded bg-gray-200 px-1.5 py-0.5 font-bold text-slate-600">Masqué</span>}
              </span>
              <div className="flex items-center gap-3">
                <Switch label="Visible" checked={!item.hidden} onChange={(on) => update(i, { hidden: !on } as Partial<T>)} />
                <div className="flex gap-1">
                  <button className="pz-btn pz-btn-ghost px-2!" aria-label="Monter" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                  <button className="pz-btn pz-btn-ghost px-2!" aria-label="Descendre" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
                  <button className="pz-btn pz-btn-ghost px-2!" aria-label="Supprimer" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
            {render(item, (patch) => update(i, patch))}
          </div>
        ))}
        <button className="pz-btn pz-btn-outline" onClick={() => onChange([...items, typeof empty === 'function' ? (empty as () => T)() : empty])}>
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>
    </Card>
  );
}
