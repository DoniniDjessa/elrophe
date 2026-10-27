'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Banknote, Check, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/format';
import type { ShopSettings } from '@/lib/types';
import { OrderSummary } from './CartView';
import { useCart, useSite } from './Providers';

const steps = ['Informations', 'Livraison', 'Paiement'] as const;
const cities = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Daloa', 'Korhogo', 'Man', 'Gagnoa', 'Grand-Bassam', 'Divo'];
const communes = ['Abobo', 'Adjamé', 'Anyama', 'Attécoubé', 'Bingerville', 'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët', 'Songon', 'Treichville', 'Yopougon'];

/** Commande en trois étapes, sans création de compte */
export default function CheckoutForm({ shop }: { shop: ShopSettings }) {
  const router = useRouter();
  const { lines, ready, clear } = useCart();
  const { currency } = useSite();
  // Uniquement les moyens de paiement activés dans Pilotage › Personnalisation
  const methods = [
    shop.cash_on_delivery && { id: 'cash_on_delivery', label: 'Paiement à la livraison', hint: 'En espèces ou par Mobile Money, à la réception du colis', Icon: Banknote },
    shop.mobile_money && { id: 'mobile_money', label: 'Mobile Money', hint: 'Orange Money, MTN, Moov, Wave', Icon: Smartphone },
  ].filter(Boolean) as { id: string; label: string; hint: string; Icon: typeof Banknote }[];
  const [method, setMethod] = useState(methods[0]?.id ?? 'cash_on_delivery');
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const fieldsets = useRef<(HTMLFieldSetElement | null)[]>([]);

  if (ready && lines.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <p className="font-serif text-[1.7rem]">Votre panier est vide</p>
        <Link href="/boutique" className="btn btn-forest mt-6">
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  /** Valide les champs de l'étape en cours avant de passer à la suivante */
  const next = () => {
    const current = fieldsets.current[step];
    const invalid = current && Array.from(current.querySelectorAll<HTMLInputElement>('input, select, textarea')).find((el) => !el.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < steps.length - 1) return next();
    const data = new FormData(e.currentTarget);
    const phone = String(data.get('phone') ?? '');
    const commune = String(data.get('commune') ?? '').trim();
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: data.get('name'),
          customer_phone: phone,
          customer_email: data.get('email'),
          address: [commune, data.get('address')].filter(Boolean).join(' — '),
          city: [data.get('city'), data.get('country')].filter(Boolean).join(', '),
          notes: data.get('notes'),
          payment_method: method,
          items: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity, offer_id: l.offer_id })),
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
      <div>
        {/* Étapes */}
        <ol className="mb-8 grid grid-cols-3" aria-label="Étapes de la commande">
          {steps.map((label, i) => (
            <li key={label} className="relative flex flex-col items-center gap-2 text-center">
              {i > 0 && <span aria-hidden="true" className={`absolute top-5 right-1/2 -z-0 h-px w-full ${i <= step ? 'bg-forest' : 'bg-line'}`} />}
              <span
                aria-current={i === step ? 'step' : undefined}
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-[15px] font-medium ${
                  i < step ? 'border-forest bg-forest text-white' : i === step ? 'border-forest bg-white text-forest' : 'border-line-strong bg-ivory text-muted'
                }`}
                style={i > step ? { borderColor: 'var(--line-strong)' } : undefined}
              >
                {i < step ? <Check className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" /> : i + 1}
              </span>
              <span className={`text-[13px] ${i === step ? 'font-medium text-anthracite' : 'text-muted'}`}>{label}</span>
            </li>
          ))}
        </ol>

        <fieldset ref={(el) => { fieldsets.current[0] = el; }} hidden={step !== 0} className="card p-5 sm:p-6">
          <legend className="sr-only">Informations personnelles</legend>
          <h2 className="font-serif text-[1.6rem]">1. Informations personnelles</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <label htmlFor="name" className="label">Nom complet *</label>
              <input id="name" name="name" required autoComplete="name" placeholder="Votre nom" className="field" />
            </div>
            <div>
              <label htmlFor="phone" className="label">Téléphone *</label>
              <input id="phone" name="phone" type="tel" required minLength={8} autoComplete="tel" placeholder="Ex. 07 00 00 00 00" className="field" />
            </div>
            <div>
              <label htmlFor="email" className="label">E-mail (facultatif)</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="Votre e-mail" className="field" />
            </div>
          </div>
          <p className="mt-4 text-[14px] text-muted">Aucun compte n’est nécessaire : nous vous appelons pour confirmer la commande.</p>
        </fieldset>

        <fieldset ref={(el) => { fieldsets.current[1] = el; }} hidden={step !== 1} className="card p-5 sm:p-6">
          <legend className="sr-only">Adresse de livraison</legend>
          <h2 className="font-serif text-[1.6rem]">2. Adresse de livraison</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="country" className="label">Pays *</label>
              <input id="country" name="country" required autoComplete="country-name" defaultValue="Côte d’Ivoire" className="field" />
            </div>
            <div>
              <label htmlFor="city" className="label">Ville *</label>
              <input id="city" name="city" required autoComplete="address-level2" list="cities" placeholder="Ex. Abidjan" className="field" />
              <datalist id="cities">{cities.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label htmlFor="commune" className="label">Commune</label>
              <input id="commune" name="commune" autoComplete="address-level3" list="communes" placeholder="Ex. Cocody" className="field" />
              <datalist id="communes">{communes.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label htmlFor="address" className="label">Adresse détaillée *</label>
              <input id="address" name="address" required autoComplete="street-address" placeholder="Ex. Angré, derrière la pharmacie" className="field" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="label">Instructions (facultatif)</label>
              <textarea id="notes" name="notes" rows={3} placeholder="Ex. repère, code de porte, créneau préféré…" className="field" />
            </div>
          </div>
          {shop.delivery_info && <p className="mt-4 text-[14px] text-muted">{shop.delivery_info}</p>}
        </fieldset>

        <fieldset ref={(el) => { fieldsets.current[2] = el; }} hidden={step !== 2} className="card p-5 sm:p-6">
          <legend className="sr-only">Paiement</legend>
          <h2 className="font-serif text-[1.6rem]">3. Paiement</h2>
          <div className="mt-5 grid gap-3">
            {methods.map(({ id, label, hint, Icon }) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-4 rounded-md border p-4 transition-colors ${method === id ? 'border-forest bg-white' : 'bg-white/60'}`}
                style={method === id ? undefined : { borderColor: 'var(--line-strong)' }}
              >
                <input type="radio" name="payment" value={id} checked={method === id} onChange={() => setMethod(id)} className="h-4 w-4 accent-[var(--forest)]" />
                <Icon className="h-5 w-5 text-forest" strokeWidth={1.5} aria-hidden="true" />
                <span className="leading-tight">
                  <span className="block text-[15px] font-medium">{label}</span>
                  <span className="mt-0.5 block text-[13px] text-muted">{hint}</span>
                </span>
              </label>
            ))}
          </div>
          {method === 'mobile_money' && shop.mobile_money_instructions && <p className="mt-4 text-[14px] text-muted">{shop.mobile_money_instructions}</p>}
        </fieldset>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <button type="button" className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour
            </button>
          ) : (
            <Link href="/panier" className="btn btn-outline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Panier
            </Link>
          )}
          {step < steps.length - 1 ? (
            <button type="button" className="btn btn-forest sm:min-w-56" onClick={next}>
              Continuer
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button type="submit" className="btn btn-forest sm:min-w-56" disabled={submitting || !ready}>
              {submitting ? 'Envoi…' : 'Confirmer la commande'}
            </button>
          )}
        </div>
      </div>

      <OrderSummary shop={shop}>
        <ul className="mt-5 space-y-2 border-t border-line pt-4 text-[14px] text-muted">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-3">
              <span className="min-w-0">
                {l.quantity} × {l.name}
                {l.variant && <span className="block text-[13px]">{l.variant}</span>}
              </span>
              <span className="shrink-0">{formatPrice(l.price * l.quantity, currency)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] text-muted">Nous vous appelons pour confirmer avant l’expédition.</p>
        <p className="mt-2 text-[13px] text-muted">
          En confirmant votre commande, vous acceptez nos{' '}
          <Link href="/conditions-generales-de-vente" className="underline hover:text-forest">
            conditions générales de vente
          </Link>
          .
        </p>
      </OrderSummary>
    </form>
  );
}
