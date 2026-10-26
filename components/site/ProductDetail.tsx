'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Heart, Minus, Plus, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useCart, useFavorites, useSite } from './Providers';
import Stars from './Stars';
import Reveal from './Reveal';
import { Eyebrow, SectionHeading } from './Typography';

export default function ProductDetail({ product, categoryName, deliveryInfo }: { product: Product; categoryName?: string; deliveryInfo: string }) {
  const { add } = useCart();
  const router = useRouter();
  const favorites = useFavorites();
  const { currency } = useSite();
  const images = [product.image_url, ...product.gallery].filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const liked = favorites.has(product.id);
  const soldOut = product.stock !== null && product.stock <= 0;
  const maxQty = product.stock ?? 99;

  const details = [
    { title: 'Description', body: product.description },
    { title: 'Composition', body: product.ingredients },
    { title: 'Conseils d’utilisation', body: product.usage },
  ].filter((d) => d.body);

  return (
    <>
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="card relative aspect-square overflow-hidden p-0">
          <SmartImage src={images[active]} alt={product.name} fill priority sizes="(min-width: 1024px) 45vw, 92vw" className="object-contain" />
          {soldOut && (
            <span className="absolute top-4 left-4 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white uppercase">En rupture</span>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-3" role="group" aria-label="Photos du produit">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                aria-label={`Photo ${i + 1}`}
                className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 ${active === i ? 'border-forest' : 'border-transparent opacity-70'}`}
              >
                <SmartImage src={src} alt="" fill sizes="80px" className="object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          {categoryName && <Eyebrow text={categoryName} />}
          {product.is_featured && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-forest uppercase">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Produit du moment
            </span>
          )}
        </div>
        <h1 className="heading-xl mt-4 text-[clamp(2rem,4.4vw,3.2rem)]">{product.name}</h1>
        {product.benefit && <p className="script mt-2 text-[clamp(1.9rem,4vw,2.6rem)]">{product.benefit}</p>}
        <Stars rating={product.rating} count={product.reviews_count} className="mt-4" />
        {product.tagline && <p className="mt-5 max-w-lg font-display text-lg leading-snug font-semibold text-ink md:text-xl">{product.tagline}</p>}

        <p className="mt-6 flex items-baseline gap-3">
          <span className="font-display text-3xl font-extrabold">{formatPrice(product.price, currency)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-base text-ink-muted line-through">{formatPrice(product.compare_at_price, currency)}</span>
          )}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="glass flex items-center rounded-full p-1">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="icon-btn h-10! w-10!" aria-label="Diminuer la quantité">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-semibold" aria-live="polite" aria-label={`Quantité : ${qty}`}>
              {qty}
            </span>
            <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="icon-btn h-10! w-10!" aria-label="Augmenter la quantité">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            className="btn-primary flex-1 sm:flex-none"
            disabled={soldOut}
            onClick={() => {
              add(product, qty);
              router.push('/commande');
            }}
          >
            {soldOut ? 'En rupture · bientôt de retour' : 'Commander'}
          </button>
          <button
            type="button"
            onClick={() => favorites.toggle(product)}
            aria-pressed={liked}
            aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className="icon-btn glass h-12! w-12!"
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-leaf text-leaf' : ''}`} strokeWidth={1.8} />
          </button>
        </div>
        {product.stock !== null && product.stock > 0 && product.stock <= 5 && (
          <p className="mt-3 text-sm font-medium text-leaf">Plus que {product.stock} en stock</p>
        )}

        {product.highlights.length > 0 && (
          <ul className="mt-8 grid gap-2.5 sm:grid-cols-2" aria-label="Points forts">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2.5 text-sm text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          <li className="flex items-start gap-3 rounded-2xl border border-line p-4 text-sm text-ink-muted">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-forest" strokeWidth={1.6} aria-hidden="true" />
            {deliveryInfo}
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-line p-4 text-sm text-ink-muted">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" strokeWidth={1.6} aria-hidden="true" />
            Paiement à la livraison ou par Mobile Money, en toute sécurité.
          </li>
        </ul>

        <div className="mt-10 divide-y divide-line border-y border-line">
          {details.map((d, i) => (
            <details key={d.title} open={i === 0} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-bold">
                {d.title}
                <Plus className="h-4 w-4 transition-transform group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-ink-muted">{d.body}</p>
            </details>
          ))}
        </div>
      </div>
    </div>

    {(product.story || product.benefits.length > 0) && (
      <section aria-labelledby="product-story" className="mt-20 grid gap-10 lg:mt-28 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <Reveal>
          <SectionHeading id="product-story" eyebrow="Pourquoi on" accent="l’aime" title={product.name} script="en détail" />
          {product.story && <p className="mt-6 text-[15px] leading-relaxed whitespace-pre-line text-ink-muted md:text-base">{product.story}</p>}
        </Reveal>
        {product.benefits.length > 0 && (
          <ol className="grid gap-4 self-start sm:grid-cols-2">
            {product.benefits.map((b, i) => (
              <li key={b.title + i} className={product.benefits.length === 3 && i === 0 ? 'sm:col-span-2' : ''}>
                <Reveal delay={i * 0.08} className="card h-full p-6">
                  <span className="font-display text-sm font-extrabold text-leaf">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="heading-lg mt-2 text-lg">{b.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{b.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        )}
      </section>
    )}
    </>
  );
}
