import Link from 'next/link';
import { ArrowRight, Quote, Star } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import type { HomeSettings, Testimonial } from '@/lib/types';

/** Étoiles champagne (note sur 5) */
export function RatingStars({ rating, className = '' }: { rating: number; className?: string }) {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={`Note : ${value} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < value ? 'fill-champagne text-champagne' : 'text-line-strong'}`} strokeWidth={1.4} aria-hidden="true" style={i < value ? undefined : { color: 'var(--line-strong)' }} />
      ))}
    </span>
  );
}

/** « Témoignages clients » de l'accueil : avis visibles de Pilotage › Avis clients (6 au plus) */
export default function Testimonials({ items, heading }: { items: Testimonial[]; heading: HomeSettings['reviews'] }) {
  if (items.length === 0) return null;
  const shown = items.slice(0, 6);
  return (
    <section aria-labelledby="testimonials-title" className="border-t border-line bg-white/60 py-14 lg:py-20">
      <div className="container-site">
        <div className="text-center">
          <p className="kicker kicker-lines">{heading.kicker}</p>
          <h2 id="testimonials-title" className="title-lg mt-3 text-[clamp(1.9rem,4vw,2.7rem)]">
            {heading.title}
          </h2>
        </div>
        {/* Mobile : défilement horizontal ; ordinateur : grille */}
        <ul className="no-scrollbar -mx-3 mt-10 flex snap-x snap-mandatory scroll-pl-3 gap-3 overflow-x-auto px-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {shown.map((t) => (
            <li key={t.id} className="w-[85%] shrink-0 snap-start sm:w-auto">
              <article className="flex h-full flex-col rounded-lg border border-line bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <RatingStars rating={t.rating} />
                  <Quote className="h-6 w-6 text-champagne" strokeWidth={1.3} aria-hidden="true" />
                </div>
                <blockquote className="mt-4 flex-1 font-serif text-[1.25rem] leading-snug text-anthracite">{t.text.replace(/^«\s*|\s*»$/g, '')}</blockquote>
                <footer className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  {t.avatar_url ? (
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <SmartImage src={t.avatar_url} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                  ) : (
                    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory font-serif text-lg text-forest">
                      {t.name.trim().charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0 text-[14px] leading-snug">
                    <span className="block font-semibold text-anthracite">{t.name}</span>
                    {(t.location || t.product_name) && <span className="block text-muted">{[t.location?.trim(), t.product_name].filter(Boolean).join(' · ')}</span>}
                  </span>
                </footer>
              </article>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link href="/avis" className="btn btn-outline">
            Voir tous les avis
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
