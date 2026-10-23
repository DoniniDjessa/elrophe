'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowRight, Award, Play, X } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import type { HeroSettings } from '@/lib/types';
import { badgeIcons } from './Icons';
import { Eyebrow, Script } from './Typography';

/** Entrée en CSS : le contenu (et l'image LCP) s'affiche sans attendre l'hydratation */
const rise = (delay: number) => ({ animationDelay: `${delay}s` });

function toEmbed(url: string): string | null {
  const yt = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return null;
}

/** Texte qui s'écrit lettre par lettre (CSS pur, chaque lettre a son délai), curseur clignotant au bout */
function Typewriter({ text }: { text: string }) {
  const letters = Array.from(text);
  return (
    <p className="typewriter font-serif text-[clamp(1.9rem,3.6vw,2.9rem)] leading-none tracking-[0.14em] text-forest uppercase">
      <span className="sr-only">{text}</span>
      {letters.map((char, i) => (
        <span key={i} aria-hidden="true" className="typewriter-letter" style={{ animationDelay: `${0.25 + i * 0.13}s` }}>
          {char === ' ' ? ' ' : char}
        </span>
      ))}
      <span aria-hidden="true" className="typewriter-caret" />
    </p>
  );
}

export default function Hero({ hero, recommendedHref }: { hero: HeroSettings; recommendedHref?: string }) {
  const router = useRouter();
  const [videoOpen, setVideoOpen] = useState(false);
  const embed = hero.video_url ? toEmbed(hero.video_url) : null;
  const recommendedLink = hero.recommended_href || recommendedHref || '/boutique';

  return (
    <section aria-labelledby="hero-title" className="relative">
      {/* Ombres de feuilles en haut à droite */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-36 right-0 h-[620px] w-[620px] overflow-hidden opacity-[0.12] blur-[6px] sm:-top-40 lg:h-[820px] lg:w-[820px]">
        <SmartImage src="/images/leaf-shadow.svg" alt="" fill sizes="820px" className="leaf-shadow object-contain object-right-top" />
      </div>

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-4 pt-6 pb-14 sm:px-6 md:pt-10 lg:grid-cols-[1.15fr_1fr] lg:gap-6 lg:px-10 lg:pb-20">
        <div className="relative z-10 order-2 lg:order-1">
          {hero.typed_text && (
            <div className="mb-4">
              <Typewriter text={hero.typed_text} />
            </div>
          )}
          <div style={rise(0)} className="rise">
            <Eyebrow text={hero.eyebrow} accent={hero.eyebrow_accent} />
          </div>

          <h1 id="hero-title" style={rise(0.08)} className="rise heading-xl mt-6 text-[clamp(2.1rem,3.4vw,3.2rem)] lg:whitespace-nowrap">
            <span className="block">{hero.title_line1}</span>
            <span className="block">{hero.title_line2}</span>
          </h1>
          {hero.script && (
            <p style={rise(0.18)} className="rise mt-1 text-[clamp(3rem,6vw,5rem)]">
              <Script>{hero.script}</Script>
            </p>
          )}

          <p style={rise(0.26)} className="rise mt-6 max-w-md text-[15px] leading-relaxed text-ink-muted md:text-base">
            {hero.subtitle}
          </p>

          <div style={rise(0.34)} className="rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href={hero.cta_href || '/boutique'} className="btn-primary group">
              {hero.cta_label}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            {(hero.video_label || hero.video_sublabel) && (
              <button
                type="button"
                onClick={() => (hero.video_url ? setVideoOpen(true) : router.push('/a-propos'))}
                className="group flex items-center gap-3 rounded-full text-left"
              >
                <span className="glass flex h-12 w-12 items-center justify-center rounded-full shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:scale-105">
                  <Play className="ml-0.5 h-4 w-4 fill-forest text-forest" aria-hidden="true" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-ink">{hero.video_label}</span>
                  <span className="block text-[13px] text-ink-muted">{hero.video_sublabel}</span>
                </span>
              </button>
            )}
          </div>

          {hero.badges.length > 0 && (
            <ul style={rise(0.44)} className="rise mt-12 grid max-w-2xl grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4" aria-label="Nos engagements">
              {hero.badges.map((badge) => {
                const Icon = badgeIcons[badge.icon] ?? badgeIcons.leaf;
                return (
                  <li key={badge.line1 + badge.line2} className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-forest/25 text-forest">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="text-[12.5px] leading-tight font-medium text-ink">
                      {badge.line1}
                      <br />
                      {badge.line2}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rise relative order-1 mx-auto w-full max-w-[560px] lg:order-2 lg:max-w-none" style={rise(0.2)}>
          {/* Halo : grand cercle fin crème */}
          <div aria-hidden="true" className="absolute top-1/2 left-1/2 aspect-square w-[108%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/70" />
          <div aria-hidden="true" className="absolute top-1/2 left-1/2 aspect-square w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--surface-cream)_0%,transparent_68%)] opacity-70" />
          <div className="relative aspect-[9/10]">
            {/* Ombre au sol qui respire avec le flottement */}
            <span aria-hidden="true" className="hero-float-shadow absolute bottom-[3%] left-1/2 h-[7%] w-[46%] -translate-x-1/2 rounded-[50%] bg-forest/25 blur-xl" />
            {/* Produit légèrement incliné, qui flotte lentement */}
            <div className="hero-float absolute inset-x-[14%] top-[2%] bottom-[9%]">
              <SmartImage
                src={hero.image_url}
                alt={hero.image_alt}
                fill
                priority
                sizes="(min-width: 1024px) 34vw, 70vw"
                className="object-contain drop-shadow-[0_30px_40px_rgba(30,53,36,0.22)]"
              />
            </div>

            {/* Étiquette « Le plus recommandé » qui flotte sur le visuel */}
            {hero.recommended_label && (
              <div style={rise(0.7)} className="rise absolute top-[6%] left-0 z-10 sm:left-[2%]">
                <div className="tag-bob glass flex items-center gap-2.5 rounded-full py-1.5 pr-1.5 pl-3 shadow-[var(--shadow-soft)]">
                  <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-80" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-leaf" />
                  </span>
                  <Award className="h-4 w-4 text-gold" strokeWidth={1.8} aria-hidden="true" />
                  <span className="text-[13px] font-semibold whitespace-nowrap text-ink">{hero.recommended_label}</span>
                  <Link
                    href={recommendedLink}
                    className="group inline-flex items-center gap-1 rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-leaf"
                  >
                    {hero.recommended_cta || 'Voir'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </div>
          {/* Feuilles floues au premier plan */}
          <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -right-2 -bottom-6 w-28 opacity-80 blur-[3px] sm:w-36">
            <path d="M40 190 C 60 120 120 80 190 70 C 170 140 110 185 40 190Z" fill="var(--leaf)" />
            <path d="M10 170 C 30 120 70 100 120 95 C 100 140 60 168 10 170Z" fill="var(--forest)" opacity=".8" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {videoOpen && hero.video_url && (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={hero.video_label}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVideoOpen(false)}
          >
            <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-[var(--radius-card)] bg-black" onClick={(e) => e.stopPropagation()}>
              {embed ? (
                <iframe src={embed} title={hero.video_label} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              ) : (
                <video src={hero.video_url} className="h-full w-full" controls autoPlay />
              )}
            </div>
            <button type="button" className="icon-btn glass absolute top-4 right-4" onClick={() => setVideoOpen(false)} aria-label="Fermer la vidéo" autoFocus>
              <X className="h-5 w-5" />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}
