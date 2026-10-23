'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import type { SectionHeading as Heading, Solution } from '@/lib/types';
import Reveal from './Reveal';
import { SectionHeading } from './Typography';

/** Solutions bien-être sous le hero : cartes défilant horizontalement, chacune mène à ses produits */
export default function Solutions({ items, heading }: { items: Solution[]; heading: Heading }) {
  const list = useRef<HTMLUListElement>(null);
  if (items.length === 0) return null;

  const scroll = (dir: -1 | 1) => {
    const el = list.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="solutions-title" className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 sm:px-6 lg:px-10 lg:pb-16">
      <Reveal className="flex items-end justify-between gap-6">
        <SectionHeading id="solutions-title" eyebrow={heading.eyebrow} accent={heading.eyebrow_accent} title={heading.title} script={heading.script} text={heading.text} />
        <div className="hidden shrink-0 gap-2 md:flex">
          <button type="button" onClick={() => scroll(-1)} className="icon-btn glass shadow-[var(--shadow-card)]" aria-label="Solutions précédentes">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <button type="button" onClick={() => scroll(1)} className="icon-btn glass shadow-[var(--shadow-card)]" aria-label="Solutions suivantes">
            <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>
      </Reveal>

      {/* Mobile : environ 2,1 cartes visibles (marge de 1rem + deux espaces de 0,75rem) */}
      <Reveal delay={0.05}>
        <ul
          ref={list}
          className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto sm:gap-4 px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-10 lg:scroll-px-10 lg:gap-5 lg:px-10"
        >
          {items.map((s) => (
            <li key={s.id} className="w-[calc((100vw-2.5rem)/2.1)] shrink-0 snap-start sm:w-[300px]">
              <Link
                href={`/solution/${s.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-cream shadow-[var(--shadow-card)] transition-transform duration-500 hover:-translate-y-1"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_50%_45%,var(--surface-cream),var(--bg-sage-light)_80%)]">
                  <SmartImage
                    src={s.image_url}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 300px, 48vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </span>
                <span className="flex flex-1 flex-col p-3 sm:p-5">
                  <span className="font-display text-[14px] leading-tight font-bold text-ink sm:text-[17px]">{s.title}</span>
                  {s.description && (
                    <span className="mt-1.5 line-clamp-2 text-xs leading-snug text-ink-muted sm:mt-2 sm:line-clamp-3 sm:text-sm sm:leading-relaxed">{s.description}</span>
                  )}
                  <span className="mt-auto flex items-center gap-1 pt-3 text-[12px] font-semibold text-leaf sm:gap-1.5 sm:pt-4 sm:text-[13px]">
                    Voir les produits
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
