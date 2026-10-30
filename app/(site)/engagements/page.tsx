import type { Metadata } from 'next';
import Image from 'next/image';
import { withIcons } from '@/components/site/home/Engagements';
import PageHeader from '@/components/site/PageHeader';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Nos engagements',
  description: 'Sélection exigeante, qualité documentée et transparence : les engagements de la maison EL ROPHE.',
};

export default async function EngagementsPage() {
  const { home } = await getSettings();
  return (
    <>
      <PageHeader
        kicker="Nos engagements"
        title="Une qualité maîtrisée à chaque étape."
        text="Nous sélectionnons nos ingrédients, travaillons avec des laboratoires qualifiés et partageons les informations utiles pour vous offrir des produits fiables."
        crumbs={[{ label: 'Nos engagements' }]}
      />
      <section className="container-site pb-14 lg:pb-20">
        <ul className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
          {withIcons(home.engagements.items).map(({ Icon, title, text }, i) => (
            <li key={i} className="flex items-start gap-5 py-7">
              <span className="ring-icon">
                <Icon className="h-6 w-6" strokeWidth={1.3} aria-hidden="true" />
              </span>
              <span>
                <h2 className="font-serif text-[1.7rem] leading-tight">{title}</h2>
                <p className="mt-2 text-[16px] leading-relaxed text-muted">{text}</p>
              </span>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-8 max-w-3xl text-[14px] text-muted">
          Les fiches produit détaillent la composition, les conseils d’utilisation et les précautions de chaque produit. Pour toute question sur un fabricant ou
          un contrôle, notre équipe vous répond.
        </p>
      </section>
      <div className="relative aspect-[16/7] max-h-[440px] w-full">
        <Image src="/images/refonte/engagements-feuillage.png" alt="Feuillage frais couvert de rosée" fill sizes="100vw" className="object-cover" />
      </div>
    </>
  );
}
