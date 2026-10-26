'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useCart, useFavorites, useSite } from './Providers';
import Stars from './Stars';

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  const router = useRouter();
  const favorites = useFavorites();
  const { currency } = useSite();
  const liked = favorites.has(product.id);
  const soldOut = product.stock !== null && product.stock <= 0;

  return (
    <article className="card group relative flex h-full flex-col overflow-hidden p-2.5">
      <div className="relative aspect-square overflow-hidden rounded-[14px] bg-cream">
        <Link href={`/produit/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          <SmartImage
            src={product.image_url}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </Link>
        <div className="pointer-events-none absolute top-2.5 left-2.5 flex gap-1.5">
          {soldOut && <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white uppercase">En rupture</span>}
          {product.is_new && <span className="rounded-full bg-forest px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-white uppercase">Nouveau</span>}
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="rounded-full bg-lime px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-forest uppercase">
              −{Math.round((1 - product.price / product.compare_at_price) * 100)} %
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => favorites.toggle(product)}
          aria-pressed={liked}
          aria-label={liked ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          className="glass absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-leaf text-leaf' : 'text-ink'}`} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <h3 className="font-display text-[15.5px] leading-snug font-bold">
          <Link href={`/produit/${product.slug}`} className="hover:text-leaf">
            {product.name}
          </Link>
        </h3>
        {product.benefit && <p className="mt-1 text-[13px] leading-snug text-ink-muted">{product.benefit}</p>}
        <Stars rating={product.rating} count={product.reviews_count} className="mt-2.5" />
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="leading-tight">
            <span className="font-display text-[17px] font-extrabold text-ink">{formatPrice(product.price, currency)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="ml-2 text-xs text-ink-muted line-through">{formatPrice(product.compare_at_price, currency)}</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              add(product);
              router.push('/commande');
            }}
            disabled={soldOut}
            aria-label={soldOut ? `${product.name} en rupture` : `Commander ${product.name}`}
            className="shrink-0 rounded-full bg-forest px-4 py-2.5 text-[13px] font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Commander
          </button>
        </div>
        {soldOut && <p className="mt-2 text-xs font-medium text-ink-muted">Bientôt de retour</p>}
      </div>
    </article>
  );
}
