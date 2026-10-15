'use client';

import { TABLES } from '@/lib/admin';
import type { Ingredient } from '@/lib/types';
import AdminGate from '../components/AdminGate';
import CrudList from '../components/CrudList';
import { Field, ImageField, Switch } from '../components/ui';

export default function IngredientsPage() {
  return (
    <AdminGate>
      <CrudList<Ingredient>
        table={TABLES.ingredients}
        eyebrow="Catalogue"
        title="Ingrédients phares"
        subtitle="Grille « Ingrédients phares » de la page d’accueil (4 conseillés)."
        itemLabel="un ingrédient"
        emptyItem={{ name: '', latin_name: '', benefit: '', image_url: '', is_active: true }}
        summary={(i) => ({ image: i.image_url, title: i.name, subtitle: i.benefit ?? '' })}
        validate={(i) => (!i.name?.trim() ? 'Nom obligatoire' : null)}
        renderForm={(i, set) => (
          <>
            <Field label="Nom" required value={i.name} onChange={(v) => set({ name: v })} />
            <Field label="Nom latin (affiché en manuscrit)" value={i.latin_name} onChange={(v) => set({ latin_name: v })} />
            <Field label="Bienfait" textarea value={i.benefit} onChange={(v) => set({ benefit: v })} />
            <ImageField label="Illustration (carrée, fond transparent conseillé)" value={i.image_url} onChange={(v) => set({ image_url: v })} folder="ingredients" />
            <Switch label="Visible sur le site" checked={!!i.is_active} onChange={(v) => set({ is_active: v })} />
          </>
        )}
      />
    </AdminGate>
  );
}
