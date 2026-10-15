'use client';

import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { TABLES } from '@/lib/admin';
import { formatDate, formatPrice } from '@/lib/format';
import type { Order } from '@/lib/types';
import AdminGate, { MigrationNotice } from '../components/AdminGate';
import { PageTitle, useRows } from '../components/ui';

interface Client {
  key: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  orders: number;
  spent: number;
  last: string;
}

/** Clients reconstitués à partir des commandes (identifiés par leur téléphone) */
function ClientsManager() {
  const { rows, loading, missing } = useRows<Order>(TABLES.orders, 'created_at', false);
  const [search, setSearch] = useState('');

  const clients = useMemo(() => {
    const map = new Map<string, Client>();
    for (const o of rows) {
      const key = o.customer_phone.replace(/\D/g, '').slice(-8);
      const c = map.get(key) ?? { key, name: o.customer_name, phone: o.customer_phone, email: o.customer_email, city: o.city, orders: 0, spent: 0, last: o.created_at };
      c.orders += 1;
      if (o.status !== 'cancelled') c.spent += Number(o.total);
      if (o.created_at > c.last) c.last = o.created_at;
      c.email ??= o.customer_email;
      map.set(key, c);
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [rows]);

  const list = clients.filter((c) => !search || [c.name, c.phone, c.email, c.city].some((v) => v?.toLowerCase().includes(search.toLowerCase())));

  return (
    <>
      <PageTitle eyebrow="Ventes" title="Clients" subtitle="Regroupés par numéro de téléphone, classés par montant dépensé." />
      {missing && <MigrationNotice />}
      <div className="pz-card">
        <div className="pz-card-header flex-wrap">
          <div className="flex items-center gap-3">
            <span className="pz-stat-icon"><Users className="h-4 w-4" /></span>
            <h2 className="pz-card-title">{clients.length} client{clients.length > 1 ? 's' : ''}</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, téléphone, ville…" className="w-full border border-gray-300 bg-transparent py-1.5 pr-3 pl-8 text-black" />
          </div>
        </div>
        {loading ? (
          <div className="pz-empty">Chargement…</div>
        ) : list.length === 0 ? (
          <div className="pz-empty">Aucun client pour le moment</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr><th>#</th><th>Client</th><th>Contact</th><th>Ville</th><th className="text-right">Commandes</th><th className="text-right">Dépensé</th><th>Dernière commande</th></tr>
              </thead>
              <tbody>
                {list.map((c, i) => (
                  <tr key={c.key}>
                    <td><span className={`pz-rank ${i === 0 ? 'is-top' : ''}`}>{i + 1}</span></td>
                    <td className="text-[var(--pz-text)]">{c.name}</td>
                    <td>
                      <a href={`tel:${c.phone}`} className="block hover:underline">{c.phone}</a>
                      {c.email && <span className="block text-xs font-normal text-slate-500">{c.email}</span>}
                    </td>
                    <td>{c.city ?? '—'}</td>
                    <td className="text-right">{c.orders}</td>
                    <td className="text-right pz-num whitespace-nowrap">{formatPrice(c.spent)}</td>
                    <td className="whitespace-nowrap text-slate-500">{formatDate(c.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default function ClientsPage() {
  return (
    <AdminGate>
      <ClientsManager />
    </AdminGate>
  );
}
