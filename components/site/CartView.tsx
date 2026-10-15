'use client';

import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import type { ShopSettings } from '@/lib/types';
import { useCart, useSite } from './Providers';

export function shippingFor(subtotal: number, shop: ShopSettings) {
  return shop.free_shipping_threshold > 0 && subtotal >= shop.free_shipping_threshold ? 0 : shop.shipping_fee;
}

export function OrderSummary({ shop, children }: { shop: ShopSettings; children?: React.ReactNode }) {
  const { subtotal } = useCart();
  const { currency } = useSite();
  const shipping = shippingFor(subtotal, shop);
  const remaining = shop.free_shipping_threshold - subtotal;
  return (
    <aside className="card h-fit p-6 lg:sticky lg:top-28" aria-label="Récapitulatif">
      <h2 className="heading-lg text-xl">Récapitulatif</h2>
      <dl className="mt-5 space-y-3 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Sous-total</dt>
          <dd className="font-semibold">{formatPrice(subtotal, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Livraison</dt>
          <dd className="font-semibold">{shipping === 0 ? 'Offerte' : formatPrice(shipping, currency)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-lg">
          <dt className="font-display font-bold">Total</dt>
          <dd className="font-display font-extrabold">{formatPrice(subtotal + shipping, currency)}</dd>
        </div>
      </dl>
      {shop.free_shipping_threshold > 0 && remaining > 0 && (
        <p className="mt-4 rounded-2xl bg-sage-light/70 px-4 py-3 text-[13px] text-ink-muted">
          Plus que <strong className="text-ink">{formatPrice(remaining, currency)}</strong> pour profiter de la livraison offerte.
        </p>
      )}
      {children}
    </aside>
  );
}

export default function CartView({ shop }: { shop: ShopSettings }) {
  const { lines, ready, setQuantity, remove } = useCart();
  const { currency } = useSite();

  if (!ready) return <div className="min-h-[40vh]" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-forest" strokeWidth={1.4} aria-hidden="true" />
        <p className="heading-lg mt-4 text-xl">Votre panier est vide</p>
        <p className="mt-2 text-sm text-ink-muted">Découvrez nos produits naturels et composez votre rituel.</p>
        <Link href="/boutique" className="btn-primary mt-6">
          Découvrir la boutique
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <ul className="space-y-3">
        {lines.map((line) => (
          <li key={line.product_id} className="card flex gap-4 p-3 sm:items-center">
            <Link href={`/produit/${line.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-cream">
              <SmartImage src={line.image_url} alt={line.name} fill sizes="96px" className="object-contain" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href={`/produit/${line.slug}`} className="font-display font-bold hover:text-leaf">
                  {line.name}
                </Link>
                <p className="text-sm text-ink-muted">{formatPrice(line.price, currency)}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center rounded-full border border-line">
                  <button type="button" className="icon-btn h-9! w-9!" onClick={() => setQuantity(line.product_id, line.quantity - 1)} aria-label={`Diminuer la quantité de ${line.name}`}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold">{line.quantity}</span>
                  <button type="button" className="icon-btn h-9! w-9!" onClick={() => setQuantity(line.product_id, line.quantity + 1)} aria-label={`Augmenter la quantité de ${line.name}`}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="w-28 text-right font-display font-bold">{formatPrice(line.price * line.quantity, currency)}</p>
                <button type="button" className="icon-btn h-9! w-9! text-ink-muted" onClick={() => remove(line.product_id)} aria-label={`Retirer ${line.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <OrderSummary shop={shop}>
        <Link href="/commande" className="btn-primary mt-6 w-full">
          Commander
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href="/boutique" className="mt-3 block text-center text-sm font-medium text-ink-muted hover:text-ink">
          Continuer mes achats
        </Link>
      </OrderSummary>
    </div>
  );
}
