import { FlaskConical, Leaf, ShieldCheck } from 'lucide-react';

/** Les trois engagements de la maison (accueil et page Nos engagements) — sans mention de certification non justifiée */
export const engagements = [
  { Icon: Leaf, title: 'Sélection exigeante', text: 'Des produits choisis selon des critères de qualité clairement définis.' },
  { Icon: FlaskConical, title: 'Qualité documentée', text: 'Des informations disponibles sur les formulations, les fabricants et les contrôles réalisés.' },
  { Icon: ShieldCheck, title: 'Transparence', text: 'Des compositions et des conseils d’utilisation présentés clairement.' },
];

export default function Engagements({ withTitle = true }: { withTitle?: boolean }) {
  return (
    <section aria-labelledby={withTitle ? 'engagements-title' : undefined} className="container-site py-14 lg:py-20">
      {withTitle && (
        <p id="engagements-title" className="kicker kicker-lines flex justify-center">
          Nos engagements
        </p>
      )}
      <ul className={`grid gap-8 md:grid-cols-3 md:gap-0 ${withTitle ? 'mt-10' : ''}`}>
        {engagements.map(({ Icon, title, text }, i) => (
          <li key={title} className={`flex items-start gap-4 md:px-8 ${i > 0 ? 'md:border-l md:border-line' : ''}`}>
            <span className="ring-icon">
              <Icon className="h-6 w-6" strokeWidth={1.3} aria-hidden="true" />
            </span>
            <span>
              <h3 className="font-serif text-[1.35rem] leading-tight">{title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{text}</p>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
