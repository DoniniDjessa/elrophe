import SmartImage from '@/components/ui/SmartImage';
import type { Ingredient, SectionHeading as Heading } from '@/lib/types';
import Reveal from './Reveal';
import { SectionHeading } from './Typography';

export default function Ingredients({ items, heading }: { items: Ingredient[]; heading: Heading }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="ingredients-title" className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <Reveal>
        <SectionHeading id="ingredients-title" eyebrow={heading.eyebrow} accent={heading.eyebrow_accent} title={heading.title} script={heading.script} text={heading.text} />
      </Reveal>
      <ul className="mt-10 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {items.map((item, i) => (
          <li key={item.id}>
            <Reveal delay={i * 0.06} className="card group flex h-full flex-col items-center p-6 text-center">
              <div className="relative h-36 w-36 transition-transform duration-700 group-hover:-translate-y-1 group-hover:rotate-[-3deg]">
                <SmartImage src={item.image_url} alt={`Illustration : ${item.name}`} fill sizes="144px" className="object-contain" />
              </div>
              <h3 className="heading-lg mt-5 text-xl">{item.name}</h3>
              {item.latin_name && <p className="script mt-1 text-2xl">{item.latin_name}</p>}
              {item.benefit && <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{item.benefit}</p>}
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
