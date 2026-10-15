'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { db, isMissingTable } from '@/lib/admin';
import AdminNavbar from './AdminNavbar';

type GateState = 'loading' | 'signed-out' | 'not-admin' | 'no-schema' | 'ok';

/**
 * Accès au pilotage par code (0044 par défaut, modifiable dans Pilotage › Code d'accès).
 * Le serveur vérifie le code puis renvoie une session Supabase du compte administrateur partagé :
 * les règles RLS (écriture réservée à elrophe_admins) restent inchangées.
 */
export default function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GateState>('loading');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const check = async (session: Session | null) => {
      if (!session) return setState('signed-out');
      const { data, error } = await db().rpc('elrophe_is_admin');
      if (error) return setState(isMissingTable(error.message) || /function/i.test(error.message) ? 'no-schema' : 'not-admin');
      setState(data === true ? 'ok' : 'not-admin');
    };
    db().auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = db().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') check(session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/pilotage/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Code incorrect');
      const { error } = await db().auth.setSession(json);
      if (error) throw new Error(error.message);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await db().auth.signOut();
    router.push('/pilotage');
  };

  if (state === 'loading') return null;

  if (state !== 'ok') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="pz-card w-full max-w-sm p-7">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="pz-stat-icon">
              <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M16 13c-1.5-4.5.2-8.4 4.8-10.2 1.2 4.6-.6 8.6-4.8 10.2Z" />
                <path d="M16 18c-4.2.4-7.8-1.7-9.2-6.2 4.6-.9 8.3 1.4 9.2 6.2Z" opacity=".75" />
                <path d="M16 28V11" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
            <div>
              <p className="pz-eyebrow">ELROPHE</p>
              <h1 className="text-lg">Accès pilotage</h1>
            </div>
          </div>

          {state === 'no-schema' && <MigrationNotice />}

          {state === 'not-admin' ? (
            <div className="space-y-4">
              <p className="text-sm">Cette session n&apos;a pas les droits d&apos;administration ELROPHE.</p>
              <button onClick={handleLogout} className="pz-btn pz-btn-outline w-full py-2.5!">Se reconnecter</button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="code" className="block">Code d&apos;accès</label>
                <input
                  id="code"
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-black tracking-[0.3em]"
                  placeholder="••••"
                  required
                  autoFocus
                />
                {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
              </div>
              <button type="submit" disabled={busy} className="pz-btn pz-btn-primary w-full py-2.5!">
                {busy ? 'Connexion…' : 'Connexion'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminNavbar onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
    </div>
  );
}

/** Affiché quand les tables elrophe_ n'existent pas encore */
export function MigrationNotice() {
  return (
    <div className="pz-card p-4 mb-6 border-amber-300! bg-amber-50 text-sm text-amber-900">
      <p className="font-extrabold mb-1">Base de données à configurer</p>
      <p>
        Exécutez le fichier <code className="font-mono text-xs">supabase/elrophe-schema.sql</code> dans l&apos;éditeur SQL de Supabase. En
        attendant, le site affiche le contenu de démonstration.
      </p>
    </div>
  );
}
