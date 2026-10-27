'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Check, Headset, Leaf, Lock, Minus, Plus, ShieldCheck, Star, Truck } from 'lucide-react';
import { toast } from 'sonner';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import { landingOffers, offerSoldOut } from '@/lib/landing';
import type { Product, ProductLanding, ShopSettings } from '@/lib/types';
import { useSite } from '../Providers';

const cities = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Daloa', 'Korhogo', 'Man', 'Gagnoa', 'Grand-Bassam', 'Divo'];
const communes = ['Abobo', 'Adjamé', 'Anyama', 'Attécoubé', 'Bingerville', 'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët', 'Songon', 'Treichville', 'Yopougon'];

/** Titre de section : serif + filet champagne */
export function SectionTitle({ children, icon, id }: { children: ReactNode; icon?: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="flex items-center gap-3 font-serif text-[1.7rem] leading-tight text-anthracite sm:text-[1.9rem]">
      {icon}
      {children}
      <span aria-hidden="true" className="h-px w-12 shrink-0 bg-champagne" />
    </h2>
  );
}

/** Formulaire « Commandez maintenant » : une offre, la quantité, les informations de livraison, paiement à la livraison */
export default function DirectOrder({ product, landing, shop }: { product: Product; landing: ProductLanding; shop: ShopSettings }) {
  const router = useRouter();
  const { currency } = useSite();
  const offers = landingOffers(product);
  const [offerId, setOfferId] = useState(() => (offers.find((o) => !offerSoldOut(product, o)) ?? offers[0]).id);
  const [qty, setQty] = useState(1);
  const [city, setCity] = useState('Abidjan');
  const [submitting, setSubmitting] = useState(false);

  const offer = offers.find((o) => o.id === offerId) ?? offers[0];
  const soldOut = offerSoldOut(product, offer);
  const maxQty = product.stock === null ? 99 : Math.max(1, Math.floor(product.stock / offer.units));
  const subtotal = offer.price * qty;
  // Même calcul que le serveur (elrophe_place_order)
  const shipping = landing.free_shipping && offer.id ? 0 : shop.free_shipping_threshold && subtotal >= shop.free_shipping_threshold ? 0 : shop.shipping_fee;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (soldOut) return;
    const form = new FormData(e.currentTarget);
    const town = city === 'autre' ? String(form.get('other_city') ?? '') : city;
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.get('name'),
          customer_phone: form.get('phone'),
          address: [form.get('commune'), form.get('address')].filter(Boolean).join(' — '),
          city: town,
          notes: form.get('notes'),
          payment_method: 'cash_on_delivery',
          items: [{ product_id: product.id, quantity: qty, offer_id: offer.id }],
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
    <section id="commander" aria-labelledby="direct-order-title" className="scroll-mt-24">
      <div className="text-center">
        <h2 id="direct-order-title" className="font-serif text-[clamp(2rem,6vw,2.6rem)] leading-tight text-forest">
          {landing.order_title}
        </h2>
        {landing.order_subtitle && <p className="mt-1 text-[16px] text-muted">{landing.order_subtitle}</p>}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-10">
        {/* Offres */}
        <fieldset className="space-y-4">
          <legend className="sr-only">Choisissez votre offre</legend>
          {offers.map((o) => {
            const selected = o.id === offer.id;
            const out = offerSoldOut(product, o);
            return (
              <label
                key={o.id || 'unit'}
                className={`relative block rounded-xl border bg-white p-5 transition-colors ${out ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                  selected ? 'border-2 border-forest' : 'border-line hover:border-forest/40'
                }`}
              >
                <input
                  type="radio"
                  name="offer"
                  value={o.id}
                  checked={selected}
                  disabled={out}
                  onChange={() => {
                    setOfferId(o.id);
                    setQty(1);
                  }}
                  className="peer sr-only"
                />
                {selected ? (
                  <span className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white">
                    <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
                  </span>
                ) : (
                  <span aria-hidden="true" className="absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-line-strong peer-focus-visible:ring-2 peer-focus-visible:ring-forest" style={{ borderColor: 'var(--line-strong)' }} />
                )}
                <span className={`flex flex-wrap items-start justify-between gap-2 ${selected ? 'pl-5' : 'pl-9'}`}>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-semibold text-anthracite">{o.label}</span>
                    {o.subtitle && <span className="mt-0.5 block text-[15px] text-muted">{o.subtitle}</span>}
                    {o.badge && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-champagne/35 px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] text-forest uppercase">
                        <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                        {o.badge}
                      </span>
                    )}
                    <span className="mt-2 block font-serif text-[1.65rem] leading-none font-semibold text-anthracite">
                      {formatPrice(o.price, currency)}
                      {o.compare_at_price && o.compare_at_price > o.price && (
                        <span className="ml-2 font-sans text-[14px] font-normal text-muted line-through">{formatPrice(o.compare_at_price, currency)}</span>
                      )}
                    </span>
                  </span>
                  {out && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbe9e5] px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-[#a2402b] uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c4462d]" aria-hidden="true" />
                      Rupture de stock
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </fieldset>

        {/* Détails de la commande */}
        <div className="space-y-4">
          <SectionTitle>Détails de la commande</SectionTitle>
          <div className="rounded-xl border border-line bg-white p-4 sm:p-5">
            <p className="flex items-center gap-2 text-[16px] font-semibold">
              <Leaf className="h-[18px] w-[18px] fill-forest text-forest" aria-hidden="true" />
              Produit sélectionné
            </p>
            <div className="mt-4 flex items-center gap-4 rounded-lg bg-ivory p-4">
              <span className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-md bg-white sm:block">
                <SmartImage src={product.image_url} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold">{product.name}</p>
                <p className="text-[14px] text-muted">{offer.label}</p>
                <div className="mt-3 inline-flex items-center rounded-full border bg-white" style={{ borderColor: 'var(--line-strong)' }}>
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center" aria-label="Diminuer la quantité">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-[16px] font-medium" aria-live="polite" aria-label={`Quantité : ${qty}`}>
                    {qty}
                  </span>
                  <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="flex h-10 w-10 items-center justify-center" aria-label="Augmenter la quantité">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="shrink-0 self-end text-right">
                <span className="block text-[13px] text-muted">Sous-total</span>
                <span className="font-serif text-[1.5rem] leading-none font-semibold">{formatPrice(subtotal, currency)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-[color-mix(in_srgb,var(--sage)_16%,var(--ivory))] p-4 sm:p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-white">
              <Truck className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[14px] font-semibold tracking-[0.06em] text-anthracite uppercase">
                {shipping === 0 ? landing.delivery_title : `Livraison : ${formatPrice(shipping, currency)}`}
              </span>
              <span className="mt-0.5 block text-[14px] leading-snug text-muted">{landing.delivery_text}</span>
            </span>
          </div>
        </div>

        {/* Informations de livraison */}
        <div className="space-y-4">
          <SectionTitle icon={<Truck className="h-6 w-6 shrink-0 text-forest" strokeWidth={1.5} aria-hidden="true" />}>Informations de livraison</SectionTitle>
          <div className="grid gap-4">
            <div>
              <label htmlFor="do-name" className="label">Nom complet *</label>
              <input id="do-name" name="name" required autoComplete="name" placeholder="Ex. Koffi Kouadio" className="field" />
            </div>
            <div>
              <label htmlFor="do-phone" className="label">Téléphone *</label>
              <input id="do-phone" name="phone" type="tel" required minLength={8} autoComplete="tel" placeholder="Ex. 07 00 00 00 00" className="field" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="do-city" className="label">Ville *</label>
                <select id="do-city" value={city} onChange={(e) => setCity(e.target.value)} required className="field">
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="autre">Autre ville…</option>
                </select>
              </div>
              {city === 'Abidjan' ? (
                <div>
                  <label htmlFor="do-commune" className="label">Commune</label>
                  <select id="do-commune" name="commune" defaultValue="" className="field">
                    <option value="">Sélectionner votre commune</option>
                    {communes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              ) : city === 'autre' ? (
                <div>
                  <label htmlFor="do-other-city" className="label">Votre ville *</label>
                  <input id="do-other-city" name="other_city" required autoComplete="address-level2" className="field" />
                </div>
              ) : null}
            </div>
            <div>
              <label htmlFor="do-address" className="label">Adresse détaillée *</label>
              <input id="do-address" name="address" required autoComplete="street-address" placeholder="Ex. Angré, derrière la pharmacie" className="field" />
            </div>
            <div>
              <label htmlFor="do-notes" className="label">Instructions (facultatif)</label>
              <input id="do-notes" name="notes" placeholder="Ex. repère, code de porte…" className="field" />
            </div>
          </div>
        </div>

        <div>
          <button type="submit" className="btn btn-forest min-h-14! w-full text-[16px]!" disabled={submitting || soldOut}>
            <Lock className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
            {soldOut ? 'Offre en rupture de stock' : submitting ? 'Envoi…' : `Commander maintenant — ${formatPrice(subtotal + shipping, currency)}`}
            {!soldOut && !submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
          <ul className="mt-6 grid grid-cols-3 divide-x divide-line text-center text-[13px] leading-snug text-muted">
            {[
              { Icon: ShieldCheck, label: 'Paiement sécurisé à la livraison' },
              { Icon: Headset, label: 'Service client à votre écoute' },
              { Icon: Leaf, label: 'Vos informations sont confidentielles' },
            ].map(({ Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-2 px-2">
                <Icon className="h-6 w-6 text-champagne" strokeWidth={1.4} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </form>
    </section>
  );
}
