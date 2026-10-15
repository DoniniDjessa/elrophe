import type { SectionsSettings } from '@/lib/types';
import Reveal from './Reveal';
import { SectionHeading } from './Typography';

export default function Ritual({ data }: { data: SectionsSettings['ritual'] }) {
  return (
    <section id="rituel" aria-labelledby="ritual-title" className="mx-auto max-w-[1440px] scroll-mt-24 px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <Reveal>
        <SectionHeading id="ritual-title" align="center" eyebrow={data.eyebrow} accent={data.eyebrow_accent} title={data.title} script={data.script} text={data.text} />
      </Reveal>

      <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
        {/* Ligne fine qui relie les étapes */}
        <span aria-hidden="true" className="absolute top-8 right-[16.6%] left-[16.6%] hidden h-px bg-forest/20 md:block" />
        <span aria-hidden="true" className="absolute top-0 bottom-0 left-8 w-px bg-forest/20 md:hidden" />
        {data.steps.map((step, i) => (
          <li key={step.title} className="relative">
            <Reveal delay={i * 0.1} className="flex gap-5 md:flex-col md:items-center md:text-center">
              <span className="glass relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-lg font-extrabold text-forest shadow-[var(--shadow-card)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="pt-2 md:pt-6">
                <h3 className="heading-lg text-xl">{step.title}</h3>
                <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink-muted md:mx-auto">{step.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
