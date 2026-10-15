import type { Metadata } from 'next';
import CheckoutForm from '@/components/site/CheckoutForm';
import PageHeader from '@/components/site/PageHeader';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Commande', robots: { index: false } };

export default async function CommandePage() {
  const { shop } = await getSettings();
  return (
    <>
      <PageHeader eyebrow="Finaliser" accent="ma commande" title="Commande" crumbs={[{ href: '/panier', label: 'Panier' }, { label: 'Commande' }]} />
      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10">
        <CheckoutForm shop={shop} />
      </div>
    </>
  );
}
