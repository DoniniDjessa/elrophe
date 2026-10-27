import type { Metadata } from 'next';
import CartView from '@/components/site/CartView';
import PageHeader from '@/components/site/PageHeader';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Panier', robots: { index: false } };

export default async function PanierPage() {
  const { shop } = await getSettings();
  return (
    <>
      <PageHeader title="Votre panier" crumbs={[{ label: 'Panier' }]} />
      <div className="container-site pb-16">
        <CartView shop={shop} />
      </div>
    </>
  );
}
