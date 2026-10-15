'use client';

import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/admin';
import AdminGate from '../components/AdminGate';
import { Field, PageTitle } from '../components/ui';

function AccessCode() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next !== confirm) return toast.error('Les deux nouveaux codes ne correspondent pas');
    if (!/^[0-9A-Za-z]{4,32}$/.test(next)) return toast.error('Le nouveau code doit contenir de 4 à 32 chiffres ou lettres');
    setBusy(true);
    const { data } = await db().auth.getSession();
    const res = await fetch('/api/pilotage/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
      body: JSON.stringify({ current, next }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(json.error || 'Modification impossible');
    toast.success('Code d’accès modifié');
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  return (
    <>
      <PageTitle eyebrow="Site" title="Code d'accès" subtitle="Code demandé à l’ouverture du pilotage. Les sessions déjà ouvertes restent connectées." />
      <form onSubmit={submit} className="pz-card max-w-lg">
        <div className="pz-card-header">
          <div className="flex items-center gap-3">
            <span className="pz-stat-icon"><KeyRound className="h-4 w-4" /></span>
            <h2 className="pz-card-title">Modifier le code</h2>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <Field label="Code actuel" type="password" required value={current} onChange={setCurrent} />
          <Field label="Nouveau code" type="password" required value={next} onChange={setNext} hint="4 à 32 chiffres ou lettres. Plus il est long, plus il est sûr." />
          <Field label="Confirmer le nouveau code" type="password" required value={confirm} onChange={setConfirm} />
          <button type="submit" disabled={busy} className="pz-btn pz-btn-primary">
            {busy ? 'Enregistrement…' : 'Enregistrer le nouveau code'}
          </button>
        </div>
      </form>
    </>
  );
}

export default function AccesPage() {
  return (
    <AdminGate>
      <AccessCode />
    </AdminGate>
  );
}
