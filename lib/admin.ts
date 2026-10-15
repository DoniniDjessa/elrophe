'use client';

import { getBrowserSupabase } from './supabase/browser';
import { MEDIA_BUCKET } from './supabase/env';

/** Tables gérées depuis le pilotage (toutes préfixées elrophe_) */
export const TABLES = {
  categories: 'elrophe_categories',
  products: 'elrophe_products',
  orders: 'elrophe_orders',
  testimonials: 'elrophe_testimonials',
  ingredients: 'elrophe_ingredients',
  settings: 'elrophe_settings',
  newsletter: 'elrophe_newsletter',
} as const;

type Table = (typeof TABLES)[keyof typeof TABLES];

export const db = () => getBrowserSupabase();

/** "relation does not exist" / cache de schéma : le SQL n'a pas encore été exécuté */
export const isMissingTable = (message?: string) => !!message && /schema cache|does not exist|relation/i.test(message);

export async function listRows<T>(table: Table, order = 'sort_order', ascending = true) {
  const { data, error } = await db().from(table).select('*').order(order, { ascending });
  return { data: (data ?? []) as T[], error: error?.message ?? null };
}

export async function insertRow<T>(table: Table, row: Partial<T>) {
  const { data, error } = await db().from(table).insert(row as never).select().single();
  if (!error) void refreshSite();
  return { data: data as T | null, error: error?.message ?? null };
}

export async function updateRow<T>(table: Table, id: string, updates: Partial<T>) {
  const { error } = await db().from(table).update(updates as never).eq('id', id);
  if (!error) void refreshSite();
  return { error: error?.message ?? null };
}

export async function deleteRow(table: Table, id: string) {
  const { error } = await db().from(table).delete().eq('id', id);
  if (!error) void refreshSite();
  return { error: error?.message ?? null };
}

/** Réécrit la colonne d'ordre (sort_order par défaut) dans l'ordre donné */
export async function reorder(table: Table, ids: string[], column = 'sort_order') {
  const results = await Promise.all(ids.map((id, i) => db().from(table).update({ [column]: i + 1 } as never).eq('id', id)));
  void refreshSite();
  return { error: results.find((r) => r.error)?.error?.message ?? null };
}

export async function saveSetting(key: string, value: unknown) {
  const { error } = await db().from(TABLES.settings).upsert({ key, value }, { onConflict: 'key' });
  if (!error) await refreshSite();
  return { error: error?.message ?? null };
}

/** Invalide le cache du site public (route /api/revalidate, vérifie que l'appelant est admin) */
export async function refreshSite() {
  const { data } = await db().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return;
  await fetch('/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => undefined);
}

/* ---------- Images ---------- */

export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/svg+xml';

/** Redimensionne et convertit en WebP (sauf SVG) avant l'envoi */
async function compress(file: File, max = 1600, quality = 0.82): Promise<Blob> {
  if (file.type === 'image/svg+xml') return file;
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Conversion impossible'))), 'image/webp', quality));
}

export async function uploadImage(file: File, folder: string, max?: number): Promise<string> {
  const blob = await compress(file, max);
  const ext = file.type === 'image/svg+xml' ? 'svg' : 'webp';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db().storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: ext === 'svg' ? 'image/svg+xml' : 'image/webp', upsert: false });
  if (error) throw new Error(error.message);
  return db().storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function deleteImage(url: string | null | undefined) {
  if (!url) return;
  const marker = `/object/public/${MEDIA_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return; // image locale (/images/...) : rien à supprimer
  await db().storage.from(MEDIA_BUCKET).remove([url.slice(index + marker.length)]);
}
