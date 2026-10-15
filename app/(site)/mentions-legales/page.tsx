import type { Metadata } from 'next';
import PageHeader from '@/components/site/PageHeader';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Mentions légales' };

export default async function MentionsPage() {
  const { brand, shop } = await getSettings();
  const sections = [
    { id: 'editeur', title: 'Éditeur du site', body: `${brand.name} — ${brand.address}. Contact : ${brand.email} · ${brand.phone}.` },
    { id: 'cgv', title: 'Conditions générales de vente', body: `Les prix sont indiqués en ${shop.currency}, toutes taxes comprises. Chaque commande est confirmée par téléphone avant expédition. ${shop.delivery_info} Le paiement s’effectue à la livraison ou par Mobile Money. En cas de produit endommagé à la réception, contactez-nous sous 48 h pour un échange.` },
    { id: 'confidentialite', title: 'Confidentialité', body: 'Les informations saisies lors d’une commande (nom, téléphone, adresse, e-mail) servent uniquement à traiter et livrer votre commande. Elles ne sont jamais revendues. Vous pouvez demander leur suppression à tout moment en nous écrivant.' },
    { id: 'avertissement', title: 'Avertissement', body: 'Les compléments alimentaires ne se substituent pas à une alimentation variée et équilibrée ni à un mode de vie sain. Ne pas dépasser la dose journalière recommandée. Tenir hors de portée des enfants. Demandez conseil à un professionnel de santé en cas de grossesse, d’allaitement ou de traitement médical.' },
  ];
  return (
    <>
      <PageHeader eyebrow="Informations" accent="légales" title="Mentions légales" crumbs={[{ label: 'Mentions légales' }]} />
      <div className="mx-auto max-w-3xl space-y-10 px-4 pb-20 sm:px-6">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <h2 className="heading-lg text-2xl">{s.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </>
  );
}
