'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Check, Minus, Plus, ShoppingCart, Truck } from 'lucide-react';
import { toast } from 'sonner';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import { landingOffers, offerSoldOut } from '@/lib/landing';
import type { Product, ProductLanding, ShopSettings } from '@/lib/types';
import { useSite } from '../Providers';

/**
 * Formulaire de commande en bas de la page du produit spécial :
 * le client coche une ou plusieurs variantes dans « Détails de la commande », règle les quantités, puis paie à la livraison.
 */
export default function DirectOrder({ product, landing, shop }: { product: Product; landing: ProductLanding; shop: ShopSettings }) {
  const router = useRouter();
  const { currency } = useSite();
  const variants = landingOffers(product);
  // Variante cochée → quantité ; la première disponible est cochée d'office
  const [selected, setSelected] = useState<Record<string, number>>(() => {
    const first = variants.find((v) => !offerSoldOut(product, v));
    return first ? { [first.id]: 1 } : {};
  });
  const [submitting, setSubmitting] = useState(false);

  const lines = variants.filter((v) => selected[v.id]).map((v) => ({ variant: v, quantity: selected[v.id] }));
  const subtotal = lines.reduce((sum, l) => sum + l.variant.price * l.quantity, 0);
  // Même calcul que le serveur (elrophe_place_order)
  const shipping =
    landing.free_shipping && lines.every((l) => l.variant.id) ? 0 : shop.free_shipping_threshold && subtotal >= shop.free_shipping_threshold ? 0 : shop.shipping_fee;
  const maxQty = (units: number) => (product.stock === null ? 99 : Math.max(1, Math.floor(product.stock / units)));

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = { ...s };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  const setQty = (id: string, quantity: number) => setSelected((s) => ({ ...s, [id]: quantity }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (lines.length === 0) return toast.error('Cochez au moins une variante.');
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.get('name'),
          customer_phone: form.get('phone'),
          address: form.get('address'),
          city: form.get('city'),
          notes: form.get('notes'),
          payment_method: 'cash_on_delivery',
          items: lines.map((l) => ({ product_id: product.id, quantity: l.quantity, offer_id: l.variant.id })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'La commande n’a pas pu être enregistrée.');
      router.push(`/commande/confirmation?n=${encodeURIComponent(json.order_number)}&m=cash_on_delivery`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur inattendue');
      setSubmitting(false);
    }
  };

  return (
    <section id="commander" aria-labelledby="direct-order-title" className="mx-auto max-w-2xl scroll-mt-28">
      <div className="text-center">
        <h2 id="direct-order-title" className="font-serif text-[clamp(1.9rem,4.4vw,2.6rem)] leading-tight font-bold text-forest">
          {landing.order_title}
        </h2>
        {landing.order_subtitle && <p className="mt-3 text-[15px] font-medium text-ink-muted">{landing.order_subtitle}</p>}
        {landing.order_badge && (
          <p className="mt-4 inline-flex rounded-full bg-[color-mix(in_srgb,var(--leaf)_16%,white)] px-4 py-1.5 text-[13px] font-semibold text-forest">
            {landing.order_badge}
          </p>
        )}
      </div>

      <form onSubmit={submit} className="card mt-8 overflow-hidden p-0">
        <div className="flex items-center gap-3 p-5 sm:p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--leaf)_12%,white)] text-leaf">
            <ShoppingCart className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h3 className="font-serif text-xl font-bold text-forest">Détails de la commande</h3>
        </div>

        <div className="mx-3 flex items-center gap-4 rounded-2xl bg-white/70 p-4 sm:mx-5">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-cream">
            <SmartImage src={product.image_url} alt="" fill sizes="56px" className="object-contain" />
          </span>
          <p className="min-w-0">
            <span className="block truncate font-display text-sm font-bold tracking-[0.04em] text-ink uppercase">{product.name}</span>
            <span className="block text-xs text-ink-muted">{variants.length > 1 ? 'Cochez la ou les variantes souhaitées' : 'Choisissez la quantité'}</span>
          </p>
        </div>

        {/* Variantes à cocher */}
        <fieldset className="mx-3 mt-3 space-y-3 sm:mx-5">
          <legend className="sr-only">Variantes</legend>
          {variants.map((v) => {
            const out = offerSoldOut(product, v);
            const checked = !!selected[v.id] && !out;
            const qty = selected[v.id] ?? 1;
            return (
              <div
                key={v.id || 'unit'}
                className={`rounded-2xl border-2 bg-white/80 p-4 transition-colors ${checked ? 'border-leaf' : 'border-line'} ${out ? 'opacity-70' : ''}`}
              >
                <label className={`flex items-start gap-3 ${out ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input type="checkbox" checked={checked} disabled={out} onChange={() => toggle(v.id)} className="peer sr-only" />
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-forest ${
                      checked ? 'border-leaf bg-leaf text-white' : 'border-forest/30 bg-white'
                    }`}
                  >
                    {checked && <Check className="h-4 w-4" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[15.5px] leading-snug font-bold text-ink">{v.label}</span>
                      {v.badge && <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-forest uppercase">{v.badge}</span>}
                    </span>
                    {v.subtitle && <span className="mt-0.5 block text-[13px] text-ink-muted">{v.subtitle}</span>}
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <span className="font-display text-base font-extrabold text-leaf">{formatPrice(v.price, currency)}</span>
                      {v.compare_at_price && v.compare_at_price > v.price && (
                        <span className="text-xs text-ink-muted line-through">{formatPrice(v.compare_at_price, currency)}</span>
                      )}
                      {out && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-amber-800 uppercase">Rupture de stock</span>
                      )}
                    </span>
                  </span>
                </label>

                {checked && (
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3 pl-9">
                    <div className="inline-flex items-center rounded-full border border-line bg-white">
                      <button type="button" onClick={() => setQty(v.id, Math.max(1, qty - 1))} className="flex h-8 w-8 items-center justify-center" aria-label={`Diminuer la quantité : ${v.label}`}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold" aria-live="polite">{qty}</span>
                      <button type="button" onClick={() => setQty(v.id, Math.min(maxQty(v.units), qty + 1))} className="flex h-8 w-8 items-center justify-center" aria-label={`Augmenter la quantité : ${v.label}`}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-display text-[15px] font-extrabold text-ink">{formatPrice(v.price * qty, currency)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </fieldset>

        <div className="m-3 flex items-start gap-4 rounded-2xl bg-forest p-5 text-white sm:m-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/12">
            <Truck className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-[13px] font-bold tracking-[0.12em] uppercase">
              {shipping === 0 ? landing.delivery_title : `Livraison : ${formatPrice(shipping, currency)}`}
            </span>
            <span className="mt-1 block text-[13px] leading-relaxed text-white/80">{landing.delivery_text}</span>
          </span>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <label htmlFor="do-name" className="label">Nom complet *</label>
            <input id="do-name" name="name" required autoComplete="name" placeholder="Ex. Koffi Kouadio" className="field" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="do-phone" className="label">Téléphone *</label>
            <input id="do-phone" name="phone" type="tel" required autoComplete="tel" placeholder="07 00 00 00 00" className="field" />
          </div>
          <div>
            <label htmlFor="do-address" className="label">Adresse / quartier *</label>
            <input id="do-address" name="address" required autoComplete="street-address" placeholder="Ex. Cocody Riviera 2" className="field" />
          </div>
          <div>
            <label htmlFor="do-city" className="label">Ville</label>
            <input id="do-city" name="city" autoComplete="address-level2" defaultValue="Abidjan" className="field" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="do-notes" className="label">Instructions (facultatif)</label>
            <textarea id="do-notes" name="notes" rows={2} className="field" />
          </div>
        </div>

        <div className="border-t border-line p-5 sm:p-6">
          <dl className="space-y-1.5 text-sm">
            {lines.map((l) => (
              <div key={l.variant.id || 'unit'} className="flex justify-between gap-3 text-ink-muted">
                <dt className="truncate">
                  {l.quantity} × {l.variant.label}
                </dt>
                <dd className="shrink-0">{formatPrice(l.variant.price * l.quantity, currency)}</dd>
              </div>
            ))}
            <div className="flex justify-between text-ink-muted">
              <dt>Livraison</dt>
              <dd>{shipping === 0 ? 'Offerte' : formatPrice(shipping, currency)}</dd>
            </div>
            <div className="flex justify-between pt-1.5 font-display text-lg font-extrabold text-ink">
              <dt>Total</dt>
              <dd>{formatPrice(subtotal + (lines.length ? shipping : 0), currency)}</dd>
            </div>
          </dl>
          <button type="submit" className="btn-primary mt-5 w-full" disabled={submitting || lines.length === 0}>
            {lines.length === 0 ? 'Cochez une variante' : submitting ? 'Envoi…' : 'Confirmer ma commande'}
          </button>
          <p className="mt-3 text-center text-xs text-ink-muted">Nous vous appelons pour confirmer avant l’expédition. Vous payez à la réception.</p>
        </div>
      </form>
    </section>
  );
}
