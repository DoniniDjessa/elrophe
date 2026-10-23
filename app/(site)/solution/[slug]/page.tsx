import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/site/ProductCard';
import { Eyebrow } from '@/components/site/Typography';
import SmartImage from '@/components/ui/SmartImage';
import { getProducts, getSolutionBySlug, getSolutions } from '@/lib/data';

export async function generateStaticParams() {
  const solutions = await getSolutions();
  // Cache Components exige au moins un résultat : aucune solution → une page 404 générée
  return solutions.length ? solutions.map((s) => ({ slug: s.slug })) : [{ slug: 'aucune-solution' }];
}

export async function generateMetadata({ params }: PageProps<'/solution/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) return { title: 'Solution introuvable' };
  return {
    title: solution.title,
    description: solution.description?.slice(0, 150) ?? undefined,
    openGraph: { images: solution.image_url && !solution.image_url.endsWith('.svg') ? [solution.image_url] : undefined },
  };
}

async function SolutionContent({ params }: Pick<PageProps<'/solution/[slug]'>, 'params'>) {
  const { slug } = await params;
  const [solution, products] = await Promise.all([getSolutionBySlug(slug), getProducts()]);
  if (!solution) notFound();

  // Dans l'ordre choisi au pilotage ; les produits masqués ou supprimés sont ignorés
  const selected = solution.product_ids.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined);

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
          <li><Link href="/" className="hover:text-ink">Accueil</Link></li>
          <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" aria-hidden="true" /><span aria-current="page" className="text-ink">{solution.title}</span></li>
        </ol>
      </nav>

      <header className="rise grid items-center gap-8 overflow-hidden rounded-[2rem] bg-cream shadow-[var(--shadow-soft)] md:grid-cols-[1fr_1.2fr]">
        <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-[320px]">
          <SmartImage src={solution.image_url} alt="" fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
        </div>
        <div className="px-6 pb-8 md:py-10 md:pr-10 md:pl-0">
          <Eyebrow text="Solution" accent="bien-être" />
          <h1 className="heading-xl mt-5 text-[clamp(2.1rem,5vw,3.4rem)]">{solution.title}</h1>
          {solution.description && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted md:text-base">{solution.description}</p>}
          <p className="mt-6 text-sm font-semibold text-ink">
            {selected.length} produit{selected.length > 1 ? 's' : ''} recommandé{selected.length > 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <section aria-label={`Produits pour ${solution.title}`} className="mt-12">
        {selected.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {selected.map((p) => (
              <li key={p.id}><ProductCard product={p} /></li>
            ))}
          </ul>
        ) : (
          <div className="glass rounded-[var(--radius-card)] p-10 text-center">
            <p className="text-ink-muted">Les produits de cette solution arrivent bientôt.</p>
            <Link href="/boutique" className="btn-primary group mt-6 inline-flex">
              Voir la boutique
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

export default function SolutionPage({ params }: PageProps<'/solution/[slug]'>) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10">
      <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
        <SolutionContent params={params} />
      </Suspense>
    </div>
  );
}
