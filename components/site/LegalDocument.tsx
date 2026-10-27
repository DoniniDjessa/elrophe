import type { ReactNode } from 'react';
import PageHeader from './PageHeader';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/** Valeur légale renseignée dans le pilotage, ou repère visible « [à compléter] » */
export function Fill({ value }: { value?: string | null }) {
  return value?.trim() ? <>{value.trim()}</> : <mark className="rounded bg-champagne/30 px-1 text-anthracite">[à compléter]</mark>;
}

/** Page juridique : sommaire puis sections numérotées */
export default function LegalDocument({ title, updatedAt, intro, sections }: { title: string; updatedAt?: string; intro?: ReactNode; sections: LegalSection[] }) {
  const date = updatedAt ? new Date(updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  return (
    <>
      <PageHeader kicker="Informations légales" title={title} crumbs={[{ label: title }]} />
      <div className="container-site grid gap-10 pb-20 lg:grid-cols-[240px_1fr] lg:gap-16">
        <nav aria-label="Sommaire" className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[13px] font-semibold tracking-[0.12em] text-muted uppercase">Sommaire</p>
          <ol className="mt-3 space-y-1.5 text-[14px]">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-anthracite/80 hover:text-forest">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-3xl">
          {date && <p className="text-[14px] text-muted">Dernière mise à jour : {date}</p>}
          {intro && <div className="mt-3 text-[16px] leading-relaxed text-muted">{intro}</div>}
          <div className="mt-8 space-y-10">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="font-serif text-[1.7rem] leading-tight font-semibold">
                  {i + 1}. {s.title}
                </h2>
                <div className="mt-3 space-y-3 text-[16px] leading-relaxed text-muted [&_a]:text-forest [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-anthracite">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
