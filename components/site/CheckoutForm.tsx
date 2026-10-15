'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Banknote, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import type { ShopSettings } from '@/lib/types';
import { OrderSummary } from './CartView';
import { useCart } from './Providers';

export default function CheckoutForm({ shop }: { shop: ShopSettings }) {
  const router = useRouter();
  const { lines, ready, clear } = useCart();
  const methods = [
    shop.cash_on_delivery && { id: 'cash_on_delivery', label: 'Paiement à la livraison', hint: 'Espèces ou Mobile Money à réception', Icon: Banknote },
    shop.mobile_money && { id: 'mobile_money', label: 'Mobile Money', hint: 'Orange, MTN, Moov, Wave', Icon: Smartphone },
  ].filter(Boolean) as { id: string; label: string; hint: string; Icon: typeof Banknote }[];
  const [method, setMethod] = useState(methods[0]?.id ?? 'cash_on_delivery');
  const [submitting, setSubmitting] = useState(false);

  if (ready && lines.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <p className="heading-lg text-xl">Votre panier est vide</p>
        <Link href="/boutique" className="btn-primary mt-6">
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.get('name'),
          customer_phone: form.get('phone'),
          customer_email: form.get('email'),
          address: form.get('address'),
          city: form.get('city'),
          notes: form.get('notes'),
          payment_method: method,
          items: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'La commande n’a pas pu être enregistrée.');
      clear();
      router.push(`/commande/confirmation?n=${encodeURIComponent(json.order_number)}&m=${method}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur inattendue');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <fieldset className="card p-6">
          <legend className="sr-only">Coordonnées</legend>
          <h2 className="heading-lg text-xl">Vos coordonnées</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="label">Nom complet *</label>
              <input id="name" name="name" required autoComplete="name" className="field" />
            </div>
            <div>
              <label htmlFor="phone" className="label">Téléphone *</label>
              <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="07 00 00 00 00" className="field" />
            </div>
            <div>
              <label htmlFor="email" className="label">E-mail</label>
              <input id="email" name="email" type="email" autoComplete="email" className="field" />
            </div>
          </div>
        </fieldset>

        <fieldset className="card p-6">
          <legend className="sr-only">Livraison</legend>
          <h2 className="heading-lg text-xl">Livraison</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="address" className="label">Adresse / quartier *</label>
              <input id="address" name="address" required autoComplete="street-address" placeholder="Ex. Cocody Riviera 2, près de la pharmacie" className="field" />
            </div>
            <div>
              <label htmlFor="city" className="label">Ville</label>
              <input id="city" name="city" autoComplete="address-level2" defaultValue="Abidjan" className="field" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="label">Instructions (facultatif)</label>
              <textarea id="notes" name="notes" rows={3} className="field" />
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-muted">{shop.delivery_info}</p>
        </fieldset>

        <fieldset className="card p-6">
          <legend className="heading-lg float-left mb-5 w-full text-xl">Paiement</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {methods.map(({ id, label, hint, Icon }) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${method === id ? 'border-forest bg-cream' : 'border-line hover:bg-cream/60'}`}
              >
                <input type="radio" name="payment" value={id} checked={method === id} onChange={() => setMethod(id)} className="accent-[var(--forest)]" />
                <Icon className="h-5 w-5 text-forest" strokeWidth={1.6} aria-hidden="true" />
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-ink-muted">{hint}</span>
                </span>
              </label>
            ))}
          </div>
          {method === 'mobile_money' && shop.mobile_money_instructions && <p className="mt-4 text-sm text-ink-muted">{shop.mobile_money_instructions}</p>}
        </fieldset>
      </div>

      <OrderSummary shop={shop}>
        <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-ink-muted">
          {lines.map((l) => (
            <li key={l.product_id} className="flex justify-between gap-3">
              <span className="truncate">
                {l.quantity} × {l.name}
              </span>
            </li>
          ))}
        </ul>
        <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting || !ready}>
          {submitting ? 'Envoi…' : 'Confirmer la commande'}
        </button>
        <p className="mt-3 text-center text-xs text-ink-muted">Nous vous appelons pour confirmer avant l’expédition.</p>
      </OrderSummary>
    </form>
  );
}
