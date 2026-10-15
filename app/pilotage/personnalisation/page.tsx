'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ExternalLink, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { db, isMissingTable, saveSetting, TABLES } from '@/lib/admin';
import { mergeSettings } from '@/lib/settings';
import { defaultSettings } from '@/data/site';
import type { Badge, SectionHeading, SettingsKey, SiteSettings, ThemeSettings } from '@/lib/types';
import AdminGate, { MigrationNotice } from '../components/AdminGate';
import { Field, ImageField, PageTitle, Switch } from '../components/ui';

/* ---------- Contraste WCAG ---------- */
function luminance(hex: string) {
  const v = hex.replace('#', '');
  const full = v.length === 3 ? v.split('').map((c) => c + c).join('') : v.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const themeFields: { key: keyof ThemeSettings; label: string; hint: string }[] = [
  { key: 'bg_sage', label: 'Fond principal', hint: 'Vert sauge grisé de la page' },
  { key: 'bg_sage_light', label: 'Fond clair', hint: 'Zones claires et reflets' },
  { key: 'surface_cream', label: 'Surface crème', hint: 'Pilules, cartes, boutons ronds' },
  { key: 'forest', label: 'Vert forêt', hint: 'Boutons principaux, onglet actif' },
  { key: 'ink', label: 'Encre', hint: 'Titres et texte' },
  { key: 'ink_muted', label: 'Texte secondaire', hint: 'Paragraphes' },
  { key: 'leaf', label: 'Feuille (accent)', hint: 'Texte manuscrit, petits détails' },
  { key: 'lime', label: 'Citron vert', hint: 'Pastille du panier' },
];

const presets: { name: string; theme: ThemeSettings }[] = [
  { name: 'Sauge (origine)', theme: defaultSettings.theme },
  { name: 'Argile', theme: { bg_sage: '#D9CBB8', bg_sage_light: '#E9DFD1', surface_cream: '#F6F1EA', forest: '#4A2E1F', ink: '#241A14', ink_muted: '#5A4D44', leaf: '#9A5B2E', lime: '#E8B86A' } },
  { name: 'Eucalyptus', theme: { bg_sage: '#BCCBC6', bg_sage_light: '#D6E0DC', surface_cream: '#F1F3EE', forest: '#173A3A', ink: '#142222', ink_muted: '#4A5755', leaf: '#2F7A6C', lime: '#A8E0C8' } },
];

const badgeIconOptions: { id: Badge['icon']; label: string }[] = [
  { id: 'leaf', label: 'Feuille' },
  { id: 'flask', label: 'Fiole' },
  { id: 'ban', label: 'Interdit' },
  { id: 'rabbit', label: 'Lapin' },
  { id: 'sprout', label: 'Pousse' },
  { id: 'shield', label: 'Bouclier' },
  { id: 'droplet', label: 'Goutte' },
  { id: 'sparkles', label: 'Éclat' },
];

const tabs: { id: SettingsKey; label: string }[] = [
  { id: 'theme', label: 'Apparence' },
  { id: 'hero', label: 'Accueil — hero' },
  { id: 'sections', label: 'Sections' },
  { id: 'brand', label: 'Marque & contact' },
  { id: 'shop', label: 'Boutique' },
];

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

/** Champs communs aux en-têtes de section */
function HeadingFields<T extends SectionHeading>({ value, set }: { value: T; set: (patch: Partial<T>) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Surtitre" value={value.eyebrow} onChange={(v) => set({ eyebrow: v } as Partial<T>)} />
      <Field label="Mot du surtitre en vert" value={value.eyebrow_accent} onChange={(v) => set({ eyebrow_accent: v } as Partial<T>)} />
      <Field label="Titre" value={value.title} onChange={(v) => set({ title: v } as Partial<T>)} />
      <Field label="Mot manuscrit" value={value.script} onChange={(v) => set({ script: v } as Partial<T>)} hint="Une fois par section maximum" />
      <Field className="sm:col-span-2" label="Texte" textarea rows={2} value={value.text} onChange={(v) => set({ text: v } as Partial<T>)} />
    </div>
  );
}

function ThemePreview({ theme }: { theme: ThemeSettings }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200" style={{ background: theme.bg_sage }}>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-extrabold tracking-[0.3em]" style={{ color: theme.ink }}>ELROPHE</span>
        <span className="flex gap-1 rounded-full p-1" style={{ background: theme.surface_cream }}>
          <span className="rounded-full px-3 py-1 text-[10px] text-white" style={{ background: theme.forest }}>Accueil</span>
          <span className="px-3 py-1 text-[10px]" style={{ color: theme.ink }}>Boutique</span>
        </span>
        <span className="relative h-7 w-7 rounded-full" style={{ background: theme.surface_cream }}>
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full" style={{ background: theme.lime }} />
        </span>
      </div>
      <div className="px-4 pt-3 pb-6" style={{ background: `radial-gradient(30rem 14rem at 0% 0%, ${theme.bg_sage_light}, transparent)` }}>
        <p className="text-[9px] font-semibold tracking-[0.3em]" style={{ color: theme.ink }}>
          COLLECTION <span style={{ color: theme.leaf }}>NATUREL</span>
        </p>
        <p className="mt-2 text-xl leading-tight font-extrabold" style={{ color: theme.ink, fontFamily: 'var(--font-ubuntu)' }}>
          Le meilleur de la nature.
        </p>
        <p className="text-2xl italic" style={{ color: theme.leaf, fontFamily: 'cursive' }}>chaque jour.</p>
        <p className="mt-1 text-xs" style={{ color: theme.ink_muted }}>Pur. Efficace. Responsable.</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full px-4 py-2 text-[10px] font-bold tracking-widest text-white" style={{ background: theme.forest }}>DÉCOUVRIR →</span>
          <span className="rounded-2xl px-3 py-2 text-[10px]" style={{ background: theme.surface_cream, color: theme.ink }}>Carte produit</span>
        </div>
      </div>
    </div>
  );
}

