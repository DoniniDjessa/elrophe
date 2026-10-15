'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import type { SectionHeading as Heading, Testimonial } from '@/lib/types';
import Reveal from './Reveal';
import Stars from './Stars';
import { SectionHeading } from './Typography';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function Testimonials({ items, heading }: { items: Testimonial[]; heading: Heading }) {
  const track = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('li');
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 20), behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-title" className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading id="testimonials-title" eyebrow={heading.eyebrow} accent={heading.eyebrow_accent} title={heading.title} script={heading.script} text={heading.text} />
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll(-1)} disabled={!canPrev} className="icon-btn glass disabled:opacity-40" aria-label="Avis précédents">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => scroll(1)} disabled={!canNext} className="icon-btn glass disabled:opacity-40" aria-label="Avis suivants">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </Reveal>

      <ul
        ref={track}
        onScroll={update}
        className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto scroll-smooth px-4 pb-6 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
        aria-label="Témoignages clients"
      >
        {items.map((t) => (
          <li key={t.id} className="w-[86vw] max-w-[400px] shrink-0 snap-start sm:w-[60vw] lg:w-[calc((100%-2.5rem)/3)] lg:max-w-none">
            <figure className="card flex h-full flex-col p-7">
              <Quote className="h-7 w-7 text-leaf/70" strokeWidth={1.4} aria-hidden="true" />
              <Stars rating={t.rating} className="mt-4" />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink">« {t.text} »</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest text-sm font-bold text-white">
                  {t.avatar_url ? <SmartImage src={t.avatar_url} alt="" fill sizes="44px" className="object-cover" /> : initials(t.name)}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-ink">{t.name}</span>
                  <span className="block text-xs text-ink-muted">
                    {[t.location, t.product_name].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
