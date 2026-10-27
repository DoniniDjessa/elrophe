import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const maisonText = [
  'Chez EL ROPHE, nous accordons une attention particulière à la sélection de nos produits, à la qualité des formulations et au choix de nos laboratoires partenaires.',
  'Notre ambition est de réunir les savoirs botaniques et les approches contemporaines dans une démarche de qualité, de sécurité et de transparence.',
];

/** « L'exigence au cœur de notre maison » : photo botanique + texte institutionnel */
export default function MaisonSplit({ withLink = true }: { withLink?: boolean }) {
  return (
    <section aria-labelledby="maison-title" className="grid bg-white lg:grid-cols-2">
      <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[460px]">
        <Image src="/images/refonte/maison-feuille.png" alt="Feuille fraîche couverte de gouttes de rosée" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="flex items-center px-5 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="max-w-lg">
          <p className="kicker">
            <span className="h-px w-8 bg-champagne" aria-hidden="true" />
            Notre maison
          </p>
          <h2 id="maison-title" className="title-lg mt-4 text-[clamp(2rem,4vw,2.8rem)]">
            L’exigence au cœur
            <br />
            de notre maison.
          </h2>
          {maisonText.map((p) => (
            <p key={p.slice(0, 20)} className="mt-4 text-[16px] leading-relaxed text-muted">
              {p}
            </p>
          ))}
          {withLink && (
            <Link href="/notre-maison" className="btn btn-forest mt-8">
              Découvrir notre maison
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
