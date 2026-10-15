'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Banknote, DatabaseZap, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import { db, isMissingTable, refreshSite, TABLES } from '@/lib/admin';
import { formatDate, formatPrice } from '@/lib/format';
import type { Order } from '@/lib/types';
import { seedCategories, seedIngredients, seedProducts, seedTestimonials } from '@/data/catalog';
import { defaultSettings } from '@/data/site';
import AdminGate, { MigrationNotice } from './components/AdminGate';
import { PageTitle } from './components/ui';
import { StatusBadge } from './orders/status';

type Period = 'week' | 'month' | 'year';
const periods: { id: Period; label: string; days: number }[] = [
  { id: 'week', label: '7 jours', days: 7 },
  { id: 'month', label: '30 jours', days: 30 },
  { id: 'year', label: '12 mois', days: 365 },
];

// Vert de marque qui garde ≥ 3:1 sur la carte blanche
const CHART_BAR = '#336a2b';

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');
  const [seeding, setSeeding] = useState(false);
  const [now, setNow] = useState(0);

  const load = useCallback(
    () =>
      Promise.all([
        db().from(TABLES.orders).select('*').order('created_at', { ascending: false }).limit(2000),
        db().from(TABLES.products).select('id', { count: 'exact', head: true }),
      ]).then(([o, p]) => {
        if (o.error && isMissingTable(o.error.message)) setMissing(true);
        setOrders(((o.data ?? []) as Order[]).map((x) => ({ ...x, total: Number(x.total) })));
        setProductCount(p.count ?? 0);
        setNow(Date.now());
        setLoading(false);
      }),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const days = periods.find((p) => p.id === period)!.days;
    const since = now - days * 86400000;
    const valid = orders.filter((o) => o.status !== 'cancelled');
    const inPeriod = valid.filter((o) => new Date(o.created_at).getTime() >= since);
    const prevPeriod = valid.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t < since && t >= since - days * 86400000;
    });
    const revenue = inPeriod.reduce((s, o) => s + o.total, 0);
    const prevRevenue = prevPeriod.reduce((s, o) => s + o.total, 0);
    const customers = new Set(inPeriod.map((o) => o.customer_phone.replace(/\D/g, '').slice(-8))).size;

    // Série du graphique : par jour (7/30 j) ou par mois (12 mois)
    const buckets = new Map<string, number>();
    const byMonth = period === 'year';
    const steps = byMonth ? 12 : days;
    for (let i = steps - 1; i >= 0; i--) {
      const d = new Date(now);
      if (byMonth) d.setMonth(d.getMonth() - i, 1);
      else d.setDate(d.getDate() - i);
      buckets.set(byMonth ? d.toLocaleDateString('fr-FR', { month: 'short' }) : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), 0);
    }
    for (const o of inPeriod) {
      const d = new Date(o.created_at);
      const key = byMonth ? d.toLocaleDateString('fr-FR', { month: 'short' }) : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + o.total);
    }

    const top = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of inPeriod) {
      for (const item of o.items) {
        const row = top.get(item.product_id) ?? { name: item.name, qty: 0, revenue: 0 };
        row.qty += item.quantity;
        row.revenue += Number(item.price) * item.quantity;
        top.set(item.product_id, row);
      }
    }

    return {
      revenue,
      change: prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null,
      count: inPeriod.length,
      average: inPeriod.length ? revenue / inPeriod.length : 0,
      customers,
      pending: orders.filter((o) => o.status === 'pending').length,
      chart: [...buckets].map(([label, value]) => ({ label, value })),
      top: [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    };
  }, [orders, period, now]);

  const seed = async () => {
    if (!confirm('Importer le catalogue de démonstration (catégories, produits, ingrédients, avis et textes du site) ?')) return;
    setSeeding(true);
    try {
      // Catégories d'abord : les produits les référencent par slug
      const cats = await db().from(TABLES.categories).upsert(seedCategories, { onConflict: 'slug', ignoreDuplicates: true });
      if (cats.error) throw new Error(cats.error.message);
      const results = await Promise.all([
        db().from(TABLES.products).upsert(seedProducts, { onConflict: 'slug', ignoreDuplicates: true }),
        db().from(TABLES.testimonials).insert(seedTestimonials),
        db().from(TABLES.ingredients).insert(seedIngredients),
        db()
          .from(TABLES.settings)
          .upsert(Object.entries(defaultSettings).map(([key, value]) => ({ key, value })), { onConflict: 'key', ignoreDuplicates: true }),
      ]);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw new Error(failed.error.message);
      await refreshSite();
      toast.success('Catalogue importé');
      load();
    } catch (err) {
      toast.error(`Import impossible : ${err instanceof Error ? err.message : err}`);
    } finally {
      setSeeding(false);
    }
  };

  const cards = [
    { label: "Chiffre d'affaires", value: formatPrice(stats.revenue), icon: Banknote, change: stats.change },
    { label: 'Commandes', value: String(stats.count), icon: ShoppingCart },
    { label: 'Panier moyen', value: formatPrice(stats.average), icon: TrendingUp },
    { label: 'Clients', value: String(stats.customers), icon: Users },
  ];

  return (
    <>
      <PageTitle
        eyebrow="Pilotage"
        title="Tableau de bord"
        subtitle="Commandes non annulées sur la période choisie."
        actions={
          <div className="pz-seg" role="group" aria-label="Période">
            {periods.map((p) => (
              <button key={p.id} aria-pressed={period === p.id} onClick={() => setPeriod(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {missing && <MigrationNotice />}

      {!missing && productCount === 0 && (
        <div className="pz-card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="pz-stat-icon"><DatabaseZap className="h-4 w-4" /></span>
            <div>
              <p className="pz-card-title">Catalogue vide</p>
              <p className="text-sm text-slate-500">Importez les catégories, produits, ingrédients, avis et textes de démonstration pour démarrer.</p>
            </div>
          </div>
          <button onClick={seed} disabled={seeding} className="pz-btn pz-btn-primary">
            {seeding ? 'Import…' : 'Importer le catalogue'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, change }) => (
          <div key={label} className="pz-card p-4">
            <div className="flex items-center justify-between">
              <p className="pz-eyebrow">{label}</p>
              <span className="pz-stat-icon h-8! w-8!"><Icon className="h-4 w-4" /></span>
            </div>
            <p className="pz-num mt-2 text-xl sm:text-2xl">{loading ? '—' : value}</p>
            {change != null && (
              <span className={`pz-badge mt-2 ${change >= 0 ? 'pz-badge-up' : 'pz-badge-down'}`}>
                {change >= 0 ? '+' : ''}
                {change.toFixed(0)} % vs période préc.
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="pz-card lg:col-span-2">
          <div className="pz-card-header">
            <h2 className="pz-card-title">Chiffre d&apos;affaires</h2>
          </div>
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--pz-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--pz-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--pz-muted)' }} tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)} k` : String(v))} />
                <Tooltip cursor={{ fill: 'var(--pz-hover)' }} formatter={(v) => [formatPrice(Number(v)), 'CA']} contentStyle={{ borderRadius: 6, border: '1px solid var(--pz-border)', fontSize: 12 }} />
                <Bar dataKey="value" fill={CHART_BAR} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pz-card">
          <div className="pz-card-header">
            <h2 className="pz-card-title">Produits les plus vendus</h2>
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          {stats.top.length === 0 ? (
            <div className="pz-empty">Aucune vente sur la période</div>
          ) : (
            <ul className="space-y-4 p-4">
              {stats.top.map((p, i) => (
                <li key={p.name}>
                  <div className="flex items-center gap-3">
                    <span className={`pz-rank ${i === 0 ? 'is-top' : ''}`}>{i + 1}</span>
                    <span className="flex-1 truncate text-sm font-bold text-[var(--pz-text)]">{p.name}</span>
                    <span className="pz-num text-sm">{formatPrice(p.revenue)}</span>
                  </div>
                  <div className="pz-bar mt-2 ml-9">
                    <span style={{ width: `${(p.revenue / stats.top[0].revenue) * 100}%` }} />
                  </div>
                  <p className="mt-1 ml-9 text-xs text-slate-500">{p.qty} vendu{p.qty > 1 ? 's' : ''}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="pz-card mt-6">
        <div className="pz-card-header">
          <h2 className="pz-card-title">
            Dernières commandes {stats.pending > 0 && <span className="pz-badge pz-badge-warn ml-2">{stats.pending} en attente</span>}
          </h2>
          <Link href="/pilotage/orders" className="pz-btn pz-btn-ghost">Tout voir</Link>
        </div>
        {orders.length === 0 ? (
          <div className="pz-empty">{loading ? 'Chargement…' : 'Aucune commande pour le moment'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs">{o.order_number}</td>
                    <td>{o.customer_name}</td>
                    <td className="whitespace-nowrap text-slate-500">{formatDate(o.created_at, true)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="text-right pz-num">{formatPrice(o.total)}</td>
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

export default function PilotagePage() {
  return (
    <AdminGate>
      <Dashboard />
    </AdminGate>
  );
}
