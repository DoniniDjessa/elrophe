import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';

/** Logo officiel : emblème + « EL ROPHE » en capitales serif, signature discrète dessous */
export default function Brand({
  iconUrl,
  tone = 'dark',
  stacked = false,
  className = '',
}: {
  iconUrl: string;
  /** dark : texte vert forêt (fond clair) ; light : texte ivoire (fond vert) */
  tone?: 'dark' | 'light';
  /** Emblème au-dessus du nom (mobile centré, pied de page) */
  stacked?: boolean;
  className?: string;
}) {
  const text = tone === 'light' ? 'text-ivory' : 'text-forest';
  return (
    <Link href="/" aria-label="EL ROPHE — accueil" className={`group inline-flex items-center ${stacked ? 'flex-col gap-1' : 'gap-2.5'} ${className}`}>
      <SmartImage src={iconUrl} alt="" width={1024} height={984} preload sizes="40px" className={stacked ? 'h-7 w-auto' : 'h-9 w-auto'} />
      <span className={`flex flex-col ${stacked ? 'items-center' : ''} leading-none`}>
        <span className={`font-serif text-[1.35rem] font-medium tracking-[0.18em] ${text}`}>EL ROPHE</span>
        <span className={`mt-1 text-[0.55rem] font-medium tracking-[0.2em] whitespace-nowrap uppercase ${tone === 'light' ? 'text-ivory/70' : 'text-muted'}`}>
          Premium Natural Products
        </span>
      </span>
    </Link>
  );
}
