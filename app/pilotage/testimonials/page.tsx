'use client';

import { TABLES } from '@/lib/admin';
import type { Testimonial } from '@/lib/types';
import AdminGate from '../components/AdminGate';
import CrudList from '../components/CrudList';
import { Field, ImageField, Switch } from '../components/ui';

export default function TestimonialsPage() {
  return (
    <AdminGate>
      <CrudList<Testimonial>
        table={TABLES.testimonials}
        eyebrow="Site"
        title="Avis clients"
        subtitle="Carrousel de témoignages de la page d’accueil."
        itemLabel="un avis"
        emptyItem={{ name: '', location: '', text: '', rating: 5, avatar_url: '', product_name: '', is_active: true }}
        imageField="avatar_url"
        summary={(t) => ({ image: t.avatar_url, title: `${t.name} · ${'★'.repeat(t.rating)}`, subtitle: t.text })}
        validate={(t) => (!t.name?.trim() || !t.text?.trim() ? 'Nom et texte obligatoires' : null)}
        renderForm={(t, set) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom" required value={t.name} onChange={(v) => set({ name: v })} />
              <Field label="Ville" value={t.location} onChange={(v) => set({ location: v })} />
              <Field label="Produit concerné" value={t.product_name} onChange={(v) => set({ product_name: v })} />
              <div>
                <label className="block" htmlFor="rating">Note</label>
                <select id="rating" value={t.rating} onChange={(e) => set({ rating: Number(e.target.value) })} className="w-full border border-gray-300 bg-transparent px-3 py-2 text-black">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>)}
                </select>
              </div>
            </div>
            <Field label="Témoignage" required textarea rows={4} value={t.text} onChange={(v) => set({ text: v })} />
            <ImageField label="Photo (optionnelle, sinon initiales)" value={t.avatar_url} onChange={(v) => set({ avatar_url: v })} folder="avatars" max={400} />
            <Switch label="Visible sur le site" checked={!!t.is_active} onChange={(v) => set({ is_active: v })} />
          </>
        )}
      />
    </AdminGate>
  );
}