function Personnalisation() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [tab, setTab] = useState<SettingsKey>('theme');
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState<Set<SettingsKey>>(new Set());

  useEffect(() => {
    db()
      .from(TABLES.settings)
      .select('key, value')
      .then(({ data, error }) => {
        if (error) setMissing(isMissingTable(error.message));
        setSettings(mergeSettings(data ?? []));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.size) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = <K extends SettingsKey>(key: K, patch: Partial<SiteSettings[K]>) => {
    setSettings((s) => ({ ...s, [key]: { ...s[key], ...patch } }));
    setDirty((d) => new Set(d).add(key));
  };
  const updateSection = <K extends keyof SiteSettings['sections']>(key: K, patch: Partial<SiteSettings['sections'][K]>) =>
    update('sections', { [key]: { ...settings.sections[key], ...patch } } as Partial<SiteSettings['sections']>);

  const save = async () => {
    setSaving(true);
    const { error } = await saveSetting(tab, settings[tab]);
    setSaving(false);
    if (error) return toast.error(error);
    setDirty((d) => {
      const next = new Set(d);
      next.delete(tab);
      return next;
    });
    toast.success('Enregistré — le site est à jour');
  };

  const reset = () => {
    if (!confirm('Rétablir les valeurs d’origine pour cet onglet ? (Il faudra enregistrer.)')) return;
    setSettings((s) => ({ ...s, [tab]: defaultSettings[tab] }));
    setDirty((d) => new Set(d).add(tab));
  };

  const { theme, hero, sections, brand, shop } = settings;
  const checks = [
    { label: 'Texte blanc sur vert forêt (boutons)', ratio: contrast('#ffffff', theme.forest), min: 4.5 },
    { label: 'Titres sur fond principal', ratio: contrast(theme.ink, theme.bg_sage), min: 4.5 },
    { label: 'Texte secondaire sur fond principal', ratio: contrast(theme.ink_muted, theme.bg_sage), min: 4.5 },
    { label: 'Accent manuscrit sur fond principal', ratio: contrast(theme.leaf, theme.bg_sage), min: 3 },
  ];

  return (
    <>
      <PageTitle
        eyebrow="Site"
        title="Personnalisation"
        subtitle="Couleurs, textes et visuels de la vitrine. Chaque onglet s’enregistre séparément."
        actions={
          <>
            <a href="/" target="_blank" rel="noopener noreferrer" className="pz-btn pz-btn-outline"><ExternalLink className="h-3.5 w-3.5" />Voir le site</a>
            <button className="pz-btn pz-btn-outline" onClick={reset}><RotateCcw className="h-3.5 w-3.5" />Valeurs d’origine</button>
            <button className="pz-btn pz-btn-primary" onClick={save} disabled={saving || missing || loading}>
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      />
      {missing && <MigrationNotice />}

      <div className="pz-seg mb-6" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
            {dirty.has(t.id) && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-middle" title="Modifications non enregistrées" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="pz-card pz-empty">Chargement…</div>
      ) : (
        <>
          {tab === 'theme' && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <Card title="Couleurs">
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button key={p.name} className="pz-btn pz-btn-outline" onClick={() => update('theme', p.theme)}>
                      <span className="flex">
                        {[p.theme.bg_sage, p.theme.forest, p.theme.leaf].map((c) => (
                          <span key={c} className="-ml-1 h-3.5 w-3.5 rounded-full border border-white first:ml-0" style={{ background: c }} />
                        ))}
                      </span>
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {themeFields.map((f) => (
                    <div key={f.key} className="flex items-center gap-3">
                      <input
                        type="color"
                        value={theme[f.key]}
                        onChange={(e) => update('theme', { [f.key]: e.target.value } as Partial<ThemeSettings>)}
                        className="h-10 w-12 cursor-pointer rounded-md border border-gray-300 bg-transparent p-0.5"
                        aria-label={f.label}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-[var(--pz-text)]">{f.label}</p>
                        <p className="text-xs text-slate-500">{f.hint}</p>
                      </div>
                      <input
                        value={theme[f.key]}
                        onChange={(e) => update('theme', { [f.key]: e.target.value } as Partial<ThemeSettings>)}
                        className="w-24 border border-gray-300 bg-transparent px-2 py-1 font-mono text-xs text-black uppercase"
                        aria-label={`${f.label} (hex)`}
                      />
                    </div>
                  ))}
                </div>
              </Card>
              <div className="space-y-6">
                <Card title="Aperçu">
                  <ThemePreview theme={theme} />
                </Card>
                <Card title="Lisibilité (WCAG AA)">
                  <ul className="space-y-2">
                    {checks.map((c) => (
                      <li key={c.label} className="flex items-center justify-between gap-3 text-sm">
                        <span>{c.label}</span>
                        <span className={`pz-badge ${c.ratio >= c.min ? 'pz-badge-up' : 'pz-badge-down'}`}>{c.ratio.toFixed(1)} : 1</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500">Minimum conseillé : 4,5 : 1 pour le texte, 3 : 1 pour les grands titres.</p>
                </Card>
              </div>
            </div>
          )}

          {tab === 'hero' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Textes">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Surtitre" value={hero.eyebrow} onChange={(v) => update('hero', { eyebrow: v })} />
                  <Field label="Mot du surtitre en vert" value={hero.eyebrow_accent} onChange={(v) => update('hero', { eyebrow_accent: v })} />
                </div>
                <Field label="Titre — ligne 1" value={hero.title_line1} onChange={(v) => update('hero', { title_line1: v })} />
                <Field label="Titre — ligne 2" value={hero.title_line2} onChange={(v) => update('hero', { title_line2: v })} />
                <Field label="Ligne manuscrite" value={hero.script} onChange={(v) => update('hero', { script: v })} />
                <Field label="Sous-texte" textarea rows={2} value={hero.subtitle} onChange={(v) => update('hero', { subtitle: v })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Bouton principal" value={hero.cta_label} onChange={(v) => update('hero', { cta_label: v })} />
                  <Field label="Lien du bouton" value={hero.cta_href} onChange={(v) => update('hero', { cta_href: v })} />
                  <Field label="Vidéo — titre" value={hero.video_label} onChange={(v) => update('hero', { video_label: v })} />
                  <Field label="Vidéo — sous-titre" value={hero.video_sublabel} onChange={(v) => update('hero', { video_sublabel: v })} />
                </div>
                <Field label="Lien de la vidéo" value={hero.video_url} onChange={(v) => update('hero', { video_url: v })} hint="YouTube, Vimeo ou fichier .mp4. Vide : le bouton mène à « À propos »." />
              </Card>
              <div className="space-y-6">
                <Card title="Image principale">
                  <ImageField label="Image détourée (PNG/WebP transparent conseillé)" value={hero.image_url} onChange={(v) => update('hero', { image_url: v })} folder="hero" aspect="aspect-[9/10]" max={1800} />
                  <Field label="Texte alternatif (accessibilité)" value={hero.image_alt} onChange={(v) => update('hero', { image_alt: v })} />
                </Card>
                <Card
                  title="Badges de confiance"
                  aside={
                    <button className="pz-btn pz-btn-ghost" disabled={hero.badges.length >= 4} onClick={() => update('hero', { badges: [...hero.badges, { icon: 'leaf', line1: '', line2: '' }] })}>
                      <Plus className="h-3.5 w-3.5" />Ajouter
                    </button>
                  }
                >
                  {hero.badges.map((b, i) => {
                    const setBadge = (patch: Partial<Badge>) => update('hero', { badges: hero.badges.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
                    return (
                      <div key={i} className="flex items-end gap-2">
                        <div className="w-28">
                          <label className="block" htmlFor={`badge-icon-${i}`}>Icône</label>
                          <select id={`badge-icon-${i}`} value={b.icon} onChange={(e) => setBadge({ icon: e.target.value as Badge['icon'] })} className="w-full border border-gray-300 bg-transparent px-2 py-2 text-black">
                            {badgeIconOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                          </select>
                        </div>
                        <Field className="flex-1" label="Ligne 1" value={b.line1} onChange={(v) => setBadge({ line1: v })} />
                        <Field className="flex-1" label="Ligne 2" value={b.line2} onChange={(v) => setBadge({ line2: v })} />
                        <button className="pz-btn pz-btn-ghost mb-0.5 px-2! text-red-600!" aria-label="Retirer le badge" onClick={() => update('hero', { badges: hero.badges.filter((_, j) => j !== i) })}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </Card>
              </div>
            </div>
          )}

          {tab === 'sections' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Produit du moment (sous le hero)" aside={<Switch label="Visible" checked={sections.featured.visible} onChange={(v) => updateSection('featured', { visible: v })} />}>
                <p className="rounded-md bg-[var(--pz-50)] p-3 text-xs text-[var(--pz-700)]">
                  Le produit, son accroche et ses points forts se choisissent dans{' '}
                  <a href="/pilotage/boutique?tab=moment" className="font-extrabold underline">Boutique › Produit du moment</a>.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Surtitre" value={sections.featured.eyebrow} onChange={(v) => updateSection('featured', { eyebrow: v })} />
                  <Field label="Mot du surtitre en vert" value={sections.featured.eyebrow_accent} onChange={(v) => updateSection('featured', { eyebrow_accent: v })} />
                  <Field label="Mot manuscrit" value={sections.featured.script} onChange={(v) => updateSection('featured', { script: v })} />
                  <Field label="Bouton" value={sections.featured.cta_label} onChange={(v) => updateSection('featured', { cta_label: v })} />
                </div>
              </Card>
              <Card title="Acheter par catégorie" aside={<Switch label="Visible" checked={sections.categories.visible} onChange={(v) => updateSection('categories', { visible: v })} />}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Titre" value={sections.categories.title} onChange={(v) => updateSection('categories', { title: v })} />
                  <Field label="Lien « voir tout »" value={sections.categories.link_label} onChange={(v) => updateSection('categories', { link_label: v })} />
                </div>
              </Card>
              <Card title="Meilleures ventes" aside={<Switch label="Visible" checked={sections.bestsellers.visible} onChange={(v) => updateSection('bestsellers', { visible: v })} />}>
                <HeadingFields value={sections.bestsellers} set={(p) => updateSection('bestsellers', p)} />
              </Card>
              <Card title="Notre philosophie" aside={<Switch label="Visible" checked={sections.philosophy.visible} onChange={(v) => updateSection('philosophy', { visible: v })} />}>
                <HeadingFields value={sections.philosophy} set={(p) => updateSection('philosophy', p)} />
                <Field label="Bouton" value={sections.philosophy.cta_label} onChange={(v) => updateSection('philosophy', { cta_label: v })} />
                <ImageField label="Photo" value={sections.philosophy.image_url} onChange={(v) => updateSection('philosophy', { image_url: v })} folder="sections" aspect="aspect-[4/5]" />
                <div className="grid gap-3 sm:grid-cols-3">
                  {sections.philosophy.stats.map((s, i) => (
                    <div key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
                      <Field label={`Chiffre ${i + 1}`} value={s.value} onChange={(v) => updateSection('philosophy', { stats: sections.philosophy.stats.map((x, j) => (j === i ? { ...x, value: v } : x)) })} />
                      <Field label="Libellé" value={s.label} onChange={(v) => updateSection('philosophy', { stats: sections.philosophy.stats.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Le rituel" aside={<Switch label="Visible" checked={sections.ritual.visible} onChange={(v) => updateSection('ritual', { visible: v })} />}>
                <HeadingFields value={sections.ritual} set={(p) => updateSection('ritual', p)} />
                {sections.ritual.steps.map((s, i) => (
                  <div key={i} className="grid gap-3 rounded-md border border-gray-200 p-3 sm:grid-cols-[1fr_2fr]">
                    <Field label={`Étape 0${i + 1}`} value={s.title} onChange={(v) => updateSection('ritual', { steps: sections.ritual.steps.map((x, j) => (j === i ? { ...x, title: v } : x)) })} />
                    <Field label="Texte" value={s.text} onChange={(v) => updateSection('ritual', { steps: sections.ritual.steps.map((x, j) => (j === i ? { ...x, text: v } : x)) })} />
                  </div>
                ))}
              </Card>
              <Card title="Ingrédients phares" aside={<Switch label="Visible" checked={sections.ingredients.visible} onChange={(v) => updateSection('ingredients', { visible: v })} />}>
                <HeadingFields value={sections.ingredients} set={(p) => updateSection('ingredients', p)} />
                <p className="text-xs text-slate-500">Les ingrédients se gèrent dans Catalogue › Ingrédients.</p>
              </Card>
              <Card title="Avis clients" aside={<Switch label="Visible" checked={sections.testimonials.visible} onChange={(v) => updateSection('testimonials', { visible: v })} />}>
                <HeadingFields value={sections.testimonials} set={(p) => updateSection('testimonials', p)} />
              </Card>
              <Card title="Newsletter" aside={<Switch label="Visible" checked={sections.newsletter.visible} onChange={(v) => updateSection('newsletter', { visible: v })} />}>
                <HeadingFields value={sections.newsletter} set={(p) => updateSection('newsletter', p)} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Bouton" value={sections.newsletter.button_label} onChange={(v) => updateSection('newsletter', { button_label: v })} />
                  <Field label="Message de confirmation" value={sections.newsletter.success_message} onChange={(v) => updateSection('newsletter', { success_message: v })} />
                </div>
              </Card>
            </div>
          )}

          {tab === 'brand' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Identité">
                <Field label="Nom de la marque" value={brand.name} onChange={(v) => update('brand', { name: v })} />
                <Field label="Accroche (titre des pages)" value={brand.tagline} onChange={(v) => update('brand', { tagline: v })} />
                <Field label="Phrase du pied de page" textarea rows={2} value={brand.footer_text} onChange={(v) => update('brand', { footer_text: v })} />
                <Field label="Bandeau d’annonce (haut de page)" value={brand.announcement} onChange={(v) => update('brand', { announcement: v })} hint="Laisser vide pour masquer le bandeau" />
              </Card>
              <Card title="Contact">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Téléphone" value={brand.phone} onChange={(v) => update('brand', { phone: v })} />
                  <Field label="WhatsApp (avec indicatif)" value={brand.whatsapp} onChange={(v) => update('brand', { whatsapp: v })} placeholder="2250700000000" />
                  <Field label="E-mail" type="email" value={brand.email} onChange={(v) => update('brand', { email: v })} />
                  <Field label="Horaires" value={brand.hours} onChange={(v) => update('brand', { hours: v })} />
                </div>
                <Field label="Adresse" value={brand.address} onChange={(v) => update('brand', { address: v })} />
              </Card>
              <Card title="Réseaux sociaux">
                <div className="grid gap-4 sm:grid-cols-2">
                  {(['instagram', 'facebook', 'tiktok', 'youtube'] as const).map((k) => (
                    <Field key={k} label={k} value={brand.socials[k]} placeholder="https://…" onChange={(v) => update('brand', { socials: { ...brand.socials, [k]: v } })} />
                  ))}
                </div>
                <p className="text-xs text-slate-500">Seuls les réseaux renseignés s’affichent dans le pied de page.</p>
              </Card>
            </div>
          )}

          {tab === 'shop' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Prix et livraison">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Devise" value={shop.currency} onChange={(v) => update('shop', { currency: v })} />
                  <Field label="Frais de livraison" type="number" value={shop.shipping_fee} onChange={(v) => update('shop', { shipping_fee: Number(v) })} />
                  <Field label="Livraison offerte dès" type="number" value={shop.free_shipping_threshold} onChange={(v) => update('shop', { free_shipping_threshold: Number(v) })} hint="0 = jamais" />
                </div>
                <Field label="Informations de livraison" textarea rows={2} value={shop.delivery_info} onChange={(v) => update('shop', { delivery_info: v })} />
              </Card>
              <Card title="Paiement">
                <Switch label="Paiement à la livraison" checked={shop.cash_on_delivery} onChange={(v) => update('shop', { cash_on_delivery: v })} />
                <Switch label="Mobile Money" checked={shop.mobile_money} onChange={(v) => update('shop', { mobile_money: v })} />
                <Field label="Instructions Mobile Money" textarea rows={3} value={shop.mobile_money_instructions} onChange={(v) => update('shop', { mobile_money_instructions: v })} />
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function PersonnalisationPage() {
  return (
    <AdminGate>
      <Personnalisation />
    </AdminGate>
  );
}
