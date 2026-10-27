import type { Metadata } from 'next';
import CartView from '@/components/site/CartView';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Panier', robots: { index: false } };

export default async function PanierPage() {
  const { shop } = await getSettings();
  return (
    <>
      {/* Le titre « Votre panier (n) » est rendu par CartView, qui connaît le contenu du panier */}
      <div className="container-site pt-6 pb-16 lg:pt-10">
        <CartView shop={shop} />
      </div>
    </>
  );
}
