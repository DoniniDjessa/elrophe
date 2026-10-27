import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/** En-tête de page : fil d'Ariane, surtitre champagne, titre serif, texte court */
export default function PageHeader({
  kicker,
  title,
  text,
  crumbs = [],
  center = false,
}: {
  kicker?: string;
  title: string;
  text?: string;
  crumbs?: { href?: string; label: string }[];
  center?: boolean;
}) {
  return (
    <header className={`container-site pt-6 pb-8 lg:pt-10 lg:pb-12 ${center ? 'text-center' : ''}`}>
      {crumbs.length > 0 && (
        <nav aria-label="Fil d'Ariane" className="mb-6">
          <ol className={`flex flex-wrap items-center gap-1.5 text-[13px] text-muted ${center ? 'justify-center' : ''}`}>
            <li>
              <Link href="/" className="hover:text-forest">
                Accueil
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                {c.href ? (
                  <Link href={c.href} className="hover:text-forest">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-anthracite">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="rise">
        {kicker && (
          <p className="kicker">
            <span className="h-px w-8 bg-champagne" aria-hidden="true" />
            {kicker}
          </p>
        )}
        <h1 className={`title-xl mt-3 text-[clamp(2.1rem,5.4vw,3.4rem)] ${center ? 'mx-auto' : ''} max-w-3xl`}>{title}</h1>
        {text && <p className={`mt-4 max-w-xl text-[16px] leading-relaxed text-muted ${center ? 'mx-auto' : ''}`}>{text}</p>}
      </div>
    </header>
  );
}
