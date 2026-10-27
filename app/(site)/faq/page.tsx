import type { Metadata } from 'next';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import HelpBanner from '@/components/site/HelpBanner';
import PageHeader from '@/components/site/PageHeader';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Questions fréquentes', description: 'Commandes, livraison, paiement, produits : les réponses à vos questions.' };

/** FAQ : réponses tirées des réglages de la boutique (livraison, paiement, retours, contact) */
export default async function FaqPage() {
  const { shop, brand } = await getSettings();
  const payments = [shop.cash_on_delivery && 'le paiement à la livraison', shop.mobile_money && 'le Mobile Money (Orange Money, MTN, Moov, Wave)'].filter(Boolean).join(' et ');
  const contact = [brand.phone && `par téléphone au ${brand.phone}`, brand.whatsapp && 'sur WhatsApp', brand.email && `par e-mail à ${brand.email}`].filter(Boolean).join(', ');

  const faq = [
    {
      q: 'Les produits sont-ils naturels ?',
      a: 'Nos produits sont élaborés à partir d’ingrédients d’origine naturelle, sélectionnés avec exigence. La composition complète de chaque produit est indiquée sur sa fiche.',
    },
    {
      q: 'Comment passer commande ?',
      a: 'Choisissez vos produits et leur format, ajoutez-les au panier puis suivez les trois étapes de la commande : informations, livraison et paiement. Aucun compte n’est nécessaire : nous vous appelons pour confirmer.',
    },
    { q: 'Quels sont les délais de livraison ?', a: shop.delivery_info },
    { q: 'Quels moyens de paiement acceptez-vous ?', a: payments ? `Nous acceptons ${payments}.` : '' },
    { q: 'Puis-je retourner un produit ?', a: shop.returns_info },
    {
      q: 'Livrez-vous à l’international ?',
      a: `Contactez-nous avant de commander : nous vous indiquerons les possibilités et les délais de livraison vers votre pays.`,
    },
    {
      q: 'Les produits remplacent-ils un traitement médical ?',
      a: 'Non. Les compléments alimentaires ne se substituent pas à une alimentation variée et équilibrée ni à un traitement prescrit. En cas de grossesse, d’allaitement ou de traitement en cours, demandez l’avis d’un professionnel de santé.',
    },
    { q: 'Comment vous contacter ?', a: contact ? `Notre équipe vous répond ${contact}${brand.hours ? ` (${brand.hours})` : ''}.` : '' },
  ].filter((f) => f.a?.trim());

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader kicker="Questions fréquentes" title="Vos questions, nos réponses." crumbs={[{ label: 'FAQ' }]} />
      <section className="container-site pb-16">
        <div className="mx-auto max-w-3xl space-y-3">
          {faq.map((f, i) => (
            <details key={f.q} open={i === 0} className="group card px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium">
                {f.q}
                <Plus className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <div className="relative aspect-[16/6] max-h-[380px] w-full">
        <Image src="/images/refonte/engagements-feuillage.png" alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <HelpBanner />
    </>
  );
}
