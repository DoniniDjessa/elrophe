import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';

/**
 * « EL ROPHE » + signature : la signature est justifiée exactement sur la largeur du nom.
 * Le nom fixe la largeur (w-max) ; la signature ne compte pas dans la largeur (w-0 min-w-full) et s'étale par justification.
 */
export function Wordmark({ tone = 'dark', size = 'md', className = '' }: { tone?: 'dark' | 'light'; size?: 'md' | 'lg'; className?: string }) {
  // md : plus compact sur mobile (en-tête avec menu, drapeaux et icônes)
  const name = size === 'lg' ? 'text-[1.6rem]' : 'text-[1.12rem] sm:text-[1.35rem]';
  const tagline = size === 'lg' ? 'text-[0.52rem]' : 'text-[0.37rem] sm:text-[0.45rem]';
  return (
    <span className={`flex w-max flex-col leading-none ${className}`}>
      {/* -mr compense l'espacement ajouté après la dernière lettre */}
      <span className={`mr-[-0.18em] font-serif font-medium tracking-[0.18em] ${name} ${tone === 'light' ? 'text-ivory' : 'text-forest'}`}>EL ROPHE</span>
      <span
        className={`mt-1 w-0 min-w-full font-medium tracking-[0.08em] whitespace-nowrap uppercase [text-align-last:justify] ${tagline} ${
          tone === 'light' ? 'text-ivory/70' : 'text-muted'
        }`}
      >
        Premium Natural Products
      </span>
    </span>
  );
}

/** Logo officiel : emblème + nom et signature */
export default function Brand({
  iconUrl,
  tone = 'dark',
  stacked = false,
  badge = false,
  className = '',
}: {
  iconUrl: string;
  /** dark : texte vert forêt (fond clair) ; light : texte ivoire (fond vert) */
  tone?: 'dark' | 'light';
  /** Emblème au-dessus du nom */
  stacked?: boolean;
  /** Mobile : emblème posé dans une pastille ronde ivoire */
  badge?: boolean;
  className?: string;
}) {
  const emblem = <SmartImage src={iconUrl} alt="" width={1024} height={984} preload sizes="40px" className={stacked ? 'h-7 w-auto' : badge ? 'h-6 w-auto lg:h-9' : 'h-9 w-auto'} />;
  return (
    <Link href="/" aria-label="EL ROPHE — accueil" className={`group inline-flex items-center ${stacked ? 'flex-col gap-1' : 'gap-2 sm:gap-2.5'} ${className}`}>
      {badge ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-ivory lg:h-auto lg:w-auto lg:border-0 lg:bg-transparent">{emblem}</span>
      ) : (
        emblem
      )}
      <Wordmark tone={tone} />
    </Link>
  );
}
