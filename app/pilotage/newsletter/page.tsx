'use client';

import { Download, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteRow, TABLES } from '@/lib/admin';
import { formatDate } from '@/lib/format';
import AdminGate, { MigrationNotice } from '../components/AdminGate';
import { PageTitle, useRows } from '../components/ui';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

function NewsletterManager() {
  const { rows, loading, missing, reload } = useRows<Subscriber>(TABLES.newsletter, 'created_at', false);

  const exportCsv = () => {
    const csv = ['email,date_inscription', ...rows.map((r) => `${r.email},${r.created_at.slice(0, 10)}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `elrophe-newsletter-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (s: Subscriber) => {
    if (!confirm(`Désinscrire ${s.email} ?`)) return;
    const { error } = await deleteRow(TABLES.newsletter, s.id);
    if (error) toast.error(error);
    else reload();
  };

  return (
    <>
      <PageTitle
        eyebrow="Site"
        title="Newsletter"
        subtitle="Inscriptions recueillies sur la page d’accueil."
        actions={<button className="pz-btn pz-btn-outline" disabled={rows.length === 0} onClick={exportCsv}><Download className="h-3.5 w-3.5" />Exporter en CSV</button>}
      />
      {missing && <MigrationNotice />}
      <div className="pz-card">
        <div className="pz-card-header">
          <div className="flex items-center gap-3">
            <span className="pz-stat-icon"><Mail className="h-4 w-4" /></span>
            <h2 className="pz-card-title">{rows.length} abonné{rows.length > 1 ? 's' : ''}</h2>
          </div>
        </div>
        {loading ? (
          <div className="pz-empty">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="pz-empty">Aucun abonné pour le moment</div>
        ) : (
          <table className="w-full text-left">
            <thead><tr><th>E-mail</th><th>Inscrit le</th><th /></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="text-[var(--pz-text)]">{s.email}</td>
                  <td className="text-slate-500">{formatDate(s.created_at, true)}</td>
                  <td className="text-right">
                    <button className="pz-btn pz-btn-ghost px-2! text-red-600!" onClick={() => remove(s)} aria-label={`Désinscrire ${s.email}`}><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default function NewsletterPage() {
  return (
    <AdminGate>
      <NewsletterManager />
    </AdminGate>
  );
}
