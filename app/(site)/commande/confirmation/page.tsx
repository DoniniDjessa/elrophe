import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSettings } from '@/lib/data';
import Confirmation from './Confirmation';

export const metadata: Metadata = { title: 'Commande confirmée', robots: { index: false } };

export default async function ConfirmationPage() {
  const { shop, brand } = await getSettings();
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <Confirmation title={shop.order_success_title} message={shop.order_success_message} mobileMoneyInstructions={shop.mobile_money_instructions} phone={brand.phone} />
      </Suspense>
    </div>
  );
}
