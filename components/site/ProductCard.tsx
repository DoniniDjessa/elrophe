'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import { cardOffer, landingOffers, offerSoldOut } from '@/lib/landing';
import type { Product } from '@/lib/types';
import { useCart, useSite } from './Providers';

/**
 * Carte produit : photo réelle, nom exact, catégorie, format, prix.
 * cta « discover » : bouton Découvrir (accueil) ; « cart » : ajout rapide au panier (grille Nos produits).
 */
export default function ProductCard({
  product,
  categoryName,
  cta = 'cart',
  priority = false,
}: {
  product: Product;
  categoryName?: string;
  cta?: 'discover' | 'cart';
  priority?: boolean;
}) {
  const { add } = useCart();
  const { currency } = useSite();
  const href = `/produit/${product.slug}`;
  const comingSoon = !!product.coming_soon;
  // Variante mise en avant (choisie dans le pilotage, sinon la plus chère) : son libellé et son prix
  const offer = cardOffer(product);
  const several = landingOffers(product).length > 1;
  const available = comingSoon || offerSoldOut(product, offer) ? undefined : offer;
  const soldOut = !available;
  const format = product.landing?.format;
  const isPhoto = !!product.image_url && !product.image_url.endsWith('.svg');

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-[#efebe1]" aria-label={product.name}>
        <SmartImage
          src={product.image_url}
          alt=""
          fill
          preload={priority}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw"
          className={`${isPhoto ? 'object-cover' : 'object-contain p-4'} transition-transform duration-700 ease-out group-hover:scale-[1.03]`}
        />
        {soldOut && (
          <span className={`absolute top-2.5 left-2.5 rounded px-2 py-1 text-[11px] font-medium ${comingSoon ? 'bg-champagne text-forest' : 'bg-anthracite/85 text-white'}`}>
            {comingSoon ? 'Bientôt disponible' : 'Rupture de stock'}
          </span>
        )}
      </Link>

      <div className={`flex flex-1 flex-col p-3 sm:p-4 ${cta === 'discover' ? 'items-center text-center' : ''}`}>
        <h3 className="font-serif text-[1.15rem] leading-[1.1] font-bold sm:text-[1.3rem]">
          <Link href={href} className="hover:text-forest">
            {product.name}
          </Link>
        </h3>
        {categoryName && cta === 'discover' && <p className="mt-0.5 text-[13px] leading-tight text-muted">{categoryName}</p>}
        {format && <p className="mt-0.5 text-[13px] leading-tight text-muted">{format}</p>}

        {cta === 'discover' ? (
          // Prix et bouton poussés en bas : alignés d'une carte à l'autre, quelle que soit la longueur du texte
          <div className="mt-auto flex w-full flex-col items-center pt-2">
            {/* Pas encore en vente : pas de prix (le badge sur la photo l'indique) */}
            {!comingSoon && (
              <>
                {several && <p className="text-[13px] leading-tight text-muted">{offer.label}</p>}
                <p className="font-serif text-[1.35rem] leading-tight font-semibold text-anthracite">{formatPrice(offer.price, currency)}</p>
              </>
            )}
            <Link href={href} className="btn btn-forest mt-3 w-full max-w-60">
              Découvrir
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <p className="font-serif text-[1.15rem] leading-tight font-semibold sm:text-[1.25rem]">
              {!comingSoon && (
                <>
                  {several && <span className="block font-sans text-[12px] font-normal text-muted">{offer.label}</span>}
                  {formatPrice(offer.price, currency)}
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => available && add(product, 1, available.id ? available : null)}
              disabled={soldOut}
              aria-label={comingSoon ? `${product.name} : bientôt disponible` : soldOut ? `${product.name} : rupture de stock` : `Ajouter ${product.name}${available?.id ? ` (${available.label})` : ''} au panier`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-forest text-white transition-colors hover:bg-forest-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
