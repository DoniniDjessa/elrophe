import type { Metadata } from 'next';
import CartView from '@/components/site/CartView';
import PageHeader from '@/components/site/PageHeader';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Panier', robots: { index: false } };

export default async function PanierPage() {
  const { shop } = await getSettings();
  return (
    <>
      <PageHeader eyebrow="Votre" accent="panier" title="Mon panier" crumbs={[{ label: 'Panier' }]} />
      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10">
        <CartView shop={shop} />
      </div>
    </>
  );
}
