import type { Metadata } from 'next';
import CheckoutForm from '@/components/site/CheckoutForm';
import PageHeader from '@/components/site/PageHeader';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Commande', robots: { index: false } };

export default async function CommandePage() {
  const { shop } = await getSettings();
  return (
    <>
      <PageHeader title="Commande" crumbs={[{ href: '/panier', label: 'Panier' }, { label: 'Commande' }]} />
      <div className="container-site pb-16">
        <CheckoutForm shop={shop} />
      </div>
    </>
  );
}
