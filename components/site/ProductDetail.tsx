'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import { landingOffers, offerSoldOut } from '@/lib/landing';
import type { Product, ShopSettings } from '@/lib/types';
import { useCart, useSite } from './Providers';
import Stars from './Stars';

/**
 * Fiche produit : galerie, nom, catégorie, prix et disponibilité, format, quantité,
 * « Ajouter au panier » / « Acheter maintenant », composition, conseils, précautions, livraison et retours.
 */
export default function ProductDetail({ product, categoryName, shop }: { product: Product; categoryName?: string; shop: ShopSettings }) {
  const router = useRouter();
  const { add } = useCart();
  const { currency } = useSite();
  const images = [product.image_url, ...product.gallery].filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const variants = landingOffers(product);
  const hasFormats = variants.length > 1 || !!variants[0]?.id;
  const [variantId, setVariantId] = useState(() => (variants.find((v) => !offerSoldOut(product, v)) ?? variants[0]).id);
  const [qty, setQty] = useState(1);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const comingSoon = !!product.coming_soon;
  const soldOut = comingSoon || offerSoldOut(product, variant);
  const maxQty = product.stock === null ? 99 : Math.max(1, Math.floor(product.stock / variant.units));
  const lowStock = product.stock !== null && product.stock > 0 && product.stock <= 5;
  const format = product.landing?.format;
  const isPhoto = (src: string) => !src.endsWith('.svg');

  const details = [
    { id: 'composition', title: 'Composition et ingrédients', body: product.ingredients },
    { id: 'utilisation', title: 'Conseils d’utilisation', body: product.usage },
    { id: 'precautions', title: 'Précautions et informations réglementaires', body: product.landing?.precautions },
    { id: 'livraison', title: 'Livraison et retours', body: [shop.delivery_info, shop.returns_info].filter(Boolean).join('\n\n') },
  ].filter((d) => d.body?.trim());

  const addToCart = () => add(product, qty, variant.id ? variant : null);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      {/* Galerie */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-[#efebe1]">
          <SmartImage
            src={images[active]}
            alt={product.name}
            fill
            preload
            sizes="(min-width: 1024px) 45vw, 100vw"
            className={isPhoto(images[active] ?? '') ? 'object-cover' : 'object-contain p-8'}
          />
        </div>
        {images.length > 1 && (
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto" role="group" aria-label="Photos du produit">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                aria-label={`Photo ${i + 1}`}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-[#efebe1] ${active === i ? 'border-forest' : 'border-transparent'}`}
              >
                <SmartImage src={src} alt="" fill sizes="80px" className={isPhoto(src) ? 'object-cover' : 'object-contain p-2'} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {categoryName && <p className="kicker">{categoryName}</p>}
        <h1 className="title-xl mt-3 text-[clamp(2.2rem,5vw,3.2rem)]">{product.name}</h1>
        {(format || product.benefit) && <p className="mt-2 text-[16px] text-muted">{format || product.benefit}</p>}
        {product.reviews_count > 0 && <Stars rating={product.rating} count={product.reviews_count} className="mt-3" />}

        <p className="mt-5 font-serif text-[2rem] leading-none font-semibold">
          {comingSoon ? <span className="font-normal text-muted italic">Prix communiqué prochainement</span> : formatPrice(variant.price, currency)}
          {variant.compare_at_price && variant.compare_at_price > variant.price && (
            <span className="ml-3 align-middle font-sans text-[15px] font-normal text-muted line-through">{formatPrice(variant.compare_at_price, currency)}</span>
          )}
        </p>
        <p className={`mt-3 flex items-center gap-2 text-[14px] font-medium ${soldOut ? 'text-[#9a4b2f]' : 'text-sage'}`}>
          <span className={`h-2 w-2 rounded-full ${soldOut ? 'bg-[#9a4b2f]' : 'bg-sage'}`} aria-hidden="true" />
          {comingSoon ? 'Bientôt disponible' : soldOut ? 'Rupture de stock' : lowStock ? `En stock — plus que ${product.stock} disponible${product.stock! > 1 ? 's' : ''}` : 'En stock'}
        </p>

        {(product.tagline || product.description) && (
          <p className="mt-6 text-[16px] leading-relaxed text-muted">{product.tagline || product.description}</p>
        )}

        {product.highlights.length > 0 && (
          <ul className="mt-6 grid grid-cols-3 gap-3 border-y border-line py-5" aria-label="Points forts">
            {product.highlights.slice(0, 3).map((h) => (
              <li key={h} className="flex flex-col items-center gap-2 text-center text-[13px] leading-snug text-anthracite">
                <span className="ring-icon h-11! w-11!">
                  <Check className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Format */}
        {hasFormats && !comingSoon && (
          <fieldset className="mt-6">
            <legend className="mb-3 text-[14px] font-medium">Format</legend>
            <div className="space-y-2.5">
              {variants.map((v) => {
                const out = offerSoldOut(product, v);
                const checked = v.id === variant.id;
                return (
                  <label
                    key={v.id}
                    className={`flex items-center gap-3 rounded-md border px-4 py-3.5 transition-colors ${
                      out ? 'cursor-not-allowed border-line opacity-60' : 'cursor-pointer'
                    } ${checked && !out ? 'border-forest bg-white' : 'border-line-strong bg-white/60 hover:border-forest/50'}`}
                    style={{ borderColor: checked && !out ? undefined : 'var(--line-strong)' }}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={v.id}
                      checked={checked}
                      disabled={out}
                      onChange={() => {
                        setVariantId(v.id);
                        setQty(1);
                      }}
                      className="h-4 w-4 accent-[var(--forest)]"
                    />
                    <span className="flex-1 text-[15px]">
                      {v.label}
                      {v.subtitle && <span className="block text-[13px] text-muted">{v.subtitle}</span>}
                    </span>
                    <span className="text-right text-[15px] font-medium">
                      {formatPrice(v.price, currency)}
                      {out && <span className="block text-[12px] font-normal text-[#9a4b2f]">Rupture de stock</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* Quantité + actions (produit pas encore en vente : rien à commander) */}
        {comingSoon ? (
          <p className="mt-6 rounded-md border border-line bg-white p-4 text-[15px] text-muted">
            Ce produit arrive bientôt dans notre sélection. Contactez-nous pour être prévenu de sa disponibilité.
          </p>
        ) : (
        <>
        <div className="mt-6 flex items-center gap-4">
          <span className="text-[14px] font-medium">Quantité</span>
          <div className="flex items-center rounded-md border" style={{ borderColor: 'var(--line-strong)' }}>
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center" aria-label="Diminuer la quantité">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-[16px] font-medium" aria-live="polite" aria-label={`Quantité : ${qty}`}>
              {qty}
            </span>
            <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="flex h-11 w-11 items-center justify-center" aria-label="Augmenter la quantité">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" className="btn btn-forest" disabled={soldOut} onClick={addToCart}>
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
            Ajouter au panier
          </button>
          <button
            type="button"
            className="btn btn-outline"
            disabled={soldOut}
            onClick={() => {
              addToCart();
              router.push('/commande');
            }}
          >
            Acheter maintenant
          </button>
        </div>
        </>
        )}

        {/* Informations détaillées */}
        {details.length > 0 && (
          <div className="mt-10 divide-y divide-line border-y border-line">
            {details.map((d, i) => (
              <details key={d.id} id={d.id} open={i === 0} className="group scroll-mt-28 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-[1.3rem]">
                  {d.title}
                  <Plus className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-muted">{d.body}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
