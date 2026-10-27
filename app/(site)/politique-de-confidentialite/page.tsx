import type { Metadata } from 'next';
import Link from 'next/link';
import LegalDocument, { Fill, type LegalSection } from '@/components/site/LegalDocument';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Politique de confidentialité', description: 'Comment EL ROPHE collecte, utilise et protège vos données personnelles.' };

/** Politique de confidentialité et cookies (loi ivoirienne n° 2013-450) */
export default async function ConfidentialitePage() {
  const { brand, legal } = await getSettings();
  const contact = (
    <>
      {brand.email && (
        <>
          par e-mail à <a href={`mailto:${brand.email}`}>{brand.email}</a>
        </>
      )}
      {brand.email && brand.phone && ' ou '}
      {brand.phone && <>par téléphone au {brand.phone}</>}
    </>
  );

  const sections: LegalSection[] = [
    {
      id: 'responsable',
      title: 'Responsable du traitement',
      body: (
        <p>
          Le responsable du traitement de vos données est <Fill value={legal.company} />, <Fill value={legal.address} />. Pour toute question relative à vos données :{' '}
          {contact}.
        </p>
      ),
    },
    {
      id: 'cadre',
      title: 'Cadre légal',
      body: (
        <p>
          Vos données sont traitées dans le respect de la loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.
          L’Autorité de régulation des télécommunications de Côte d’Ivoire (ARTCI) est l’autorité de contrôle compétente.
        </p>
      ),
    },
    {
      id: 'donnees',
      title: 'Données collectées',
      body: (
        <>
          <p>Lors d’une commande ou d’une prise de contact, nous collectons :</p>
          <ul>
            <li>votre nom et votre numéro de téléphone ;</li>
            <li>votre adresse e-mail, si vous la renseignez ;</li>
            <li>votre adresse de livraison et vos instructions de livraison ;</li>
            <li>le contenu de vos commandes et le moyen de paiement choisi.</li>
          </ul>
          <p>Aucune donnée bancaire n’est collectée sur le site.</p>
        </>
      ),
    },
    {
      id: 'finalites',
      title: 'Finalités et base légale',
      body: (
        <>
          <p>Ces données servent à :</p>
          <ul>
            <li>traiter, confirmer et livrer vos commandes ;</li>
            <li>assurer le service client et le suivi de commande ;</li>
            <li>respecter nos obligations légales, notamment comptables.</li>
          </ul>
          <p>Ces traitements sont nécessaires à l’exécution de la vente que vous concluez avec nous.</p>
        </>
      ),
    },
    {
      id: 'destinataires',
      title: 'Destinataires',
      body: (
        <p>
          Vos données sont accessibles à notre équipe et, pour la seule livraison, à nos livreurs. Elles sont hébergées chez nos prestataires techniques (hébergement du
          site et base de données). Elles ne sont jamais vendues ni cédées à des tiers à des fins commerciales.
        </p>
      ),
    },
    {
      id: 'conservation',
      title: 'Durée de conservation',
      body: <p>Vos données sont conservées le temps nécessaire au traitement de votre commande, puis pendant la durée imposée par nos obligations légales.</p>,
    },
    {
      id: 'securite',
      title: 'Sécurité',
      body: (
        <p>
          Le site est servi en connexion sécurisée (HTTPS). L’accès aux commandes est réservé aux personnes habilitées de notre équipe. Nous prenons les mesures
          raisonnables pour protéger vos données contre toute perte ou tout accès non autorisé.
        </p>
      ),
    },
    {
      id: 'droits',
      title: 'Vos droits',
      body: (
        <p>
          Vous pouvez demander l’accès à vos données, leur rectification, leur suppression ou vous opposer à leur traitement, {contact}. Nous vous répondons dans les
          meilleurs délais. Vous pouvez également adresser une réclamation à l’ARTCI.
        </p>
      ),
    },
    {
      id: 'cookies',
      title: 'Cookies et stockage local',
      body: (
        <>
          <p>
            Le site enregistre votre panier et vos favoris dans votre navigateur (stockage local) pour les conserver d’une visite à l’autre. Ces informations restent
            sur votre appareil et ne nous sont pas transmises.
          </p>
          <p>
            Le site peut utiliser un outil de mesure publicitaire (pixel Meta) afin de mesurer l’efficacité de nos campagnes. Vous pouvez limiter ce suivi depuis les
            réglages de votre navigateur ou de votre compte Meta.
          </p>
        </>
      ),
    },
    {
      id: 'modification',
      title: 'Modification de la politique',
      body: (
        <p>
          Cette politique peut évoluer. La version en vigueur est celle publiée sur cette page. Voir aussi nos <Link href="/mentions-legales">mentions légales</Link> et nos{' '}
          <Link href="/conditions-generales-de-vente">conditions générales de vente</Link>.
        </p>
      ),
    },
  ];

  return <LegalDocument kicker="Données personnelles" title="Politique de confidentialité" updatedAt={legal.updated_at} sections={sections} />;
}
