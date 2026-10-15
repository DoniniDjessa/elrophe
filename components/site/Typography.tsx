import type { ReactNode } from 'react';

/** Surtitre en petites capitales espacées, un mot en --leaf, ligne fine qui prolonge */
export function Eyebrow({ text, accent, center = false, className = '' }: { text: string; accent?: string; center?: boolean; className?: string }) {
  return (
    <p className={`eyebrow ${center ? 'justify-center' : ''} ${className}`}>
      {center && <span aria-hidden="true" className="h-px w-[4.5rem] max-w-[15vw] bg-forest/35" />}
      <span>
        {text} {accent && <span className="text-leaf">{accent}</span>}
      </span>
    </p>
  );
}

/** Accent manuscrit avec soulignement tracé à la main */
export function Script({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`script relative inline-block whitespace-nowrap ${className}`}>
      {children}
      <svg
        aria-hidden="true"
        className="underline-draw absolute -bottom-[0.1em] left-[4%] h-[0.26em] w-[92%] overflow-visible"
        viewBox="0 0 300 20"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d="M3 14 C 60 4, 120 3, 175 9 S 270 15, 297 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}

/** En-tête de section : surtitre + titre (avec mot manuscrit optionnel) + texte */
export function SectionHeading({
  eyebrow,
  accent,
  title,
  script,
  text,
  align = 'left',
  id,
  light = false,
}: {
  eyebrow: string;
  accent?: string;
  title: string;
  script?: string;
  text?: string;
  align?: 'left' | 'center';
  id?: string;
  light?: boolean;
}) {
  const center = align === 'center';
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <Eyebrow text={eyebrow} accent={accent} center={center} />}
      <h2 id={id} className={`heading-lg mt-4 text-[clamp(1.9rem,4vw,2.9rem)] ${light ? 'text-white!' : ''}`}>
        {title} {script && <Script className="ml-1 text-[1.3em]">{script}</Script>}
      </h2>
      {text && <p className={`mt-4 text-[15px] leading-relaxed md:text-base ${light ? 'text-white/75' : 'text-ink-muted'}`}>{text}</p>}
    </div>
  );
}
