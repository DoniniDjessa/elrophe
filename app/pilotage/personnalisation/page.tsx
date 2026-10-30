'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ExternalLink, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { db, isMissingTable, saveSetting, TABLES } from '@/lib/admin';
import { mergeSettings } from '@/lib/settings';
import { defaultSettings } from '@/data/site';
import type { SettingsKey, SiteSettings, ThemeSettings } from '@/lib/types';
import AdminGate, { MigrationNotice } from '../components/AdminGate';
import { Field, ImageField, PageTitle, Switch } from '../components/ui';
import { countries, countryName } from '@/lib/countries';

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
  { key: 'forest', label: 'Vert forêt', hint: 'Bannière, pied de page, boutons principaux' },
  { key: 'ivory', label: 'Ivoire', hint: 'Fond des pages, texte sur fond vert' },
  { key: 'champagne', label: 'Champagne', hint: 'Accents, étoiles, bouton de la bannière' },
  { key: 'anthracite', label: 'Anthracite', hint: 'Titres et texte' },
  { key: 'muted', label: 'Texte secondaire', hint: 'Paragraphes' },
  { key: 'sage', label: 'Sauge', hint: 'Petits détails, icônes' },
];

const presets: { name: string; theme: ThemeSettings }[] = [
  { name: 'Charte EL ROPHE', theme: defaultSettings.theme },
  { name: 'Terre', theme: { ivory: '#F5EFE6', forest: '#3B2A20', champagne: '#C9A774', anthracite: '#2B241F', muted: '#655A50', sage: '#8A7B66' } },
  { name: 'Nuit', theme: { ivory: '#F2F2EE', forest: '#1C2A3A', champagne: '#C8B28A', anthracite: '#23262B', muted: '#5C6068', sage: '#6F7D86' } },
];

