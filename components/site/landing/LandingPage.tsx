'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Check, ChevronRight, FileText, Flower2, Leaf, Plus, Quote, ShieldCheck, Sprout } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import { landingOffers, offerSoldOut, visible } from '@/lib/landing';
import type { Product, ProductLanding, ShopSettings } from '@/lib/types';
import { useSite } from '../Providers';
import Stars from '../Stars';
import DirectOrder, { SectionTitle } from './DirectOrder';

const aboutIcons = [Sprout, Leaf, Flower2, ShieldCheck];
const column = 'mx-auto w-full max-w-3xl px-3 sm:px-5';

/** Pictogramme cerclé champagne + libellé, centré */
function IconBadge({ Icon, label }: { Icon: typeof Leaf; label: string }) {
  return (
    <li className="flex flex-col items-center gap-2 text-center text-[14px] leading-snug text-anthracite">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-champagne bg-white/80 text-[#a58c62] sm:h-16 sm:w-16">
        <Icon className="h-6 w-6" strokeWidth={1.3} aria-hidden="true" />
      </span>
      {label}
    </li>
  );
}

/** Page /best-seller : présentation du produit spécial (maquette validée), formulaire de commande en bas */
export default function LandingPage({
  product,
  landing,
  categoryName,
  shop,
}: {
  product: Product;
  landing: ProductLanding;
  categoryName?: string;
  shop: ShopSettings;
}) {
  const { currency } = useSite();
  const [allIngredients, setAllIngredients] = useState(false);
  const show = landing.blocks;
  const offers = landingOffers(product);
  const fromPrice = Math.min(...offers.map((o) => o.price));
  const allSoldOut = offers.every((o) => offerSoldOut(product, o));
  const heroImage = landing.hero_image || '/images/refonte/bestseller-feuillage.png';
  const subtitle = show.hero_text ? landing.hero_text || product.tagline || product.benefit : null;
  const about = show.about ? landing.about_text || product.description : null;
  const sections = show.sections ? visible(landing.sections) : [];
  const reviews = show.reviews ? visible(landing.reviews) : [];
  const faq = show.faq ? visible(landing.faq) : [];

  return (
    <>
      {/* Bannière — mobile : image nette en haut, texte dessous ; grand écran : image sur toute la bannière, texte ivoire à gauche */}
      <section aria-labelledby="special-title" className="relative lg:flex lg:min-h-[600px] lg:items-center">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
          <SmartImage src={heroImage} alt="" fill preload sizes="100vw" className="object-cover lg:object-[70%_center]" />
          {/* Lisibilité du texte (grand écran) : dégradé vert forêt côté texte uniquement */}
          <div aria-hidden="true" className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(23,55,44,0.92)_0%,rgba(23,55,44,0.7)_38%,transparent_62%)] lg:block" />
        </div>
        <div className="container-site relative pt-6 pb-6 lg:py-16">
          <div className="max-w-xl">
            {(landing.hero_badge || categoryName) && (
              <p className="inline-flex rounded-full border border-champagne/70 bg-champagne/20 px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.14em] text-forest uppercase lg:text-ivory">
                {landing.hero_badge || categoryName}
              </p>
            )}
            <h1 id="special-title" className="title-xl mt-4 max-w-[14ch] text-[clamp(2.6rem,9vw,4.2rem)] text-forest lg:text-ivory">
              {landing.hero_title || product.name}
            </h1>
            {subtitle && <p className="mt-3 max-w-[34ch] text-[17px] leading-snug text-anthracite sm:text-[18px] lg:text-ivory/90">{subtitle}</p>}
            {product.reviews_count > 0 && <Stars rating={product.rating} count={product.reviews_count} className="mt-3" />}
          </div>
        </div>
      </section>

      <div className={`${column} space-y-10 pt-4 pb-14 sm:space-y-12`}>
        {/* À propos */}
        {(about || (show.highlights && product.highlights.length > 0)) && (
          <section aria-labelledby="special-about" className="space-y-4">
            <SectionTitle id="special-about">À propos du produit</SectionTitle>
            {about && <p className="font-serif text-[1.25rem] leading-relaxed text-anthracite">{about}</p>}
            {product.highlights.length > 0 && (
              <ul className="grid grid-cols-4 gap-3 pt-2">
                {product.highlights.slice(0, 4).map((h, i) => (
                  <IconBadge key={h} Icon={aboutIcons[i % aboutIcons.length]} label={h} />
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Ingrédients principaux */}
        {(landing.ingredient_cards.length > 0 || product.ingredients) && (
          <section aria-labelledby="special-ingredients" className="space-y-4">
            <SectionTitle id="special-ingredients">Ingrédients principaux</SectionTitle>
            {landing.ingredient_cards.length > 0 && (
              <ul className="grid grid-cols-4 gap-3">
                {landing.ingredient_cards.map((c) => (
                  <li key={c.name} className="text-center">
                    <span className="relative block aspect-square overflow-hidden rounded-lg border border-line bg-white">
                      {c.image_url && <SmartImage src={c.image_url} alt={c.name} fill sizes="(min-width: 768px) 180px, 25vw" className="object-cover" />}
                    </span>
                    <span className="mt-2 block text-[14px] leading-snug">{c.name}</span>
                  </li>
                ))}
              </ul>
            )}
            {product.ingredients && (
              <div className="rounded-lg border border-line bg-white">
                <button
                  type="button"
                  onClick={() => setAllIngredients((v) => !v)}
                  aria-expanded={allIngredients}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left text-[16px]"
                >
                  <FileText className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.4} aria-hidden="true" />
                  <span className="flex-1">Voir la liste complète des ingrédients</span>
                  <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${allIngredients ? 'rotate-90' : ''}`} aria-hidden="true" />
                </button>
                {allIngredients && <p className="border-t border-line px-4 py-4 text-[15px] leading-relaxed whitespace-pre-line text-muted">{product.ingredients}</p>}
              </div>
            )}
          </section>
        )}

        {/* Conseils d'utilisation */}
        {product.usage && (
          <section aria-labelledby="special-usage" className="space-y-4">
            <SectionTitle id="special-usage">Conseils d’utilisation</SectionTitle>
            <div className="flex gap-4">
              <CalendarCheck className="mt-0.5 h-8 w-8 shrink-0 text-[#a58c62]" strokeWidth={1.3} aria-hidden="true" />
              <p className="text-[16px] leading-relaxed whitespace-pre-line text-muted">{product.usage}</p>
            </div>
          </section>
        )}

        {/* Précautions */}
        {landing.precautions && (
          <section aria-labelledby="special-precautions" className="flex gap-4">
            <ShieldCheck className="mt-1 h-10 w-10 shrink-0 text-[#a58c62]" strokeWidth={1.2} aria-hidden="true" />
            <div>
              <h2 id="special-precautions" className="font-serif text-[1.7rem] leading-tight">
                Précautions
              </h2>
              <p className="mt-2 text-[16px] leading-relaxed whitespace-pre-line text-muted">{landing.precautions}</p>
            </div>
          </section>
        )}

        {/* Pourquoi choisir */}
        {landing.reasons.length > 0 && (
          <section aria-labelledby="special-reasons" className="grid overflow-hidden rounded-xl border border-line bg-white sm:grid-cols-[180px_1fr]">
            <div className="relative hidden sm:block">
              <SmartImage src={landing.reasons_image || '/images/refonte/raisons-feuilles.png'} alt="" fill sizes="180px" className="object-cover" />
              <span className="absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-forest text-white">
                <Leaf className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <h2 id="special-reasons" className="font-serif text-[1.5rem] leading-tight">
                Pourquoi choisir {product.name} ?
              </h2>
              <ul className="mt-4 space-y-2.5">
                {landing.reasons.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-[15px]">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-forest" strokeWidth={2} aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Sections complémentaires (Pilotage › Produit spécial) */}
        {sections.map((s, i) => (
          <section key={i} className="space-y-4">
            {s.title && <SectionTitle>{s.title}</SectionTitle>}
            {s.image_url && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <SmartImage src={s.image_url} alt={s.title} fill sizes="(min-width: 768px) 720px, 100vw" className="object-cover" />
              </div>
            )}
            {s.text && <p className="text-[16px] leading-relaxed whitespace-pre-line text-muted">{s.text}</p>}
          </section>
        ))}

        {reviews.length > 0 && (
          <section aria-labelledby="special-reviews" className="space-y-4">
            <SectionTitle id="special-reviews">Ils l’ont adopté</SectionTitle>
            <ul className="space-y-3">
              {reviews.map((r, i) => (
                <li key={r.name + i} className="rounded-xl border border-line bg-white p-5">
                  <div className="flex items-center justify-between">
                    <Quote className="h-6 w-6 text-champagne" strokeWidth={1.4} aria-hidden="true" />
                    <Stars rating={5} />
                  </div>
                  <p className="mt-3 font-serif text-[1.25rem] leading-snug">{r.text}</p>
                  <p className="mt-3 text-[14px] text-muted">
                    <span className="font-medium text-anthracite">{r.name}</span>
                    {r.location && ` · ${r.location}`}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {faq.length > 0 && (
          <section aria-labelledby="special-faq" className="space-y-4">
            <SectionTitle id="special-faq">Questions fréquentes</SectionTitle>
            <div className="space-y-3">
              {faq.map((f, i) => (
                <details key={f.question + i} className="group rounded-lg border border-line bg-white px-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium">
                    {f.question}
                    <Plus className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-45" aria-hidden="true" />
                  </summary>
                  <p className="pb-5 text-[15px] leading-relaxed whitespace-pre-line text-muted">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <DirectOrder product={product} landing={landing} shop={shop} />
      </div>

      <StickyOrderBar label={allSoldOut ? 'Voir les offres' : 'Commander'} price={formatPrice(fromPrice, currency)} />
    </>
  );
}

/** Mobile : bouton « Commander » au-dessus de la barre d'onglets, masqué une fois le formulaire visible */
function StickyOrderBar({ label, price }: { label: string; price: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById('commander');
    const onScroll = () => {
      const top = target?.getBoundingClientRect().top ?? Infinity;
      setVisible(window.scrollY > 500 && top > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-4 pb-3 transition-all duration-300 lg:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <a href="#commander" tabIndex={visible ? 0 : -1} className="btn btn-forest w-full justify-between! shadow-[var(--shadow-soft)]">
        <span>{label}</span>
        <span>{price}</span>
      </a>
    </div>
  );
}
