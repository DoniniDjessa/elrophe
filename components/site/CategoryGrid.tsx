import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import type { Category } from '@/lib/types';
import Reveal from './Reveal';

export default function CategoryGrid({ categories, title, linkLabel }: { categories: Category[]; title: string; linkLabel: string }) {
  if (categories.length === 0) return null;
  return (
    <section aria-labelledby="categories-title" className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <Reveal className="flex items-center gap-5">
        <h2 id="categories-title" className="heading-lg shrink-0 text-[clamp(1.5rem,3vw,2.1rem)]">
          {title}
        </h2>
        <span aria-hidden="true" className="h-px flex-1 bg-forest/20" />
        <Link href="/boutique" className="group hidden shrink-0 items-center gap-2 text-sm font-semibold text-ink sm:flex">
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </Reveal>

      <Reveal delay={0.05}>
      <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {categories.map((cat) => (
          <li key={cat.id} className="w-[62vw] max-w-[260px] shrink-0 snap-start sm:w-[38vw] lg:w-auto lg:max-w-none">
            <Link
                href={`/boutique?categorie=${cat.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-cream shadow-[var(--shadow-card)]"
              >
                <SmartImage
                  src={cat.image_url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 16vw, 60vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#13201699] via-[#13201622] via-45% to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="font-display block text-[17px] leading-tight font-bold text-white">{cat.name}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/85">
                    Acheter
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
                  </span>
                </span>
              </Link>
          </li>
        ))}
      </ul>
      </Reveal>

      <Link href="/boutique" className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink sm:hidden">
        {linkLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
