import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Engagements from '@/components/site/home/Engagements';
import MaisonSplit from '@/components/site/home/MaisonSplit';
import PageHeader from '@/components/site/PageHeader';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Notre maison',
  description: 'EL ROPHE, maison de produits naturels haut de gamme : sélection exigeante, formulations de qualité et laboratoires partenaires choisis avec soin.',
};

/** Présentation institutionnelle, courte et élégante */
export default async function NotreMaisonPage() {
  const { home } = await getSettings();
  return (
    <>
      <PageHeader kicker="Notre maison" title="L’excellence au cœur de notre maison." crumbs={[{ label: 'Notre maison' }]} />
      <MaisonSplit maison={home.maison} withLink={false} />
      <section className="container-site py-14 text-center lg:py-20">
        <p className="mx-auto max-w-2xl font-serif text-[clamp(1.6rem,3.4vw,2.2rem)] leading-snug italic">
          « La nature nous inspire. La qualité nous distingue. »
        </p>
        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
          EL ROPHE propose ses propres formulations ainsi qu’une sélection de produits issus de laboratoires partenaires, choisis pour la qualité de leurs
          ingrédients et le sérieux de leur fabrication.
        </p>
        <Link href="/boutique" className="btn btn-forest mt-8">
          Découvrir nos produits
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
      <div className="border-t border-line">
        <Engagements engagements={home.engagements} />
      </div>
    </>
  );
}
