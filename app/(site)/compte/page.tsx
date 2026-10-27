import type { Metadata } from 'next';
import PageHeader from '@/components/site/PageHeader';
import OrderTracker from './OrderTracker';

export const metadata: Metadata = { title: 'Mon compte', robots: { index: false } };

export default function ComptePage() {
  return (
    <>
      <PageHeader kicker="Mon compte" title="Suivi de commande" text="Retrouvez l’état de votre commande à tout moment, sans créer de compte." crumbs={[{ label: 'Compte' }]} />
      <div className="container-site pb-16">
        <OrderTracker />
      </div>
    </>
  );
}
