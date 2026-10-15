'use client';

import { useState, type FormEvent } from 'react';
import { Check, PackageSearch } from 'lucide-react';
import { useSite } from '@/components/site/Providers';
import { formatDate, formatPrice } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';

type TrackedOrder = Pick<Order, 'order_number' | 'status' | 'items' | 'subtotal' | 'shipping' | 'total' | 'created_at' | 'payment_method'>;

const steps: { id: OrderStatus; label: string }[] = [
  { id: 'pending', label: 'Reçue' },
  { id: 'confirmed', label: 'Confirmée' },
  { id: 'shipped', label: 'En livraison' },
  { id: 'delivered', label: 'Livrée' },
];

export default function OrderTracker() {
  const { currency } = useSite();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: form.get('number'), phone: form.get('phone') }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOrder(json.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Commande introuvable');
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = order ? steps.findIndex((s) => s.id === order.status) : -1;

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="card h-fit p-6">
        <PackageSearch className="h-8 w-8 text-forest" strokeWidth={1.4} aria-hidden="true" />
        <h2 className="heading-lg mt-4 text-xl">Suivre ma commande</h2>
        <p className="mt-2 text-sm text-ink-muted">Saisissez le numéro reçu après votre commande et votre téléphone.</p>
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="number" className="label">Numéro de commande</label>
            <input id="number" name="number" required placeholder="ELR-251015-XXXXX" className="field uppercase" />
          </div>
          <div>
            <label htmlFor="track-phone" className="label">Téléphone</label>
            <input id="track-phone" name="phone" type="tel" required autoComplete="tel" className="field" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? 'Recherche…' : 'Rechercher'}
        </button>
        <p role="alert" className="mt-3 min-h-5 text-sm text-[#9b2c1d]">{error}</p>
      </form>

      {order && (
        <section className="card p-6" aria-label={`Commande ${order.order_number}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="heading-lg text-xl">{order.order_number}</h2>
            <p className="text-sm text-ink-muted">Passée le {formatDate(order.created_at, true)}</p>
          </div>

          {order.status === 'cancelled' ? (
            <p className="mt-6 rounded-2xl bg-[#f6e3dc] px-4 py-3 text-sm font-medium text-[#8a2a17]">Cette commande a été annulée.</p>
          ) : (
            <ol className="mt-8 grid grid-cols-4 gap-2">
              {steps.map((s, i) => {
                const done = i <= currentIndex;
                return (
                  <li key={s.id} className="flex flex-col items-center gap-2 text-center">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full border ${done ? 'border-forest bg-forest text-white' : 'border-line text-ink-muted'}`}>
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className={`text-xs ${done ? 'font-semibold text-ink' : 'text-ink-muted'}`}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          <ul className="mt-8 divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li key={item.product_id} className="flex justify-between gap-4 py-3 text-sm">
                <span>{item.quantity} × {item.name}</span>
                <span className="font-semibold">{formatPrice(item.price * item.quantity, currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Livraison</dt><dd>{order.shipping === 0 ? 'Offerte' : formatPrice(order.shipping, currency)}</dd></div>
            <div className="flex justify-between text-base"><dt className="font-bold">Total</dt><dd className="font-display font-extrabold">{formatPrice(order.total, currency)}</dd></div>
          </dl>
        </section>
      )}
    </div>
  );
}
