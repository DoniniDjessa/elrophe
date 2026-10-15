import type { Metadata } from 'next';
import PageHeader from '@/components/site/PageHeader';
import Philosophy from '@/components/site/Philosophy';
import Ritual from '@/components/site/Ritual';
import Ingredients from '@/components/site/Ingredients';
import { getIngredients, getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'À propos', description: 'Notre philosophie : une nature exigeante et des formules honnêtes.' };

export default async function AProposPage() {
  const [{ sections, brand }, ingredients] = await Promise.all([getSettings(), getIngredients()]);
  return (
    <>
      <PageHeader eyebrow="À propos de" accent={brand.name} title="Notre histoire" script="naturelle" text={brand.footer_text} crumbs={[{ label: 'À propos' }]} />
      <Philosophy data={sections.philosophy} showLink={false} />
      <Ritual data={sections.ritual} />
      <Ingredients items={ingredients} heading={sections.ingredients} />
    </>
  );
}
