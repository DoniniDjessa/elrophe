import Link from 'next/link';
import { Script } from '@/components/site/Typography';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="heading-xl mt-5 text-4xl">
        Cette page s’est <Script className="text-[1.3em]">envolée</Script>
      </h1>
      <p className="mt-5 text-ink-muted">Le lien est peut-être ancien ou le produit n’est plus disponible.</p>
      <Link href="/boutique" className="btn-primary mt-8">Voir la boutique</Link>
    </div>
  );
}
