'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { byRank } from '@/lib/ranking';
import type { Product, SectionHeading as Heading } from '@/lib/types';
import ProductCard from './ProductCard';
import Reveal from './Reveal';
import { SectionHeading } from './Typography';

const tabs = [
  { id: 'all', label: 'Tous', match: () => true },
  { id: 'complements', label: 'Compléments', match: (p: Product) => p.category_slug === 'complements' || p.category_slug === 'superaliments' },
  { id: 'soins', label: 'Soins', match: (p: Product) => !!p.category_slug?.startsWith('soins') || p.category_slug === 'huiles-essentielles' },
] as const;

export default function BestSellers({ products, heading }: { products: Product[]; heading: Heading }) {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('all');
  const current = tabs.find((t) => t.id === tab)!;
  // Meilleures ventes dans l'ordre du pilotage, puis le reste de la boutique pour toujours afficher 4 cartes
  const ranked = [...products.filter((p) => p.is_bestseller).sort(byRank('bestseller_order')), ...products.filter((p) => !p.is_bestseller).sort(byRank('sort_order'))];
  const visible = ranked.filter(current.match).slice(0, 4);

  return (
    <section aria-labelledby="bestsellers-title" className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading id="bestsellers-title" eyebrow={heading.eyebrow} accent={heading.eyebrow_accent} title={heading.title} script={heading.script} text={heading.text} />
        <div role="tablist" aria-label="Filtrer les meilleures ventes" className="glass flex shrink-0 gap-1 self-start rounded-full p-1.5 md:self-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="bestsellers-panel"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors sm:px-5 ${tab === t.id ? 'bg-forest text-white' : 'text-ink hover:bg-white/60'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      <div id="bestsellers-panel" role="tabpanel" className="mt-10 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {visible.map((product, i) => (
          <Reveal key={product.id} delay={i * 0.06}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link href="/meilleures-ventes" className="btn-ghost group">
          Voir toutes les meilleures ventes
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
