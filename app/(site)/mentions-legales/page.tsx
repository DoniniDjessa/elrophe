import type { Metadata } from 'next';
import Link from 'next/link';
import LegalDocument, { Fill, type LegalSection } from '@/components/site/LegalDocument';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Mentions légales et confidentialité', description: 'Mentions légales, données personnelles et cookies du site EL ROPHE.' };

/** Mentions légales et politique de confidentialité : informations société dans Pilotage › Personnalisation › Légal */
export default async function MentionsPage() {
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
      id: 'editeur',
      title: 'Éditeur du site',
      body: (
        <>
          <p>Le site EL ROPHE est édité par :</p>
          <ul>
            <li>
              <strong>Raison sociale :</strong> <Fill value={legal.company} />
            </li>
            <li>
              <strong>Forme juridique :</strong> <Fill value={legal.legal_form} /> — <strong>capital :</strong> <Fill value={legal.capital} />
            </li>
            <li>
              <strong>RCCM :</strong> <Fill value={legal.rccm} /> — <strong>NCC :</strong> <Fill value={legal.ncc} />
            </li>
            <li>
              <strong>Siège social :</strong> <Fill value={legal.address} />
            </li>
            <li>
              <strong>Contact :</strong> {contact}
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'publication',
      title: 'Directeur de la publication',
      body: (
        <p>
          <Fill value={legal.director} />
        </p>
      ),
    },
    {
      id: 'hebergement',
      title: 'Hébergement',
      body: (
        <p>
          Le site est hébergé par <Fill value={legal.host_name} />, <Fill value={legal.host_address} />.
        </p>
      ),
    },
    {
      id: 'propriete',
      title: 'Propriété intellectuelle',
      body: (
        <p>
          L’ensemble des contenus du site (textes, photographies, logos, marque EL ROPHE, mise en page) est protégé par le droit de la propriété intellectuelle. Toute
          reproduction ou réutilisation, totale ou partielle, sans autorisation écrite préalable est interdite.
        </p>
      ),
    },
    {
      id: 'confidentialite',
      title: 'Données personnelles (politique de confidentialité)',
      body: (
        <>
          <p>
            Nous traitons vos données personnelles dans le respect de la loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la protection des données à
            caractère personnel. L’Autorité de régulation des télécommunications de Côte d’Ivoire (ARTCI) veille à son application.
          </p>
          <p>
            <strong>Données collectées :</strong> nom, numéro de téléphone, adresse e-mail (facultative), adresse de livraison, instructions de livraison et contenu de
            vos commandes.
          </p>
          <p>
            <strong>Finalités :</strong> traiter et livrer vos commandes, vous contacter pour les confirmer, assurer le service client et le suivi de commande. Ces
            traitements sont nécessaires à l’exécution de la vente.
          </p>
          <p>
            <strong>Destinataires :</strong> notre équipe et, pour la seule livraison, nos livreurs. Vos données ne sont jamais vendues ni cédées à des tiers à des
            fins commerciales.
          </p>
          <p>
            <strong>Durée de conservation :</strong> le temps nécessaire au traitement de la commande et au respect de nos obligations légales, notamment comptables.
          </p>
          <p>
            <strong>Vos droits :</strong> vous pouvez demander l’accès à vos données, leur rectification, leur suppression ou vous opposer à leur traitement, {contact}.
            Vous pouvez également saisir l’ARTCI.
          </p>
        </>
      ),
    },
    {
      id: 'cookies',
      title: 'Cookies et stockage local',
      body: (
        <>
          <p>
            Le site enregistre votre panier et vos favoris dans votre navigateur (stockage local) pour les conserver d’une visite à l’autre. Ces informations ne nous
            sont pas transmises.
          </p>
          <p>
            Le site peut utiliser un outil de mesure publicitaire (pixel Meta) afin de mesurer l’efficacité de nos campagnes. Vous pouvez limiter ce suivi depuis les
            réglages de votre navigateur ou de votre compte Meta.
          </p>
        </>
      ),
    },
    {
      id: 'avertissement',
      title: 'Avertissement sur les produits',
      body: (
        <p>
          Les compléments alimentaires ne se substituent pas à une alimentation variée et équilibrée ni à un mode de vie sain. Ne pas dépasser la dose journalière
          recommandée. Tenir hors de portée des enfants. Demandez conseil à un professionnel de santé en cas de grossesse, d’allaitement ou de traitement médical. Les
          informations présentées sur le site ne constituent pas un avis médical.
        </p>
      ),
    },
    {
      id: 'responsabilite',
      title: 'Responsabilité',
      body: (
        <p>
          Nous veillons à l’exactitude des informations publiées, sans pouvoir garantir l’absence d’erreur ou d’interruption du site. Les conditions de vente sont
          précisées dans nos <Link href="/conditions-generales-de-vente">conditions générales de vente</Link>.
        </p>
      ),
    },
  ];

  return <LegalDocument title="Mentions légales" updatedAt={legal.updated_at} sections={sections} />;
}
