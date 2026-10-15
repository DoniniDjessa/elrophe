'use client';

import { useMemo, useState } from 'react';
import { MessageCircle, Phone, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { TABLES, updateRow } from '@/lib/admin';
import { formatDate, formatPrice } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';
import AdminGate, { MigrationNotice } from '../components/AdminGate';
import { Modal, PageTitle, useRows } from '../components/ui';
import { ORDER_STATUSES, PAYMENT_LABELS, StatusBadge } from './status';

function OrderDetail({ order, onClose, onSaved }: { order: Order; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState(order.admin_note ?? '');
  const [saving, setSaving] = useState(false);
  const wa = order.customer_phone.replace(/\D/g, '');

  const save = async () => {
    setSaving(true);
    const { error } = await updateRow<Order>(TABLES.orders, order.id, { status, admin_note: note || null });
    setSaving(false);
    if (error) return toast.error(error);
    toast.success('Commande mise à jour');
    onSaved();
    onClose();
  };

  return (
    <Modal
      title={`Commande ${order.order_number}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="pz-btn pz-btn-outline" onClick={onClose}>Fermer</button>
          <button className="pz-btn pz-btn-primary" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1 text-sm">
          <p className="pz-eyebrow mb-2">Client</p>
          <p className="font-extrabold text-[var(--pz-text)]">{order.customer_name}</p>
          <p>{order.customer_phone}</p>
          {order.customer_email && <p>{order.customer_email}</p>}
          <p>{order.address}{order.city ? `, ${order.city}` : ''}</p>
          {order.notes && <p className="mt-2 rounded-md bg-amber-50 p-2 text-amber-900">« {order.notes} »</p>}
          <div className="flex gap-2 pt-3">
            <a className="pz-btn pz-btn-outline" href={`tel:${order.customer_phone}`}><Phone className="h-3.5 w-3.5" />Appeler</a>
            <a className="pz-btn pz-btn-outline" href={`https://wa.me/${wa.length <= 10 ? `225${wa}` : wa}?text=${encodeURIComponent(`Bonjour ${order.customer_name}, ELROPHE concernant votre commande ${order.order_number}.`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block" htmlFor="status">Statut</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="w-full border border-gray-300 bg-transparent px-3 py-2 text-black">
              {ORDER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block" htmlFor="note">Note interne</label>
            <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-gray-300 bg-transparent px-3 py-2 text-black" />
          </div>
          <p className="text-xs text-slate-500">Paiement : {PAYMENT_LABELS[order.payment_method] ?? order.payment_method} · {formatDate(order.created_at, true)}</p>
        </div>
      </div>

      <table className="mt-6 w-full text-left">
        <thead>
          <tr><th>Produit</th><th className="text-right">Qté</th><th className="text-right">Prix</th><th className="text-right">Total</th></tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.product_id}>
              <td>{item.name}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{formatPrice(Number(item.price))}</td>
              <td className="text-right pz-num">{formatPrice(Number(item.price) * item.quantity)}</td>
            </tr>
          ))}
          <tr><td colSpan={3} className="text-right text-slate-500">Livraison</td><td className="text-right">{formatPrice(Number(order.shipping))}</td></tr>
          <tr><td colSpan={3} className="text-right font-extrabold">Total</td><td className="text-right pz-num">{formatPrice(Number(order.total))}</td></tr>
        </tbody>
      </table>
    </Modal>
  );
}

function OrdersManager() {
  const { rows, loading, missing, reload } = useRows<Order>(TABLES.orders, 'created_at', false);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const counts = useMemo(() => Object.fromEntries(ORDER_STATUSES.map((s) => [s.id, rows.filter((o) => o.status === s.id).length])), [rows]);
  const list = rows.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return [o.order_number, o.customer_name, o.customer_phone, o.city].some((v) => v?.toLowerCase().includes(q));
  });

  const quickStatus = async (order: Order, status: OrderStatus) => {
    const { error } = await updateRow<Order>(TABLES.orders, order.id, { status });
    if (error) toast.error(error);
    else reload();
  };

  return (
    <>
      <PageTitle
        eyebrow="Ventes"
        title="Commandes"
        subtitle="Confirmez chaque commande par téléphone avant l’expédition."
        actions={<button className="pz-btn pz-btn-outline" onClick={reload}><RefreshCw className="h-3.5 w-3.5" />Actualiser</button>}
      />
      {missing && <MigrationNotice />}

      <div className="pz-card">
        <div className="pz-card-header flex-wrap">
          <div className="pz-seg">
            <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Toutes ({rows.length})</button>
            {ORDER_STATUSES.map((s) => (
              <button key={s.id} aria-pressed={filter === s.id} onClick={() => setFilter(s.id)}>{s.label} ({counts[s.id] ?? 0})</button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="N°, client, téléphone…" className="w-full border border-gray-300 bg-transparent py-1.5 pr-3 pl-8 text-black" />
          </div>
        </div>

        {loading ? (
          <div className="pz-empty">Chargement…</div>
        ) : list.length === 0 ? (
          <div className="pz-empty">Aucune commande</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr><th>N°</th><th>Date</th><th>Client</th><th>Articles</th><th>Paiement</th><th>Statut</th><th className="text-right">Total</th></tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id} className="cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="font-mono text-xs">{o.order_number}</td>
                    <td className="whitespace-nowrap text-slate-500">{formatDate(o.created_at, true)}</td>
                    <td>
                      <span className="block text-[var(--pz-text)]">{o.customer_name}</span>
                      <span className="block text-xs text-slate-500">{o.customer_phone}{o.city ? ` · ${o.city}` : ''}</span>
                    </td>
                    <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td className="whitespace-nowrap">{PAYMENT_LABELS[o.payment_method] ?? o.payment_method}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        aria-label="Changer le statut"
                        value={o.status}
                        onChange={(e) => quickStatus(o, e.target.value as OrderStatus)}
                        className="border border-gray-300 bg-transparent px-2 py-1 text-xs text-black"
                      >
                        {ORDER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                      <span className="sr-only"><StatusBadge status={o.status} /></span>
                    </td>
                    <td className="text-right pz-num whitespace-nowrap">{formatPrice(Number(o.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} onSaved={reload} />}
    </>
  );
}

export default function OrdersPage() {
  return (
    <AdminGate>
      <OrdersManager />
    </AdminGate>
  );
}
