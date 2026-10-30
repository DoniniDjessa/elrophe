import type { ReactNode } from 'react';
import SmartImage from '@/components/ui/SmartImage';

/** **gras** dans une ligne */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part));
}

/**
 * Texte d'un article, écrit simplement dans le pilotage :
 * blocs séparés par une ligne vide ; « ## » / « ### » titres ; « - » liste ; « > » citation ;
 * ![légende](adresse) image seule sur sa ligne ; **gras**.
 */
export default function BlogContent({ content }: { content: string }) {
  const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-5 text-[17px] leading-[1.75] text-anthracite/90">
      {blocks.map((block, i) => {
        const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (image) {
          const [, alt, src] = image;
          return (
            <figure key={i} className="my-8">
              <span className="relative block aspect-[16/9] overflow-hidden rounded-lg bg-white">
                <SmartImage src={src} alt={alt} fill sizes="(min-width: 768px) 720px, 100vw" className="object-cover" />
              </span>
              {alt && <figcaption className="mt-2 text-center text-[13px] text-muted">{alt}</figcaption>}
            </figure>
          );
        }
        if (block.startsWith('### ')) return <h3 key={i} className="pt-2 text-[1.45rem] leading-snug">{inline(block.slice(4))}</h3>;
        if (block.startsWith('## ')) return <h2 key={i} className="pt-4 text-[1.8rem] leading-tight">{inline(block.slice(3))}</h2>;
        const lines = block.split('\n');
        if (lines.every((l) => /^[-•]\s/.test(l))) {
          return (
            <ul key={i} className="space-y-2 pl-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" />
                  <span>{inline(l.replace(/^[-•]\s/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => l.startsWith('>'))) {
          return (
            <blockquote key={i} className="border-l-2 border-champagne bg-white/70 py-3 pr-4 pl-5 font-serif text-[1.25rem] leading-snug italic">
              {inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}
            </blockquote>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
