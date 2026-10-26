'use client';

import { useEffect, useState } from 'react';
import { Award, Banknote, Check, Headset, Plus, Quote, ShieldCheck, Truck } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import { landingOffers, offerSoldOut, visible } from '@/lib/landing';
import type { Product, ProductLanding, ShopSettings } from '@/lib/types';
import { LogoMark } from '../Icons';
import { useSite } from '../Providers';
import Reveal from '../Reveal';
import Stars from '../Stars';
import { Script, SectionHeading } from '../Typography';
import DirectOrder from './DirectOrder';

const trustIcons = [Truck, Banknote, ShieldCheck, Headset];
/** Une seule colonne centrée : les blocs se suivent verticalement */
const column = 'mx-auto w-full max-w-3xl px-4 sm:px-6';

/** Page /best-seller : grande présentation du produit spécial, puis commande directe en bas de page */
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
  const offers = landingOffers(product);
  const fromPrice = Math.min(...offers.map((o) => o.price));
  const allSoldOut = offers.every((o) => offerSoldOut(product, o));
  const heroImage = landing.hero_image || product.image_url;
  const details = [
    { question: 'Composition', answer: product.ingredients },
    { question: 'Conseils d’utilisation', answer: product.usage },
  ].filter((d): d is { question: string; answer: string } => !!d.answer?.trim());
  // Blocs et éléments cochés dans Pilotage › Produit spécial
  const show = landing.blocks;
  const highlights = show.highlights ? product.highlights : [];
  const trust = show.trust ? landing.trust : [];
  const story = show.story ? product.story : null;
  const sections = show.sections ? visible(landing.sections) : [];
  const benefits = show.benefits ? product.benefits : [];
  const reviews = show.reviews ? visible(landing.reviews) : [];
  const faq = show.faq ? [...details, ...visible(landing.faq)] : [];

  return (
    <>
      {/* Bannière : tout s'enchaîne verticalement, centré */}
      <section className="relative overflow-hidden bg-forest text-white">
        <LogoMark aria-hidden="true" className="pointer-events-none absolute -top-16 -left-16 h-72 w-72 text-white/[0.04]" />
        <LogoMark aria-hidden="true" className="pointer-events-none absolute -right-20 -bottom-24 h-96 w-96 rotate-12 text-white/[0.05]" />
        <div className={`${column} relative flex flex-col items-center pt-10 pb-24 text-center lg:pt-14 lg:pb-28`}>
          <p className="inline-flex items-center gap-2 rounded-full bg-lime px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] text-forest uppercase">
            <Award className="h-3.5 w-3.5" aria-hidden="true" />
            Best-seller{categoryName ? ` · ${categoryName}` : ''}
          </p>
          <h1 className="mt-5 font-serif text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.04] font-bold text-white!">{landing.hero_title || product.name}</h1>
          {product.benefit && (
            <p className="mt-2 text-[clamp(2rem,4.6vw,3rem)]">
              <Script className="text-lime!">{product.benefit}</Script>
            </p>
          )}
          <Stars rating={product.rating} count={product.reviews_count} className="mt-5 justify-center" onDark />
          {show.hero_text && (landing.hero_text || product.tagline) && (
            <p className="mt-5 text-lg leading-relaxed text-white/85 md:text-xl">{landing.hero_text || product.tagline}</p>
          )}

          <div className="relative mt-10 w-full">
            <span aria-hidden="true" className="absolute top-1/2 left-1/2 aspect-square w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(182,225,90,0.2)_0%,transparent_65%)]" />
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)]">
              <SmartImage src={heroImage} alt={product.name} fill priority sizes="(min-width: 1024px) 860px, 92vw" className="object-cover" />
              {allSoldOut && (
                <span className="absolute top-4 left-4 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white uppercase">En rupture</span>
              )}
            </div>
          </div>

          {highlights.length > 0 && (
            <ul className="mt-10 grid w-full gap-3 text-left sm:grid-cols-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3.5 text-[15px] text-white/90">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime text-forest">
                    <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Arguments de confiance, à cheval sur la bannière */}
      {trust.length > 0 && (
        <div className={`${column} relative -mt-12`}>
          <ul className="card grid grid-cols-2 gap-px overflow-hidden bg-line p-0">
            {trust.map((t, i) => {
              const Icon = trustIcons[i % trustIcons.length];
              return (
                <li key={t} className="flex flex-col items-center gap-2.5 bg-cream p-4 text-center sm:p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-lime">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="text-[13px] leading-snug font-semibold text-ink sm:text-sm">{t}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Histoire */}
      {story && (
        <Reveal className={`${column} mt-20 text-center lg:mt-24`}>
          <SectionHeading eyebrow="Pourquoi on" accent="l’aime" title={product.name} script="en détail" align="center" />
          <p className="mt-6 text-base leading-relaxed whitespace-pre-line text-ink-muted md:text-lg">{story}</p>
        </Reveal>
      )}

      {/* Sections : une bannière par section (titre, image en grand, puis le texte), fond alterné */}
      {sections.map((s, i) => (
        <section key={i} className={`mt-20 py-16 lg:mt-24 lg:py-20 ${i % 2 === 0 ? 'bg-cream/70' : ''}`}>
          <div className={`${column} text-center`}>
            <Reveal>
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-forest font-display text-sm font-extrabold text-lime">
                {String(i + 1).padStart(2, '0')}
              </span>
              {s.title && <h2 className="heading-lg mt-5 text-[clamp(1.8rem,4vw,2.6rem)]">{s.title}</h2>}
            </Reveal>
            {s.image_url && (
              <Reveal delay={0.06} className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[2rem] shadow-[var(--shadow-soft)]">
                <SmartImage src={s.image_url} alt={s.title} fill sizes="(min-width: 1024px) 860px, 92vw" className="object-cover" />
              </Reveal>
            )}
            {s.text && (
              <Reveal delay={0.1}>
                <p className="mt-8 text-left text-base leading-relaxed whitespace-pre-line text-ink-muted md:text-lg">{s.text}</p>
              </Reveal>
            )}
          </div>
        </section>
      ))}

      <div className={`${column} pb-16`}>
        {/* Bienfaits, l'un sous l'autre */}
        {benefits.length > 0 && (
          <section aria-labelledby="special-benefits" className="mt-20 lg:mt-24">
            <SectionHeading id="special-benefits" eyebrow="Ses" accent="bienfaits" title="Ce qu’il vous apporte" script="au quotidien" align="center" />
            <ol className="mt-10 space-y-4">
              {benefits.map((b, i) => (
                <li key={b.title + i}>
                  <Reveal delay={i * 0.06} className="flex gap-5 rounded-[1.5rem] bg-forest p-6 text-white sm:p-7">
                    <span className="font-display text-2xl font-extrabold text-lime">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <h3 className="font-display text-xl font-bold text-white!">{b.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-white/80">{b.text}</p>
                    </span>
                  </Reveal>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Avis, l'un sous l'autre */}
        {reviews.length > 0 && (
          <section aria-labelledby="special-reviews" className="mt-20 lg:mt-24">
            <SectionHeading id="special-reviews" eyebrow="Ils l’ont" accent="adopté" title="Ce qu’en disent nos clients" align="center" />
            <ul className="mt-10 space-y-4">
              {reviews.map((r, i) => (
                <li key={r.name + i}>
                  <Reveal delay={i * 0.06} className="card p-6">
                    <div className="flex items-center justify-between gap-3">
                      <Quote className="h-6 w-6 text-leaf" aria-hidden="true" />
                      <Stars rating={5} />
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink">{r.text}</p>
                    <p className="mt-4 text-sm font-bold text-ink">
                      {r.name}
                      {r.location && <span className="font-normal text-ink-muted"> · {r.location}</span>}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Questions fréquentes */}
        {faq.length > 0 && (
          <section aria-labelledby="special-faq" className="mt-20 lg:mt-24">
            <SectionHeading id="special-faq" eyebrow="Tout" accent="savoir" title="Vos questions" script="nos réponses" align="center" />
            <div className="mt-10 divide-y divide-line border-y border-line">
              {faq.map((f, i) => (
                <details key={f.question + i} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold">
                    {f.question}
                    <Plus className="h-4 w-4 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-ink-muted">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="mt-20 lg:mt-24">
          <DirectOrder product={product} landing={landing} shop={shop} />
        </div>
      </div>

      <StickyOrderBar label={allSoldOut ? 'Voir les offres' : 'Commander'} price={formatPrice(fromPrice, currency)} />
    </>
  );
}

/** Mobile : bouton « Commander » toujours à portée, masqué une fois le bloc commande visible */
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
      className={`fixed inset-x-0 bottom-0 z-40 p-3 transition-transform duration-300 lg:hidden ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden={!visible}
    >
      <a href="#commander" tabIndex={visible ? 0 : -1} className="btn-primary w-full justify-between! shadow-[var(--shadow-soft)]">
        <span>{label}</span>
        <span className="tracking-normal normal-case">{price}</span>
      </a>
    </div>
  );
}
