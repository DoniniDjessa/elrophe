'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Script } from '@/components/site/Typography';

export default function Confirmation({ mobileMoneyInstructions, phone }: { mobileMoneyInstructions: string; phone: string }) {
  const params = useSearchParams();
  const number = params.get('n');
  const method = params.get('m');
  return (
    <div className="card mx-auto max-w-xl p-8 text-center sm:p-12">
      <CheckCircle2 className="mx-auto h-12 w-12 text-leaf" strokeWidth={1.4} aria-hidden="true" />
      <h1 className="heading-xl mt-5 text-3xl sm:text-4xl">
        Merci <Script className="text-[1.3em]">beaucoup</Script>
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">
        Votre commande est bien enregistrée. Nous vous appelons très vite pour confirmer la livraison.
      </p>
      {number && (
        <p className="mt-6 rounded-2xl bg-sage-light/70 px-5 py-4 text-sm">
          Numéro de commande : <strong className="font-display text-base tracking-wide">{number}</strong>
          <br />
          <span className="text-ink-muted">Conservez-le pour suivre votre commande.</span>
        </p>
      )}
      {method === 'mobile_money' && mobileMoneyInstructions && <p className="mt-4 text-sm text-ink-muted">{mobileMoneyInstructions}</p>}
      {phone && <p className="mt-4 text-sm text-ink-muted">Une question ? Appelez-nous au {phone}.</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/compte" className="btn-ghost">Suivre ma commande</Link>
        <Link href="/boutique" className="btn-primary">Continuer mes achats</Link>
      </div>
    </div>
  );
}
