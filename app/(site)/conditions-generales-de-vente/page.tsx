import type { Metadata } from 'next';
import Link from 'next/link';
import LegalDocument, { Fill, type LegalSection } from '@/components/site/LegalDocument';
import { getSettings } from '@/lib/data';
import { formatPrice } from '@/lib/format';

export const metadata: Metadata = { title: 'Conditions générales de vente', description: 'Conditions générales de vente des produits EL ROPHE : commande, prix, paiement, livraison et retours.' };

/** CGV : textes alimentés par les réglages de la boutique (livraison, retours, paiement) et les informations légales */
export default async function CgvPage() {
  const { brand, shop, legal } = await getSettings();
  const payments = [shop.cash_on_delivery && 'le paiement à la livraison (espèces ou Mobile Money)', shop.mobile_money && 'le paiement par Mobile Money (Orange Money, MTN, Moov, Wave)'].filter(Boolean);
  const contact = (
    <>
      {brand.email && (
        <>
          par e-mail à <a href={`mailto:${brand.email}`}>{brand.email}</a>
        </>
      )}
      {brand.email && brand.phone && ', '}
      {brand.phone && <>par téléphone au {brand.phone}</>}
      {brand.whatsapp && <> ou sur WhatsApp</>}
    </>
  );

  const sections: LegalSection[] = [
    {
      id: 'objet',
      title: 'Objet et champ d’application',
      body: (
        <>
          <p>
            Les présentes conditions générales de vente (CGV) régissent les ventes de produits conclues sur le site EL ROPHE entre <Fill value={legal.company} />{' '}
            (ci-après « EL ROPHE ») et toute personne passant commande (ci-après « le client »).
          </p>
          <p>
            Toute commande implique l’acceptation pleine et entière des CGV en vigueur au jour de la commande. Elles s’appliquent dans le respect de la loi ivoirienne
            n° 2013-546 du 30 juillet 2013 relative aux transactions électroniques.
          </p>
        </>
      ),
    },
    {
      id: 'vendeur',
      title: 'Identification du vendeur',
      body: (
        <p>
          <Fill value={legal.company} />, <Fill value={legal.legal_form} />, RCCM <Fill value={legal.rccm} />, siège : <Fill value={legal.address} />. Contact : {contact}.
          Voir aussi nos <Link href="/mentions-legales">mentions légales</Link>.
        </p>
      ),
    },
    {
      id: 'produits',
      title: 'Produits',
      body: (
        <>
          <p>
            Les produits proposés sont principalement des compléments alimentaires et des produits naturels. Leurs caractéristiques essentielles (composition, format,
            conseils d’utilisation, précautions) sont présentées sur chaque fiche produit. Les photographies sont aussi fidèles que possible mais n’ont pas de valeur
            contractuelle.
          </p>
          <p>
            Les compléments alimentaires ne sont pas des médicaments : ils ne se substituent ni à une alimentation variée et équilibrée, ni à un traitement médical.
          </p>
          <p>Les offres sont valables dans la limite des stocks disponibles. Un produit indisponible est signalé comme tel et ne peut pas être commandé.</p>
        </>
      ),
    },
    {
      id: 'prix',
      title: 'Prix',
      body: (
        <>
          <p>
            Les prix sont indiqués en {shop.currency} (francs CFA), toutes taxes comprises, hors frais de livraison. Le prix applicable est celui affiché au moment de la
            validation de la commande.
          </p>
          <p>
            Les frais de livraison sont indiqués avant la validation de la commande
            {shop.shipping_fee > 0 && <> ({formatPrice(shop.shipping_fee, shop.currency)} par commande</>}
            {shop.shipping_fee > 0 && shop.free_shipping_threshold > 0 && <>, offerts dès {formatPrice(shop.free_shipping_threshold, shop.currency)} d’achat</>}
            {shop.shipping_fee > 0 && <>)</>}. Certaines offres peuvent inclure la livraison offerte, ce qui est alors précisé sur la page concernée.
          </p>
        </>
      ),
    },
    {
      id: 'commande',
      title: 'Commande',
      body: (
        <>
          <p>
            Le client sélectionne les produits et leur format, renseigne ses coordonnées et son adresse de livraison, choisit son mode de paiement puis valide sa
            commande. Aucune création de compte n’est nécessaire.
          </p>
          <p>
            Un numéro de commande est attribué dès la validation. EL ROPHE contacte ensuite le client par téléphone pour confirmer la commande avant l’expédition. La
            vente est conclue à cette confirmation.
          </p>
          <p>
            EL ROPHE se réserve le droit de refuser ou d’annuler une commande en cas de coordonnées erronées, d’impossibilité de joindre le client, de litige antérieur ou
            d’indisponibilité du produit. Le client en est alors informé.
          </p>
        </>
      ),
    },
    {
      id: 'paiement',
      title: 'Paiement',
      body: (
        <>
          <p>Les moyens de paiement acceptés sont : {payments.length ? payments.join(' ; ') : <Fill value="" />}.</p>
          {shop.mobile_money && shop.mobile_money_instructions && <p>{shop.mobile_money_instructions}</p>}
          <p>Aucun paiement par carte bancaire n’est demandé sur le site.</p>
        </>
      ),
    },
    {
      id: 'livraison',
      title: 'Livraison',
      body: (
        <>
          <p>{shop.delivery_info}</p>
          <p>
            Les délais sont donnés à titre indicatif à compter de la confirmation de la commande. Le client est contacté pour convenir de la livraison ; il veille à
            être joignable et à fournir une adresse précise. En cas d’absence répétée, la commande peut être annulée.
          </p>
          <p>Pour une livraison hors de Côte d’Ivoire, contactez-nous avant de commander : nous vous indiquerons les possibilités, les délais et les frais.</p>
        </>
      ),
    },
    {
      id: 'retours',
      title: 'Réception, réclamations et retours',
      body: (
        <>
          <p>Le client vérifie l’état du colis et des produits à la réception, en présence du livreur dans la mesure du possible.</p>
          <p>{shop.returns_info}</p>
          <p>Toute réclamation est à adresser {contact}, en précisant le numéro de commande et, si possible, une photo du produit concerné.</p>
        </>
      ),
    },
    {
      id: 'responsabilite',
      title: 'Utilisation des produits et responsabilité',
      body: (
        <p>
          Le client s’engage à respecter les conseils d’utilisation et les précautions indiqués sur l’emballage et sur la fiche produit. En cas de grossesse,
          d’allaitement, de traitement médical ou de doute, il consulte un professionnel de santé avant utilisation. La responsabilité d’EL ROPHE ne saurait être engagée
          en cas d’utilisation non conforme.
        </p>
      ),
    },
    {
      id: 'donnees',
      title: 'Données personnelles',
      body: (
        <p>
          Les données collectées lors de la commande servent uniquement à son traitement et à sa livraison. Leur utilisation et vos droits sont détaillés dans notre{' '}
          <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
        </p>
      ),
    },
    {
      id: 'service-client',
      title: 'Service client',
      body: (
        <p>
          Pour toute question, notre équipe vous répond {contact}
          {brand.hours && <> ({brand.hours})</>}.
        </p>
      ),
    },
    {
      id: 'litiges',
      title: 'Droit applicable et litiges',
      body: (
        <p>
          Les présentes CGV sont soumises au droit ivoirien. En cas de différend, le client et EL ROPHE rechercheront d’abord une solution amiable. À défaut, le litige
          sera porté devant les juridictions compétentes d’Abidjan.
        </p>
      ),
    },
    {
      id: 'modification',
      title: 'Modification des CGV',
      body: <p>EL ROPHE peut modifier les présentes CGV à tout moment. Les CGV applicables sont celles en vigueur à la date de la commande.</p>,
    },
  ];

  return <LegalDocument kicker="Vente en ligne" title="Conditions générales de vente" updatedAt={legal.updated_at} sections={sections} />;
}
