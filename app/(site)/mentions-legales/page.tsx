import type { Metadata } from 'next';
import Link from 'next/link';
import LegalDocument, { Fill, type LegalSection } from '@/components/site/LegalDocument';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Mentions légales', description: 'Mentions légales du site EL ROPHE : éditeur, hébergement, propriété intellectuelle.' };

/** Mentions légales : informations société dans Pilotage › Personnalisation › Légal */
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
      id: 'donnees',
      title: 'Données personnelles et cookies',
      body: (
        <p>
          La collecte et l’utilisation de vos données personnelles, vos droits et l’usage des cookies sont détaillés dans notre{' '}
          <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
        </p>
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

  return <LegalDocument kicker="Informations légales" title="Mentions légales" updatedAt={legal.updated_at} sections={sections} />;
}
