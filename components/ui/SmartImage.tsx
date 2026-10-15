import Image, { type ImageProps } from 'next/image';

/** next/image qui laisse passer les SVG locaux tels quels (les visuels provisoires sont en SVG) */
export default function SmartImage({ src, alt, ...props }: Omit<ImageProps, 'src'> & { src: string | null | undefined }) {
  const url = src || '/images/products/moringa-vitalite.svg';
  return <Image src={url} alt={alt} unoptimized={url.endsWith('.svg')} {...props} />;
}
