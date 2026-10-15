import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Eyebrow, Script } from './Typography';

export default function PageHeader({
  eyebrow,
  accent,
  title,
  script,
  text,
  crumbs = [],
}: {
  eyebrow: string;
  accent?: string;
  title: string;
  script?: string;
  text?: string;
  crumbs?: { href?: string; label: string }[];
}) {
  return (
    <header className="mx-auto max-w-[1440px] px-4 pt-6 pb-8 sm:px-6 lg:px-10 lg:pt-10">
      {crumbs.length > 0 && (
        <nav aria-label="Fil d'Ariane" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            <li>
              <Link href="/" className="hover:text-ink">
                Accueil
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="rise">
        <Eyebrow text={eyebrow} accent={accent} />
        <h1 className="heading-xl mt-5 text-[clamp(2.1rem,5vw,3.6rem)]">
          {title} {script && <Script className="ml-1 text-[1.3em]">{script}</Script>}
        </h1>
        {text && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted md:text-base">{text}</p>}
      </div>
    </header>
  );
}
