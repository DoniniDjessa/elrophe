'use client';

import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteImage, deleteRow, insertRow, reorder, TABLES, updateRow } from '@/lib/admin';
import { MigrationNotice } from './AdminGate';
import { Modal, PageTitle, useRows } from './ui';

type Table = (typeof TABLES)[keyof typeof TABLES];
interface Row {
  id: string;
  sort_order: number;
  is_active: boolean;
  image_url?: string | null;
}

/**
 * Liste ordonnée + formulaire modal, partagée par Catégories, Ingrédients et Avis clients.
 * `renderForm` reçoit l'objet en cours d'édition et son setter.
 */
export default function CrudList<T extends Row>({
  table,
  eyebrow,
  title,
  subtitle,
  itemLabel,
  emptyItem,
  summary,
  renderForm,
  validate,
  imageField = 'image_url',
  embedded = false,
}: {
  table: Table;
  eyebrow: string;
  title: string;
  subtitle?: string;
  itemLabel: string;
  emptyItem: Omit<T, 'id' | 'sort_order'>;
  summary: (row: T) => { image?: string | null; title: string; subtitle?: string };
  renderForm: (value: Partial<T>, set: (patch: Partial<T>) => void, isNew: boolean) => ReactNode;
  validate?: (value: Partial<T>) => string | null;
  imageField?: keyof T;
  /** Intégré dans un onglet : pas de titre de page, juste la barre d'action */
  embedded?: boolean;
}) {
  const { rows, loading, missing, reload } = useRows<T>(table);
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!editing) return;
    const problem = validate?.(editing);
    if (problem) return toast.error(problem);
    setBusy(true);
    const { id, ...payload } = editing as Partial<T> & { id?: string; created_at?: string; updated_at?: string };
    delete payload.created_at;
    delete payload.updated_at;
    const { error } = id ? await updateRow<T>(table, id, payload as Partial<T>) : await insertRow<T>(table, { ...payload, sort_order: rows.length + 1 } as Partial<T>);
    setBusy(false);
    if (error) return toast.error(error.includes('duplicate') ? 'Cet identifiant existe déjà' : error);
    toast.success('Enregistré');
    setEditing(null);
    reload();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...rows];
    const target = index + dir;
    if (!next[target]) return;
    [next[index], next[target]] = [next[target], next[index]];
    const { error } = await reorder(table, next.map((r) => r.id));
    if (error) toast.error(error);
    reload();
  };

  const toggle = async (row: T) => {
    const { error } = await updateRow<Row>(table, row.id, { is_active: !row.is_active });
    if (error) toast.error(error);
    else reload();
  };

  const remove = async (row: T) => {
    if (!confirm(`Supprimer « ${summary(row).title} » ?`)) return;
    const { error } = await deleteRow(table, row.id);
    if (error) return toast.error(error.includes('foreign key') ? 'Des éléments y sont encore rattachés' : error);
    await deleteImage(row[imageField] as string | null);
    toast.success('Supprimé');
    reload();
  };

  return (
    <>
      {embedded ? (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          <button className="pz-btn pz-btn-primary self-start" disabled={missing} onClick={() => setEditing({ ...emptyItem } as Partial<T>)}>
            <Plus className="h-3.5 w-3.5" />
            Ajouter {itemLabel}
          </button>
        </div>
      ) : (
        <PageTitle
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          actions={
            <button className="pz-btn pz-btn-primary" disabled={missing} onClick={() => setEditing({ ...emptyItem } as Partial<T>)}>
              <Plus className="h-3.5 w-3.5" />
              Ajouter {itemLabel}
            </button>
          }
        />
      )}
      {missing && <MigrationNotice />}

      <div className="pz-card">
        {loading ? (
          <div className="pz-empty">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="pz-empty">Aucun élément</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {rows.map((row, index) => {
              const s = summary(row);
              return (
                <li key={row.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${row.is_active ? '' : 'opacity-60'}`}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className={`pz-rank ${index === 0 ? 'is-top' : ''}`}>{index + 1}</span>
                    {s.image !== undefined && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image || ''} alt="" className="h-12 w-12 shrink-0 rounded-md border border-gray-200 bg-gray-50 object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-[var(--pz-text)]">{s.title}</p>
                      {s.subtitle && <p className="line-clamp-1 text-xs text-slate-500">{s.subtitle}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className={`pz-badge mr-2 ${row.is_active ? 'pz-badge-up' : 'pz-badge-neutral'}`}>{row.is_active ? 'Visible' : 'Masqué'}</span>
                    <button className="pz-btn pz-btn-ghost px-2!" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Monter"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button className="pz-btn pz-btn-ghost px-2!" disabled={index === rows.length - 1} onClick={() => move(index, 1)} aria-label="Descendre"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button className="pz-btn pz-btn-ghost px-2!" onClick={() => toggle(row)} aria-label={row.is_active ? 'Masquer' : 'Afficher'}>
                      {row.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button className="pz-btn pz-btn-ghost px-2!" onClick={() => setEditing(row)} aria-label="Modifier"><Pencil className="h-3.5 w-3.5" /></button>
                    <button className="pz-btn pz-btn-ghost px-2! text-red-600!" onClick={() => remove(row)} aria-label="Supprimer"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {editing && (
        <Modal
          title={editing.id ? 'Modifier' : `Ajouter ${itemLabel}`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="pz-btn pz-btn-outline" onClick={() => setEditing(null)}>Annuler</button>
              <button className="pz-btn pz-btn-primary" onClick={save} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
            </>
          }
        >
          <div className="space-y-4">{renderForm(editing, (patch) => setEditing((e) => ({ ...e, ...patch })), !editing.id)}</div>
        </Modal>
      )}
    </>
  );
}