const tabs: { id: SettingsKey; label: string }[] = [
  { id: 'theme', label: 'Apparence' },
  { id: 'hero', label: 'Accueil — bannière' },
  { id: 'home', label: 'Accueil — sections' },
  { id: 'brand', label: 'Marque & contact' },
  { id: 'shop', label: 'Boutique' },
  { id: 'legal', label: 'Légal' },
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

function ThemePreview({ theme }: { theme: ThemeSettings }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200" style={{ background: theme.ivory }}>
      <div className="px-4 pt-4 pb-6" style={{ background: theme.forest }}>
        <p className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.3em]" style={{ color: theme.champagne }}>
          <span className="h-px w-5" style={{ background: theme.champagne }} />
          EL ROPHE
        </p>
        <p className="mt-2 text-xl leading-tight" style={{ color: theme.ivory, fontFamily: 'var(--font-cormorant), serif' }}>
          La nature nous inspire.
          <span className="block" style={{ color: theme.champagne }}>La qualité nous distingue.</span>
        </p>
        <span className="mt-3 inline-block rounded-sm px-4 py-2 text-[10px] font-semibold tracking-widest" style={{ background: theme.champagne, color: theme.forest }}>
          DÉCOUVRIR →
        </span>
      </div>
      <div className="px-4 py-4">
        <p className="text-lg" style={{ color: theme.anthracite, fontFamily: 'var(--font-cormorant), serif' }}>Une sélection pensée avec exigence.</p>
        <p className="mt-1 text-xs" style={{ color: theme.muted }}>Des produits choisis selon des critères de qualité clairement définis.</p>
        <p className="mt-2 text-xs" style={{ color: theme.sage }}>★ Détail sauge</p>
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
  const updateHome = <K extends keyof SiteSettings['home']>(key: K, patch: Partial<SiteSettings['home'][K]>) =>
    update('home', { [key]: { ...settings.home[key], ...patch } } as Partial<SiteSettings['home']>);

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

  /** Interrupteur de la barre transparente : enregistré immédiatement (avec le reste de l'onglet Hero) */
  const saveTransparentNav = async (on: boolean) => {
    const next = { ...settings.hero, transparent_nav: on };
    setSettings((s) => ({ ...s, hero: next }));
    const { error } = await saveSetting('hero', next);
    if (error) {
      setSettings((s) => ({ ...s, hero: { ...s.hero, transparent_nav: !on } }));
      return toast.error(error);
    }
    setDirty((d) => {
      const rest = new Set(d);
      rest.delete('hero');
      return rest;
    });
    toast.success(on ? 'Barre transparente activée — le site est à jour' : 'Barre claire rétablie — le site est à jour');
  };

  const reset = () => {
    if (!confirm('Rétablir les valeurs d’origine pour cet onglet ? (Il faudra enregistrer.)')) return;
    setSettings((s) => ({ ...s, [tab]: defaultSettings[tab] }));
    setDirty((d) => new Set(d).add(tab));
  };

  const { theme, hero, home, brand, shop, legal } = settings;
  const checks = [
    { label: 'Texte ivoire sur vert forêt (bannière, pied de page)', ratio: contrast(theme.ivory, theme.forest), min: 4.5 },
    { label: 'Vert forêt sur champagne (bouton de la bannière)', ratio: contrast(theme.forest, theme.champagne), min: 4.5 },
    { label: 'Titres sur fond ivoire', ratio: contrast(theme.anthracite, theme.ivory), min: 4.5 },
    { label: 'Texte secondaire sur fond ivoire', ratio: contrast(theme.muted, theme.ivory), min: 4.5 },
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
                        {[p.theme.ivory, p.theme.forest, p.theme.champagne].map((c) => (
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
              <div className="space-y-6">
                <Card title="Textes de la bannière">
                  <Field label="Surtitre" value={hero.kicker} onChange={(v) => update('hero', { kicker: v })} hint="Petit texte doré au-dessus du titre" />
                  <Field label="Titre — ligne 1" value={hero.heading} onChange={(v) => update('hero', { heading: v })} />
                  <Field label="Titre — ligne 2 (en champagne)" value={hero.heading_accent} onChange={(v) => update('hero', { heading_accent: v })} hint="Vide : une seule ligne" />
                  <Field label="Texte d’introduction" textarea rows={3} value={hero.intro} onChange={(v) => update('hero', { intro: v })} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Bouton" value={hero.button_label} onChange={(v) => update('hero', { button_label: v })} hint="Vide : bouton masqué" />
                    <Field label="Lien du bouton" value={hero.button_href} onChange={(v) => update('hero', { button_href: v })} placeholder="/boutique" />
                  </div>
                </Card>
                <Card title="Barre de navigation">
                  <Switch
                    label="Transparente sur l’image d’accueil"
                    checked={!!hero.transparent_nav}
                    onChange={saveTransparentNav}
                    hint="Enregistré dès le clic. Activée : la barre se pose sur la photo de la bannière et redevient claire au défilement. Désactivée : fond clair en permanence."
                  />
                </Card>
              </div>
              <Card title="Photo de la bannière">
                <ImageField
                  label="Ordinateur (paysage, sujet sur la moitié droite)"
                  value={hero.photo_desktop}
                  onChange={(v) => update('hero', { photo_desktop: v })}
                  folder="hero"
                  aspect="aspect-[16/9]"
                  max={2400}
                />
                <ImageField
                  label="Mobile (portrait, affichée sous le texte)"
                  value={hero.photo_mobile}
                  onChange={(v) => update('hero', { photo_mobile: v })}
                  folder="hero"
                  aspect="aspect-[3/4]"
                  max={1400}
                />
                <p className="text-xs text-slate-500">Une seule photo renseignée : elle sert sur ordinateur comme sur mobile. Le côté gauche est assombri pour la lisibilité du texte.</p>
                <Field label="Description de la photo (accessibilité)" value={hero.photo_alt} onChange={(v) => update('hero', { photo_alt: v })} />
              </Card>
            </div>
          )}

          {tab === 'home' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Notre sélection (produits de l’accueil)">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Surtitre" value={home.selection.kicker} onChange={(v) => updateHome('selection', { kicker: v })} />
                  <Field label="Titre" value={home.selection.title} onChange={(v) => updateHome('selection', { title: v })} />
                </div>
                <p className="text-xs text-slate-500">
                  Les produits affichés se choisissent dans <a href="/pilotage/boutique?tab=meilleures-ventes" className="font-extrabold underline">Boutique › Meilleures ventes</a>.
                </p>
              </Card>
              <Card title="Témoignages clients">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Surtitre" value={home.reviews.kicker} onChange={(v) => updateHome('reviews', { kicker: v })} />
                  <Field label="Titre" value={home.reviews.title} onChange={(v) => updateHome('reviews', { title: v })} />
                </div>
                <p className="text-xs text-slate-500">
                  Les avis se gèrent dans <a href="/pilotage/testimonials" className="font-extrabold underline">Avis clients</a>.
                </p>
              </Card>
              <Card title="Carte « Notre best-seller » (sous la sélection)" aside={<Switch label="Visible" checked={home.spotlight.visible} onChange={(v) => updateHome('spotlight', { visible: v })} />}>
                <p className="rounded-md bg-[var(--pz-50)] p-3 text-xs text-[var(--pz-700)]">
                  Le produit mis en avant se choisit dans{' '}
                  <a href="/pilotage/boutique?tab=produit-special" className="font-extrabold underline">Boutique › Produit spécial</a>. Un champ laissé vide reprend la valeur
                  du produit.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Étiquette" value={home.spotlight.badge} onChange={(v) => updateHome('spotlight', { badge: v })} hint="Vide : masquée" />
                  <Field label="Bouton" value={home.spotlight.button_label} onChange={(v) => updateHome('spotlight', { button_label: v })} hint="Vide : bouton masqué" />
                </div>
                <Field label="Titre" value={home.spotlight.title} onChange={(v) => updateHome('spotlight', { title: v })} placeholder="Vide : nom du produit" />
                <Field label="Texte" textarea rows={3} value={home.spotlight.text} onChange={(v) => updateHome('spotlight', { text: v })} placeholder="Vide : accroche du produit" />
                <Field
                  label="Points forts (3 au maximum)"
                  textarea
                  rows={3}
                  value={home.spotlight.points.join('\n')}
                  onChange={(v) => updateHome('spotlight', { points: v.split('\n') })}
                  placeholder="Vide : points forts du produit"
                  hint="Un point par ligne."
                />
                <ImageField label="Photo (vide : photo du produit)" value={home.spotlight.image_url} onChange={(v) => updateHome('spotlight', { image_url: v })} folder="sections" aspect="aspect-[4/3]" />
                <Switch label="Afficher le prix" checked={home.spotlight.show_price} onChange={(v) => updateHome('spotlight', { show_price: v })} />
              </Card>
              <Card title="Notre maison (accueil et page Notre maison)">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Surtitre" value={home.maison.kicker} onChange={(v) => updateHome('maison', { kicker: v })} />
                  <Field label="Bouton (accueil)" value={home.maison.button_label} onChange={(v) => updateHome('maison', { button_label: v })} hint="Vide : bouton masqué" />
                </div>
                <Field label="Titre" textarea rows={2} value={home.maison.title} onChange={(v) => updateHome('maison', { title: v })} hint="Un retour à la ligne = une nouvelle ligne du titre" />
                <Field
                  label="Texte"
                  textarea
                  rows={6}
                  value={home.maison.paragraphs.join('\n\n')}
                  onChange={(v) => updateHome('maison', { paragraphs: v.split(/\n\s*\n/) })}
                  hint="Laissez une ligne vide entre deux paragraphes."
                />
                <ImageField label="Photo" value={home.maison.image_url} onChange={(v) => updateHome('maison', { image_url: v })} folder="sections" aspect="aspect-[4/3]" />
                <Field label="Description de la photo (accessibilité)" value={home.maison.image_alt} onChange={(v) => updateHome('maison', { image_alt: v })} />
              </Card>
              <Card title="Nos engagements (accueil, Notre maison, Nos engagements)">
                <Field label="Surtitre" value={home.engagements.kicker} onChange={(v) => updateHome('engagements', { kicker: v })} />
                {home.engagements.items.map((e, i) => (
                  <div key={i} className="space-y-2 rounded-md border border-gray-200 p-3">
                    <Field
                      label={`Engagement ${i + 1} — titre`}
                      value={e.title}
                      onChange={(v) => updateHome('engagements', { items: home.engagements.items.map((x, j) => (j === i ? { ...x, title: v } : x)) })}
                    />
                    <Field
                      label="Texte"
                      textarea
                      rows={2}
                      value={e.text}
                      onChange={(v) => updateHome('engagements', { items: home.engagements.items.map((x, j) => (j === i ? { ...x, text: v } : x)) })}
                    />
                  </div>
                ))}
                <p className="text-xs text-slate-500">Titre et texte vides : l’engagement est masqué. Icônes dans l’ordre : feuille, fiole, bouclier.</p>
              </Card>
            </div>
          )}

          {tab === 'legal' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Société (mentions légales et CGV)">
                <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-900">
                  Ces informations figurent sur les pages Mentions légales et Conditions générales de vente. Tant qu’un champ est vide, la page affiche « [à compléter] ».
                  Faites valider ces pages par un juriste avant la mise en ligne.
                </p>
                <Field label="Raison sociale" value={legal.company} onChange={(v) => update('legal', { company: v })} placeholder="Ex. EL ROPHE SARL" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Forme juridique" value={legal.legal_form} onChange={(v) => update('legal', { legal_form: v })} placeholder="Ex. SARL, SAS, entreprise individuelle" />
                  <Field label="Capital social" value={legal.capital} onChange={(v) => update('legal', { capital: v })} placeholder="Ex. 1 000 000 FCFA" />
                  <Field label="N° RCCM" value={legal.rccm} onChange={(v) => update('legal', { rccm: v })} placeholder="Ex. CI-ABJ-2024-B-12345" />
                  <Field label="N° de compte contribuable (NCC)" value={legal.ncc} onChange={(v) => update('legal', { ncc: v })} />
                </div>
                <Field label="Siège social" textarea rows={2} value={legal.address} onChange={(v) => update('legal', { address: v })} />
                <Field label="Directeur de la publication" value={legal.director} onChange={(v) => update('legal', { director: v })} placeholder="Nom et fonction" />
              </Card>
              <Card title="Hébergement et mise à jour">
                <Field label="Hébergeur du site" value={legal.host_name} onChange={(v) => update('legal', { host_name: v })} placeholder="Ex. Vercel Inc." />
                <Field label="Adresse de l’hébergeur" textarea rows={2} value={legal.host_address} onChange={(v) => update('legal', { host_address: v })} />
                <Field label="Date de dernière mise à jour" type="date" value={legal.updated_at} onChange={(v) => update('legal', { updated_at: v })} hint="Affichée en tête des Mentions légales et des CGV." />
                <p className="text-xs text-slate-500">
                  Coordonnées (e-mail, téléphone, adresse) : onglet Marque &amp; contact. Délais de livraison et politique de retour : onglet Boutique.
                </p>
              </Card>
            </div>
          )}

          {tab === 'brand' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Identité">
                <Field label="Nom de la marque" value={brand.name} onChange={(v) => update('brand', { name: v })} />
                <Field
                  label="Phrase du pied de page"
                  textarea
                  rows={2}
                  value={brand.footer_quote}
                  onChange={(v) => update('brand', { footer_quote: v })}
                  hint="Sous l’emblème, en italique. Un retour à la ligne = une nouvelle ligne. Vide : masquée."
                />
              </Card>
              <Card title="Référencement (Google)">
                <Field
                  label={`Titre de l’accueil (${brand.seo_title.length}/60)`}
                  value={brand.seo_title}
                  onChange={(v) => update('brand', { seo_title: v })}
                  hint="Titre affiché dans les résultats Google et l’onglet du navigateur. Les autres pages : « Page | EL ROPHE »."
                />
                <Field
                  label={`Méta-description (${brand.seo_description.length}/160)`}
                  textarea
                  rows={3}
                  value={brand.seo_description}
                  onChange={(v) => update('brand', { seo_description: v })}
                  hint="Texte sous le titre dans Google (160 caractères environ). N’y mettez que des mentions justifiées pour tous les produits."
                />
              </Card>
              <Card title="Bande défilante (au-dessus de la barre de navigation)">
                <Field
                  label="Messages"
                  textarea
                  rows={5}
                  value={brand.marquee.join('\n')}
                  onChange={(v) => update('brand', { marquee: v.split('\n') })}
                  hint="Un message par ligne. Laisser vide pour masquer la bande. Pensez à enregistrer."
                />
              </Card>
              <Card title="Pays de présence (drapeaux de l’en-tête)">
                <p className="text-xs text-slate-500">Affichés à droite de la barre de navigation, dans cet ordre (4 au maximum). Pensez à enregistrer.</p>
                <ul className="flex flex-wrap gap-2">
                  {brand.countries.map((code, i) => (
                    <li key={code} className="flex items-center gap-2 rounded-full border border-gray-300 py-1 pr-1 pl-2 text-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/${code}.svg`} alt="" className="h-5 w-5 rounded-full object-cover" />
                      {countryName(code)}
                      <button
                        type="button"
                        className="pz-btn pz-btn-ghost px-1.5! py-0.5!"
                        aria-label={`Avancer ${countryName(code)}`}
                        disabled={i === 0}
                        onClick={() => {
                          const next = [...brand.countries];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          update('brand', { countries: next });
                        }}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="pz-btn pz-btn-ghost px-1.5! py-0.5!"
                        aria-label={`Retirer ${countryName(code)}`}
                        onClick={() => update('brand', { countries: brand.countries.filter((c) => c !== code) })}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                  {brand.countries.length === 0 && <li className="text-sm text-slate-400">Aucun drapeau affiché.</li>}
                </ul>
                {brand.countries.length < 4 && (
                  <select
                    value=""
                    onChange={(e) => e.target.value && update('brand', { countries: [...brand.countries, e.target.value] })}
                    aria-label="Ajouter un pays"
                    className="w-full border border-gray-300 bg-transparent px-3 py-2 text-black"
                  >
                    <option value="">+ Ajouter un pays…</option>
                    {countries
                      .filter((c) => !brand.countries.includes(c.code))
                      .map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                )}
              </Card>
              <Card title="Logo">
                <ImageField label="Emblème (barre de navigation, menu et pied de page)" value={brand.icon_url} onChange={(v) => update('brand', { icon_url: v })} folder="brand" max={512} />
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
                <Field label="Politique de retour" textarea rows={3} value={shop.returns_info} onChange={(v) => update('shop', { returns_info: v })} hint="Affichée sur chaque fiche produit, rubrique « Livraison et retours »." />
              </Card>
              <Card title="Paiement">
                <Switch label="Paiement à la livraison" checked={shop.cash_on_delivery} onChange={(v) => update('shop', { cash_on_delivery: v })} />
                <Switch label="Mobile Money" checked={shop.mobile_money} onChange={(v) => update('shop', { mobile_money: v })} />
                <Field label="Instructions Mobile Money" textarea rows={3} value={shop.mobile_money_instructions} onChange={(v) => update('shop', { mobile_money_instructions: v })} hint="Affichées sur la page de confirmation quand le client a choisi Mobile Money." />
              </Card>
              <Card title="Confirmation de commande">
                <p className="text-xs text-slate-500">Page affichée au client juste après sa commande, avec son numéro de commande.</p>
                <Field label="Titre" value={shop.order_success_title} onChange={(v) => update('shop', { order_success_title: v })} />
                <Field label="Message" textarea rows={4} value={shop.order_success_message} onChange={(v) => update('shop', { order_success_message: v })} hint="Les retours à la ligne sont conservés." />
                <a href="/commande/confirmation?n=EXEMPLE" target="_blank" rel="noopener noreferrer" className="pz-btn pz-btn-outline self-start">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Voir la page
                </a>
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
