'use client';

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ImagePlus, Link2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { IMAGE_ACCEPT, isMissingTable, listRows, TABLES, uploadImage } from '@/lib/admin';

type Table = (typeof TABLES)[keyof typeof TABLES];

/** Charge une table, signale si le schéma n'est pas encore installé */
export function useRows<T>(table: Table, order = 'sort_order', ascending = true) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const reload = useCallback(
    () =>
      listRows<T>(table, order, ascending).then(({ data, error }) => {
        if (error) {
          setMissing(isMissingTable(error));
          if (!isMissingTable(error)) toast.error(error);
        }
        setRows(data);
        setLoading(false);
      }),
    [table, order, ascending],
  );
  useEffect(() => {
    void reload();
  }, [reload]);
  return { rows, setRows, loading, missing, reload };
}

export function PageTitle({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="pz-eyebrow mb-1">{eyebrow}</p>
        <h1 className="text-2xl">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, footer, wide = false }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`pz-card flex max-h-[92vh] w-full flex-col ${wide ? 'sm:max-w-3xl' : 'sm:max-w-xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pz-card-header">
          <h2 className="pz-card-title">{title}</h2>
          <button onClick={onClose} className="pz-btn pz-btn-ghost px-2!" aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[var(--pz-border)] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

const inputClass = 'w-full px-3 py-2 border border-gray-300 bg-transparent text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  textarea = false,
  rows = 3,
  placeholder,
  hint,
  className = '',
  required,
}: {
  label: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  type?: string;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
  className?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block">
        {label}
        {required && ' *'}
      </label>
      {textarea ? (
        <textarea id={id} rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} required={required} />
      ) : (
        <input id={id} type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} required={required} />
      )}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Switch({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/40" />
        <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      <span className="text-sm font-semibold text-[var(--pz-text-soft)]">
        {label}
        {hint && <span className="block text-xs font-normal text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

/** Image : aperçu + envoi vers le bucket elrophe-media, ou URL / chemin saisi à la main */
export function ImageField({
  label,
  value,
  onChange,
  folder,
  aspect = 'aspect-square',
  max,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  folder: string;
  aspect?: string;
  max?: number;
}) {
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const handle = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file, folder, max));
      toast.success('Image envoyée');
    } catch (err) {
      toast.error(`Envoi impossible : ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div>
      <span className="block text-[0.6875rem] font-extrabold uppercase tracking-[0.04em] text-[var(--pz-muted)] mb-[0.4rem]">{label}</span>
      <div className="flex gap-3">
        <div className={`relative w-28 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 ${aspect}`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">Aucune</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label className={`pz-btn pz-btn-outline w-fit ${busy ? 'pointer-events-none opacity-55' : 'cursor-pointer'}`}>
            {busy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            {value ? 'Remplacer' : 'Envoyer une image'}
            <input ref={input} type="file" accept={IMAGE_ACCEPT} className="sr-only" disabled={busy} onChange={(e) => handle(e.target.files?.[0])} />
          </label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="ou URL / chemin, ex. /images/…"
              className="w-full border border-gray-300 bg-transparent py-1.5 pr-3 pl-8 text-black focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="pz-empty">{children}</div>;
}
