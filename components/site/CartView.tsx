'use client';

import Link from 'next/link';
import { ArrowRight, Banknote, Headset, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import type { ShopSettings } from '@/lib/types';
import { useCart, useSite, type CartLine } from './Providers';

/** Frais de livraison : même calcul que le serveur (elrophe_place_order) */
export function shippingFor(subtotal: number, shop: ShopSettings, lines: CartLine[] = []) {
  if (lines.length > 0 && lines.every((l) => l.free_shipping)) return 0;
  return shop.free_shipping_threshold > 0 && subtotal >= shop.free_shipping_threshold ? 0 : shop.shipping_fee;
}

export function OrderSummary({ shop, children }: { shop: ShopSettings; children?: React.ReactNode }) {
  const { subtotal, lines } = useCart();
  const { currency } = useSite();
  const shipping = shippingFor(subtotal, shop, lines);
  const remaining = shop.free_shipping_threshold - subtotal;
  return (
    <aside className="card h-fit p-5 sm:p-6 lg:sticky lg:top-28" aria-label="Récapitulatif">
      <h2 className="font-serif text-[1.6rem]">Récapitulatif</h2>
      <dl className="mt-4 space-y-3 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-muted">Sous-total</dt>
          <dd>{formatPrice(subtotal, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Livraison</dt>
          <dd>{shipping === 0 ? 'Offerte' : formatPrice(shipping, currency)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <dt className="font-serif text-[1.35rem]">Total</dt>
          <dd className="font-serif text-[1.6rem] font-semibold">{formatPrice(subtotal + shipping, currency)}</dd>
        </div>
      </dl>
      {shipping > 0 && shop.free_shipping_threshold > 0 && remaining > 0 && (
        <p className="mt-4 rounded-md bg-ivory px-4 py-3 text-[14px] text-muted">
          Plus que <strong className="font-medium text-anthracite">{formatPrice(remaining, currency)}</strong> pour profiter de la livraison offerte.
        </p>
      )}
      {children}
    </aside>
  );
}

const reassurance = [
  { Icon: Truck, label: 'Livraison suivie' },
  { Icon: Banknote, label: 'Paiement à la livraison' },
  { Icon: Headset, label: 'Service client' },
];

export default function CartView({ shop }: { shop: ShopSettings }) {
  const { lines, ready, setQuantity, remove } = useCart();
  const { currency } = useSite();

  if (!ready) return <div className="min-h-[40vh]" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-forest" strokeWidth={1.3} aria-hidden="true" />
        <p className="mt-4 font-serif text-[1.7rem]">Votre panier est vide</p>
        <p className="mt-2 text-[15px] text-muted">Découvrez notre sélection de produits naturels.</p>
        <Link href="/boutique" className="btn btn-forest mt-6">
          Découvrir nos produits
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((line) => (
            <li key={line.key} className="flex gap-4 py-4">
              <Link href={`/produit/${line.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-[#efebe1]">
                <SmartImage src={line.image_url} alt={line.name} fill sizes="96px" className={line.image_url?.endsWith('.svg') ? 'object-contain p-2' : 'object-cover'} />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/produit/${line.slug}`} className="font-serif text-[1.25rem] leading-tight hover:text-forest">
                      {line.name}
                    </Link>
                    {line.variant && <p className="text-[14px] text-muted">{line.variant}</p>}
                    <p className="mt-1 text-[15px] font-medium">{formatPrice(line.price, currency)}</p>
                  </div>
                  <button type="button" className="icon-btn -mt-1 -mr-2 h-10! w-10! shrink-0 text-muted" onClick={() => remove(line.key)} aria-label={`Retirer ${line.name} du panier`}>
                    <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-md border" style={{ borderColor: 'var(--line-strong)' }}>
                    <button type="button" className="flex h-10 w-10 items-center justify-center" onClick={() => setQuantity(line.key, line.quantity - 1)} aria-label={`Diminuer la quantité de ${line.name}`}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-[15px] font-medium" aria-live="polite">
                      {line.quantity}
                    </span>
                    <button type="button" className="flex h-10 w-10 items-center justify-center" onClick={() => setQuantity(line.key, line.quantity + 1)} aria-label={`Augmenter la quantité de ${line.name}`}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-serif text-[1.2rem] font-semibold">{formatPrice(line.price * line.quantity, currency)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/boutique" className="mt-5 inline-flex items-center gap-2 text-[15px] text-forest hover:underline">
          Continuer mes achats
        </Link>
      </div>

      <div>
        <OrderSummary shop={shop}>
          <Link href="/commande" className="btn btn-forest mt-6 w-full">
            Passer la commande
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </OrderSummary>
        <ul className="mt-6 grid grid-cols-3 gap-3 text-center text-[13px] text-muted">
          {reassurance.map(({ Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-2">
              <span className="ring-icon h-11! w-11!">
                <Icon className="h-5 w-5" strokeWidth={1.4} aria-hidden="true" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
