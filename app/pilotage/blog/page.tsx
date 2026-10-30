'use client';

import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowDown, ArrowUp, ExternalLink, Heading2, ImagePlus, List, Plus, Quote, RefreshCw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { db, IMAGE_ACCEPT, isMissingTable, saveSetting, TABLES, uploadImage } from '@/lib/admin';
import { slugify } from '@/lib/format';
import { mergeSettings } from '@/lib/settings';
import { defaultSettings } from '@/data/site';
import type { BlogIcon, BlogPost, BlogSettings } from '@/lib/types';
import { blogIcons, formatViews } from '@/components/site/blog/blog';
import AdminGate, { MigrationNotice } from '../components/AdminGate';
import CrudList from '../components/CrudList';
import { Field, ImageField, PageTitle, Switch } from '../components/ui';

const tabs = [
  { id: 'articles', label: 'Articles' },
  { id: 'page', label: 'Page du blog' },
] as const;
type TabId = (typeof tabs)[number]['id'];

const iconOptions = Object.entries(blogIcons) as [BlogIcon, (typeof blogIcons)[BlogIcon]][];

/** Environ 200 mots lus par minute */
const readingTime = (text: string) => Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 200));

function Card({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="pz-card">
      <div className="pz-card-header">
        <h2 className="pz-card-title">{title}</h2>
        {aside}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function IconSelect({ id, value, onChange }: { id: string; value: BlogIcon; onChange: (v: BlogIcon) => void }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value as BlogIcon)} className="w-full border border-gray-300 bg-transparent px-2 py-2 text-black">
      {iconOptions.map(([key, o]) => (
        <option key={key} value={key}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Texte de l'article, avec raccourcis de mise en forme et envoi d'images */
function ContentEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const area = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  /** Insère un bloc à l'endroit du curseur (ou à la fin), entouré de lignes vides */
  const insert = (snippet: string) => {
    const el = area.current;
    const at = el ? el.selectionEnd : value.length;
    const before = value.slice(0, at).replace(/\s*$/, '');
    const after = value.slice(at).replace(/^\s*/, '');
    onChange(`${before}${before ? '\n\n' : ''}${snippet}${after ? `\n\n${after}` : ''}`);
  };

  const upload = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try {
      insert(`![Légende de l’image](${await uploadImage(f, 'blog', 1600)})`);
      toast.success('Image ajoutée au texte');
    } catch (err) {
      toast.error(`Envoi impossible : ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusy(false);
      if (file.current) file.current.value = '';
    }
  };

  return (
    <div>
      <label htmlFor="post-content" className="block">
        Texte de l’article
      </label>
      <div className="flex flex-wrap gap-1 border border-b-0 border-gray-300 bg-gray-50 p-1">
        <button type="button" className="pz-btn pz-btn-ghost px-2!" onClick={() => insert('## Intertitre')}>
          <Heading2 className="h-3.5 w-3.5" />
          Intertitre
        </button>
        <button type="button" className="pz-btn pz-btn-ghost px-2!" onClick={() => insert('- Premier point\n- Deuxième point')}>
          <List className="h-3.5 w-3.5" />
          Liste
        </button>
        <button type="button" className="pz-btn pz-btn-ghost px-2!" onClick={() => insert('> Phrase mise en avant')}>
          <Quote className="h-3.5 w-3.5" />
          Citation
        </button>
        <label className={`pz-btn pz-btn-ghost px-2! ${busy ? 'pointer-events-none opacity-55' : 'cursor-pointer'}`}>
          {busy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          Image
          <input ref={file} type="file" accept={IMAGE_ACCEPT} className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      </div>
      <textarea
        ref={area}
        id="post-content"
        rows={16}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 bg-transparent px-3 py-2 font-mono text-[13px] leading-relaxed text-black focus:outline-none"
      />
      <p className="mt-1 text-xs text-slate-500">
        Laissez une ligne vide entre deux paragraphes. « ## » au début = intertitre, « - » = liste, « &gt; » = citation, **mot** = gras. Une image s’écrit
        ![légende](adresse) sur sa propre ligne.
      </p>
    </div>
  );
}

function ArticlesTab({ settings }: { settings: BlogSettings }) {
  const today = new Date().toISOString().slice(0, 10);
  const catName = (slug: string | null) => settings.categories.find((c) => c.slug === slug)?.name ?? 'Sans catégorie';
  return (
    <CrudList<BlogPost>
      embedded
      wide
      sortable={false}
      omitOnSave={['views']}
      order="published_at"
      ascending={false}
      table={TABLES.blog}
      eyebrow="Blog"
      title="Articles"
      subtitle="Du plus récent au plus ancien, comme sur le site. L’article « à la une » s’affiche en grand en haut du blog."
      itemLabel="un article"
      imageField="cover_url"
      emptyItem={{
        slug: '',
        title: '',
        excerpt: '',
        content: '',
        cover_url: '',
        cover_alt: '',
        category_slug: settings.categories[0]?.slug ?? null,
        author: 'Équipe EL ROPHE',
        published_at: today,
        reading_minutes: 5,
        views: 0,
        is_featured: false,
        is_active: true,
      }}
      summary={(p) => ({
        image: p.cover_url,
        title: `${p.is_featured ? '★ ' : ''}${p.title}`,
        subtitle: `${catName(p.category_slug)} · ${new Date(`${p.published_at}T12:00:00`).toLocaleDateString('fr-FR')} · ${formatViews(p.views ?? 0)} vues`,
      })}
      validate={(p) => (!p.title?.trim() ? 'Titre obligatoire' : !p.slug?.trim() ? 'Adresse (slug) obligatoire' : null)}
      renderForm={(p, set, isNew) => (
        <>
          <Field label="Titre" required value={p.title} onChange={(v) => set(isNew ? { title: v, slug: slugify(v) } : { title: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Adresse (slug)" value={p.slug} onChange={(v) => set({ slug: slugify(v) })} hint={`/blog/${p.slug || '…'}`} />
            <div>
              <label className="block" htmlFor="post-cat">
                Catégorie
              </label>
              <select
                id="post-cat"
                value={p.category_slug ?? ''}
                onChange={(e) => set({ category_slug: e.target.value || null })}
                className="w-full border border-gray-300 bg-transparent px-3 py-2 text-black"
              >
                <option value="">— Aucune —</option>
                {settings.categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">Les catégories se gèrent dans l’onglet « Page du blog ».</p>
            </div>
          </div>
          <Field label="Résumé" textarea rows={3} value={p.excerpt} onChange={(v) => set({ excerpt: v })} hint="Affiché sur l’article à la une, sous le titre de l’article et dans Google." />
          <ImageField label="Image de couverture (paysage 16:9)" value={p.cover_url} onChange={(v) => set({ cover_url: v })} folder="blog" aspect="aspect-[16/9]" max={1800} />
          <Field label="Description de l’image (accessibilité)" value={p.cover_alt} onChange={(v) => set({ cover_alt: v })} />
          <ContentEditor value={p.content ?? ''} onChange={(v) => set({ content: v })} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date de publication" type="date" value={p.published_at} onChange={(v) => set({ published_at: v })} />
            <div>
              <Field label="Temps de lecture (min)" type="number" value={p.reading_minutes} onChange={(v) => set({ reading_minutes: Math.max(0, Number(v)) })} />
              <button type="button" className="mt-1 text-xs font-semibold text-indigo-600 underline" onClick={() => set({ reading_minutes: readingTime(p.content ?? '') })}>
                Calculer d’après le texte
              </button>
            </div>
            <Field label="Auteur" value={p.author} onChange={(v) => set({ author: v })} />
          </div>
          <Switch label="Article à la une" checked={!!p.is_featured} onChange={(v) => set({ is_featured: v })} hint="Affiché en grand en haut du blog. Plusieurs articles à la une : le plus récent l’emporte." />
          <Switch label="Visible sur le site" checked={!!p.is_active} onChange={(v) => set({ is_active: v })} />
          {!isNew && <p className="text-xs text-slate-500">{formatViews(p.views ?? 0)} vues depuis la publication.</p>}
        </>
      )}
    />
  );
}

function PageTab({ settings, setSettings, missing }: { settings: BlogSettings; setSettings: (s: BlogSettings) => void; missing: boolean }) {
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const s = settings;
  const update = (patch: Partial<BlogSettings>) => {
    setSettings({ ...s, ...patch });
    setDirty(true);
  };
  const setHero = (patch: Partial<BlogSettings['hero']>) => update({ hero: { ...s.hero, ...patch } });
  const setNews = (patch: Partial<BlogSettings['newsletter']>) => update({ newsletter: { ...s.newsletter, ...patch } });
  const setCategory = (i: number, patch: Partial<BlogSettings['categories'][number]>) =>
    update({ categories: s.categories.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const moveCategory = (i: number, dir: -1 | 1) => {
    const next = [...s.categories];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    update({ categories: next });
  };

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = async () => {
    const slugs = s.categories.map((c) => c.slug);
    if (s.categories.some((c) => !c.name.trim() || !c.slug)) return toast.error('Chaque catégorie doit avoir un nom');
    if (new Set(slugs).size !== slugs.length) return toast.error('Deux catégories ont la même adresse');
    setSaving(true);
    const { error } = await saveSetting('blog', s);
    setSaving(false);
    if (error) return toast.error(error);
    setDirty(false);
    toast.success('Enregistré — le blog est à jour');
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        {dirty && <span className="text-xs font-semibold text-amber-600">Modifications non enregistrées</span>}
        <button className="pz-btn pz-btn-primary" onClick={save} disabled={saving || missing}>
          <Save className="h-3.5 w-3.5" />
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Bannière">
          <Field label="Surtitre" value={s.hero.kicker} onChange={(v) => setHero({ kicker: v })} />
          <Field label="Titre" value={s.hero.title} onChange={(v) => setHero({ title: v })} />
          <Field label="Texte" textarea rows={3} value={s.hero.text} onChange={(v) => setHero({ text: v })} hint="Aussi utilisé comme description du blog dans Google." />
          <Field label="Texte de la barre de recherche" value={s.hero.search_placeholder} onChange={(v) => setHero({ search_placeholder: v })} />
          <ImageField label="Image de fond (paysage, sujet à droite)" value={s.hero.image_url} onChange={(v) => setHero({ image_url: v })} folder="blog" aspect="aspect-[16/9]" max={2400} />
        </Card>

        <Card
          title="Catégories"
          aside={
            <button className="pz-btn pz-btn-ghost" onClick={() => update({ categories: [...s.categories, { slug: '', name: '', icon: 'leaf' }] })}>
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          }
        >
          <Field label="Pastille « toutes les catégories »" value={s.all_label} onChange={(v) => update({ all_label: v })} />
          {s.categories.map((c, i) => (
            <div key={i} className="flex items-end gap-2 rounded-md border border-gray-200 p-3">
              <Field className="flex-1" label="Nom" value={c.name} onChange={(v) => setCategory(i, c.slug && c.slug !== slugify(c.name) ? { name: v } : { name: v, slug: slugify(v) })} />
              <div className="w-36">
                <label className="block" htmlFor={`cat-icon-${i}`}>
                  Icône
                </label>
                <IconSelect id={`cat-icon-${i}`} value={c.icon} onChange={(v) => setCategory(i, { icon: v })} />
              </div>
              <button className="pz-btn pz-btn-ghost mb-0.5 px-2!" disabled={i === 0} onClick={() => moveCategory(i, -1)} aria-label="Monter">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button className="pz-btn pz-btn-ghost mb-0.5 px-2!" disabled={i === s.categories.length - 1} onClick={() => moveCategory(i, 1)} aria-label="Descendre">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                className="pz-btn pz-btn-ghost mb-0.5 px-2! text-red-600!"
                aria-label="Retirer la catégorie"
                onClick={() => confirm(`Retirer « ${c.name || 'cette catégorie'} » ? Ses articles resteront visibles, sans catégorie.`) && update({ categories: s.categories.filter((_, j) => j !== i) })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <p className="text-xs text-slate-500">Seules les catégories qui ont au moins un article visible s’affichent sur le blog.</p>
        </Card>

        <Card title="Liste des articles">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Étiquette de l’article à la une" value={s.featured_label} onChange={(v) => update({ featured_label: v })} hint="Vide : masquée" />
            <Field label="Titre de la liste" value={s.latest_title} onChange={(v) => update({ latest_title: v })} />
            <Field label="Lien « voir tout »" value={s.see_all_label} onChange={(v) => update({ see_all_label: v })} hint="Apparaît au-delà de 3 articles" />
            <Field label="Titre « à lire aussi » (bas d’article)" value={s.related_title} onChange={(v) => update({ related_title: v })} />
          </div>
          <Switch label="Afficher le nombre de vues" checked={s.show_views} onChange={(v) => update({ show_views: v })} />
        </Card>

        <Card title="Newsletter" aside={<Switch label="Visible" checked={s.newsletter.visible} onChange={(v) => setNews({ visible: v })} />}>
          <Field label="Titre" value={s.newsletter.title} onChange={(v) => setNews({ title: v })} />
          <Field label="Texte" value={s.newsletter.text} onChange={(v) => setNews({ text: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Champ e-mail" value={s.newsletter.placeholder} onChange={(v) => setNews({ placeholder: v })} />
            <Field label="Bouton" value={s.newsletter.button_label} onChange={(v) => setNews({ button_label: v })} />
          </div>
          <Field label="Message après inscription" value={s.newsletter.success_message} onChange={(v) => setNews({ success_message: v })} />
          <ImageField label="Image de fond (côté droit)" value={s.newsletter.image_url} onChange={(v) => setNews({ image_url: v })} folder="blog" aspect="aspect-[16/9]" />
          <p className="text-xs text-slate-500">
            Les inscrits apparaissent dans <a href="/pilotage/newsletter" className="font-extrabold underline">Newsletter</a>.
          </p>
        </Card>

        <Card title="Bandeau de réassurance (bas de page)">
          {s.trust.map((t, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="w-36">
                <label className="block" htmlFor={`trust-icon-${i}`}>
                  Icône
                </label>
                <IconSelect id={`trust-icon-${i}`} value={t.icon} onChange={(v) => update({ trust: s.trust.map((x, j) => (j === i ? { ...x, icon: v } : x)) })} />
              </div>
              <Field className="flex-1" label={`Texte ${i + 1}`} value={t.text} onChange={(v) => update({ trust: s.trust.map((x, j) => (j === i ? { ...x, text: v } : x)) })} />
            </div>
          ))}
          <p className="text-xs text-slate-500">Texte vide : élément masqué.</p>
        </Card>
      </div>
    </>
  );
}

function Blog() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: TabId = tabs.some((t) => t.id === params.get('tab')) ? (params.get('tab') as TabId) : 'articles';
  const [settings, setSettings] = useState<BlogSettings>(defaultSettings.blog);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);

  useEffect(() => {
    db()
      .from(TABLES.settings)
      .select('key, value')
      .eq('key', 'blog')
      .then(({ data, error }) => {
        if (error) setMissing(isMissingTable(error.message));
        setSettings(mergeSettings(data ?? []).blog);
        setLoading(false);
      });
    // La table des articles vient de supabase/migration-blog.sql
    db()
      .from(TABLES.blog)
      .select('id', { head: true, count: 'exact' })
      .then(({ error }) => setTableMissing(!!error && isMissingTable(error.message)));
  }, []);

  return (
    <>
      <PageTitle
        eyebrow="Site"
        title="Blog"
        subtitle="Articles, catégories et textes de la page /blog."
        actions={
          <a href="/blog" target="_blank" rel="noopener noreferrer" className="pz-btn pz-btn-outline">
            <ExternalLink className="h-3.5 w-3.5" />
            Voir le blog
          </a>
        }
      />
      {tableMissing && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          La table des articles n’existe pas encore : exécutez une fois le fichier <code>supabase/migration-blog.sql</code> dans l’éditeur SQL de Supabase (il ajoute
          aussi 4 articles d’exemple).
        </div>
      )}
      {missing && <MigrationNotice />}

      <div className="pz-seg mb-6" role="tablist" aria-label="Sections du blog">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => router.replace(`${pathname}?tab=${t.id}`, { scroll: false })}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="pz-card pz-empty">Chargement…</div>
      ) : tab === 'articles' ? (
        !tableMissing && <ArticlesTab settings={settings} />
      ) : (
        <PageTab settings={settings} setSettings={setSettings} missing={missing} />
      )}
    </>
  );
}

export default function BlogAdminPage() {
  return (
    <AdminGate>
      <Suspense fallback={<div className="pz-empty">Chargement…</div>}>
        <Blog />
      </Suspense>
    </AdminGate>
  );
}
