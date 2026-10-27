import { countryName } from '@/lib/countries';

/** Pays de présence (Pilotage › Personnalisation › Marque) : drapeaux ronds, servis par flagcdn.com */
export default function Flags({ codes, className = '' }: { codes: string[]; className?: string }) {
  if (codes.length === 0) return null;
  const names = codes.map(countryName);
  return (
    <ul className={`flex items-center gap-1 ${className}`} aria-label={`Présents : ${names.join(', ')}`}>
      {codes.map((code, i) => (
        <li key={code} title={names[i]}>
          {/* SVG distant : pas d'optimisation next/image nécessaire */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://flagcdn.com/${code}.svg`}
            alt=""
            width={20}
            height={20}
            loading="lazy"
            className="h-[18px] w-[18px] rounded-full object-cover ring-1 ring-anthracite/15 sm:h-5 sm:w-5"
          />
          <span className="sr-only">{names[i]}</span>
        </li>
      ))}
    </ul>
  );
}
