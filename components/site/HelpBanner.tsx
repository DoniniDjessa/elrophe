import Link from 'next/link';
import { ArrowRight, Headset } from 'lucide-react';

/** Bandeau vert « Besoin d'aide ? » en bas des pages Avis et FAQ */
export default function HelpBanner() {
  return (
    <section aria-labelledby="help-title" className="bg-forest text-ivory">
      <div className="container-site flex flex-col items-start gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="help-title" className="font-serif text-[2rem] leading-tight text-ivory!">
            Besoin d’aide ?
          </h2>
          <p className="mt-1 text-[16px] text-ivory/80">Notre équipe vous accompagne, du choix du produit à la livraison.</p>
        </div>
        <Link href="/contact" className="btn btn-champagne">
          <Headset className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
          Nous contacter
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
