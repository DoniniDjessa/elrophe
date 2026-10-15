import type { Metadata } from 'next';
import PageHeader from '@/components/site/PageHeader';
import OrderTracker from './OrderTracker';

export const metadata: Metadata = { title: 'Mon compte', robots: { index: false } };

export default function ComptePage() {
  return (
    <>
      <PageHeader eyebrow="Mon" accent="compte" title="Suivi de commande" text="Retrouvez l’état de votre commande à tout moment, sans créer de compte." crumbs={[{ label: 'Compte' }]} />
      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10">
        <OrderTracker />
      </div>
    </>
  );
}
