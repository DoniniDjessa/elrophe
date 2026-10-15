'use client';

import Link from 'next/link';
import { ArrowRight, Check, Heart } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import type { Category, FeaturedSettings, Product } from '@/lib/types';
import { useCart, useFavorites, useSite } from './Providers';
import Reveal from './Reveal';
import Stars from './Stars';
import { Eyebrow, Script } from './Typography';

/**
 * « Produit du moment » juste sous le hero : le produit coché dans Pilotage › Boutique,
 * avec son accroche et ses points forts (sinon, la première meilleure vente).
 */
export default function FeaturedProduct({ data, products, categories }: { data: FeaturedSettings; products: Product[]; categories: Category[] }) {
  const { add } = useCart();
  const favorites = useFavorites();
  const { currency } = useSite();

  const product =
    products.find((p) => p.is_featured) ??
    [...products].sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller) || b.reviews_count - a.reviews_count)[0];
  if (!product) return null;

  const category = categories.find((c) => c.slug === product.category_slug);
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price;
  const soldOut = product.stock !== null && product.stock <= 0;
  const liked = favorites.has(product.id);
  const highlights = product.highlights.slice(0, 4);

  return (
    <section aria-labelledby="featured-title" className="mx-auto max-w-[1440px] px-4 pb-6 sm:px-6 lg:px-10">
      <Reveal className="glass relative overflow-hidden rounded-[2rem] shadow-[var(--shadow-soft)]">
        <div className="grid lg:grid-cols-[1fr_1.1fr]">
          {/* Visuel */}
          <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_45%,var(--surface-cream),var(--bg-sage-light)_75%)] sm:aspect-[4/3] lg:aspect-auto lg:min-h-[480px]">
            <span aria-hidden="true" className="absolute top-1/2 left-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-forest/10" />
            <Link href={`/produit/${product.slug}`} className="group absolute inset-6 sm:inset-10" aria-label={`Voir ${product.name}`}>
              <SmartImage
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 45vw, 92vw"
                className="rounded-[1.25rem] object-contain drop-shadow-[0_24px_30px_rgba(30,53,36,0.16)] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </Link>
            {onSale && (
              <span className="pointer-events-none absolute top-5 left-5 rounded-full bg-lime px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-forest uppercase">
                −{Math.round((1 - product.price / product.compare_at_price!) * 100)} %
              </span>
            )}
            <button
              type="button"
              onClick={() => favorites.toggle(product)}
              aria-pressed={liked}
              aria-label={liked ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
              className="glass absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105"
            >
              <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-leaf text-leaf' : 'text-ink'}`} strokeWidth={1.8} />
            </button>
          </div>

          {/* Contenu */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <Eyebrow text={data.eyebrow} accent={data.eyebrow_accent} />
            {category && <p className="mt-4 text-[13px] font-medium text-ink-muted">{category.name}</p>}
            <h2 id="featured-title" className="heading-lg mt-1 text-[clamp(1.9rem,3.6vw,2.9rem)]">
              {product.name}
            </h2>
            {data.script && (
              <p className="mt-1 text-[clamp(2rem,3.6vw,2.8rem)]">
                <Script>{data.script}</Script>
              </p>
            )}
            <Stars rating={product.rating} count={product.reviews_count} className="mt-4" />
            <p className="mt-5 max-w-lg font-display text-lg leading-snug font-semibold text-ink md:text-xl">
              {product.tagline || product.benefit}
            </p>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-muted">
              {product.description}
            </p>

            {highlights.length > 0 && (
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2.5 text-sm text-ink">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-6">
              <p className="leading-none">
                <span className="font-display text-[2rem] font-extrabold">{formatPrice(product.price, currency)}</span>
                {onSale && <span className="ml-2.5 text-sm text-ink-muted line-through">{formatPrice(product.compare_at_price!, currency)}</span>}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="btn-primary" disabled={soldOut} onClick={() => add(product)}>
                  {soldOut ? 'Bientôt de retour' : data.cta_label}
                </button>
                <Link href={`/produit/${product.slug}`} className="group inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold text-ink">
                  Voir le produit
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
