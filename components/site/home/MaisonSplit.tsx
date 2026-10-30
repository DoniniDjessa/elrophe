import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import type { HomeSettings } from '@/lib/types';

/** « L'exigence au cœur de notre maison » : photo botanique + texte institutionnel (Pilotage › Personnalisation › Accueil) */
export default function MaisonSplit({ maison, withLink = true }: { maison: HomeSettings['maison']; withLink?: boolean }) {
  // Retour à la ligne dans le titre : saut de ligne affiché tel quel
  const [first, ...rest] = maison.title.split('\n');
  return (
    <section aria-labelledby="maison-title" className="grid bg-white lg:grid-cols-2">
      <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[460px]">
        {maison.image_url && <SmartImage src={maison.image_url} alt={maison.image_alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />}
      </div>
      <div className="flex items-center px-5 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="max-w-lg">
          <p className="kicker">
            <span className="h-px w-8 bg-champagne" aria-hidden="true" />
            {maison.kicker}
          </p>
          <h2 id="maison-title" className="title-lg mt-4 text-[clamp(2rem,4vw,2.8rem)]">
            {first}
            {rest.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          {maison.paragraphs.filter(Boolean).map((p) => (
            <p key={p.slice(0, 20)} className="mt-4 text-[16px] leading-relaxed text-muted">
              {p}
            </p>
          ))}
          {withLink && maison.button_label && (
            <Link href="/notre-maison" className="btn btn-forest mt-8">
              {maison.button_label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
