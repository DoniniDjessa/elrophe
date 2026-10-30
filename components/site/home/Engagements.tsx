import { FlaskConical, Leaf, ShieldCheck } from 'lucide-react';
import type { Engagement, HomeSettings } from '@/lib/types';

/** Icônes des engagements, dans l'ordre (textes : Pilotage › Personnalisation › Accueil) — sans mention de certification non justifiée */
export const engagementIcons = [Leaf, FlaskConical, ShieldCheck];

export const withIcons = (items: Engagement[]) =>
  items.filter((e) => e.title || e.text).map((e, i) => ({ ...e, Icon: engagementIcons[i % engagementIcons.length] }));

export default function Engagements({ engagements, withTitle = true }: { engagements: HomeSettings['engagements']; withTitle?: boolean }) {
  const items = withIcons(engagements.items);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={withTitle ? 'engagements-title' : undefined} className="container-site py-14 lg:py-20">
      {withTitle && (
        <p id="engagements-title" className="kicker kicker-lines flex justify-center">
          {engagements.kicker}
        </p>
      )}
      <ul className={`grid gap-8 md:grid-cols-3 md:gap-0 ${withTitle ? 'mt-10' : ''}`}>
        {items.map(({ Icon, title, text }, i) => (
          <li key={i} className={`flex items-start gap-4 md:px-8 ${i > 0 ? 'md:border-l md:border-line' : ''}`}>
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
