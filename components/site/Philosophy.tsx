import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import type { SectionsSettings } from '@/lib/types';
import Reveal from './Reveal';
import { SectionHeading } from './Typography';

export default function Philosophy({ data, showLink = true }: { data: SectionsSettings['philosophy']; showLink?: boolean }) {
  return (
    <section aria-labelledby="philosophy-title" className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[var(--shadow-soft)] sm:aspect-[5/5] lg:aspect-[4/5]">
            <SmartImage src={data.image_url} alt="Sélection de produits ELROPHE sur pierre naturelle" fill sizes="(min-width: 1024px) 45vw, 92vw" className="object-cover" />
          </div>
          <div aria-hidden="true" className="absolute -right-3 -bottom-3 -z-10 h-full w-full rounded-[2rem] border border-forest/15 sm:-right-5 sm:-bottom-5" />
        </Reveal>

        <div>
          <Reveal>
            <SectionHeading id="philosophy-title" eyebrow={data.eyebrow} accent={data.eyebrow_accent} title={data.title} script={data.script} />
            <p className="mt-6 text-[15px] leading-relaxed text-ink-muted md:text-base">{data.text}</p>
          </Reveal>

          {data.stats.length > 0 && (
            <dl className="mt-10 grid grid-cols-3 gap-3 sm:gap-5">
              {data.stats.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 0.08} className="flex flex-col-reverse border-t border-forest/20 pt-4">
                  <dt className="mt-1 text-[12.5px] leading-snug text-ink-muted">{stat.label}</dt>
                  <dd className="heading-lg text-[clamp(1.5rem,3.4vw,2.5rem)] text-forest">{stat.value}</dd>
                </Reveal>
              ))}
            </dl>
          )}

          {showLink && data.cta_label && (
            <Reveal delay={0.2} className="mt-10">
              <Link href="/a-propos" className="btn-primary group">
                {data.cta_label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
