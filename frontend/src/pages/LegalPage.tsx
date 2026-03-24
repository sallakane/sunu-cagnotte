import { usePageSeo } from "../lib/usePageSeo";

type LegalPageKind = "mentions" | "privacy" | "terms";

type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalContent = {
  eyebrow: string;
  title: string;
  intro: string;
  note: string;
  sections: LegalSection[];
};

const LEGAL_CONTENT: Record<LegalPageKind, LegalContent> = {
  mentions: {
    eyebrow: "Cadre legal",
    title: "Mentions legales",
    intro:
      "Informations generales relatives a l'editeur de la plateforme, a son hebergement et aux conditions generales de mise a disposition du site.",
    note:
      "Cette base doit etre completee avant mise en production avec l'identite legale exacte de l'editeur, son adresse, ses contacts et les informations d'hebergement definitives.",
    sections: [
      {
        title: "Editeur de la plateforme",
        paragraphs: [
          "La plateforme Sunu Cagnotte est exploitee par une structure a but non lucratif ou un porteur de projet solidaire, dont les informations d'identification completes doivent etre precisees avant ouverture publique du service.",
          "Doivent notamment etre indiques sur cette page: la denomination de la structure, sa forme juridique, son siege social, une adresse email de contact, ainsi que toute reference administrative ou d'immatriculation applicable.",
        ],
      },
      {
        title: "Hebergement et infrastructure technique",
        paragraphs: [
          "Le site et ses donnees sont heberges par un prestataire technique distinct de l'editeur. Les references completes de l'hebergeur, son adresse et ses moyens de contact doivent etre ajoutes dans la version definitive.",
          "L'editeur s'efforce de maintenir un niveau de disponibilite raisonnable du service, sans pouvoir garantir une accessibilite continue en cas de maintenance, d'incident technique ou d'indisponibilite du reseau.",
        ],
      },
      {
        title: "Objet du service",
        paragraphs: [
          "La plateforme permet la creation, la publication et la consultation de cagnottes solidaires, ainsi que la participation financiere a ces campagnes via un prestataire de paiement tiers.",
          "Le site a pour finalite de faciliter la presentation de besoins, la collecte de contributions et la mise en relation entre organisateurs de campagnes et donateurs, dans un cadre modere et lisible.",
        ],
      },
      {
        title: "Propriete intellectuelle",
        paragraphs: [
          "Les elements visuels, textuels, graphiques, logiciels et plus largement les contenus composant la plateforme sont proteges par les regles applicables a la propriete intellectuelle.",
          "Sauf autorisation expresse, toute reproduction, adaptation, diffusion ou reutilisation substantielle des contenus du site est interdite.",
        ],
      },
      {
        title: "Responsabilite editoriale et contenus publies",
        paragraphs: [
          "L'editeur met en place une moderation avant publication afin de renforcer la qualite et la fiabilite des campagnes rendues publiques. Cette moderation ne vaut toutefois pas garantie absolue sur l'exactitude, l'exhaustivite ou l'evolution ulterieure des informations fournies par les organisateurs.",
          "Les createurs de campagnes demeurent responsables des contenus, descriptions, images et informations qu'ils soumettent via la plateforme.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "Toute question relative au fonctionnement du site, a son contenu ou a l'exercice d'un droit peut etre adressee a l'editeur via la page de contact ou a l'adresse officielle qui devra etre mentionnee ici.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Donnees personnelles",
    title: "Politique de confidentialite",
    intro:
      "Cette page explique quelles donnees sont collecte es, dans quel but, comment elles sont utilisees et quels droits peuvent etre exerces par les utilisateurs et les contributeurs.",
    note:
      "Le contenu ci-dessous constitue une base serieuse mais reste a ajuster selon la structure juridique exacte du projet, sa politique cookies et ses obligations locales ou internationales applicables.",
    sections: [
      {
        title: "Donnees collecte es",
        paragraphs: [
          "La plateforme peut collecter des donnees d'identification et de contact lors de la creation d'un compte, de la creation d'une campagne, de l'envoi d'un message ou d'une participation a une cagnotte.",
          "Selon les cas, cela peut inclure le nom, le prenom, l'email, le numero de telephone, le contenu d'une campagne, le montant d'une participation, ainsi que certaines informations liees au paiement ou au suivi administratif de la transaction.",
        ],
      },
      {
        title: "Finalites du traitement",
        paragraphs: [
          "Les donnees sont traitees pour permettre la gestion des comptes, la moderation et la publication des campagnes, le traitement des contributions, le suivi des transactions, la prevention des usages abusifs et la reponse aux demandes de contact.",
          "Certaines donnees peuvent egalement etre conservees pour satisfaire aux obligations legales, comptables, de securite ou de preuve.",
        ],
        bullets: [
          "creer et administrer un compte utilisateur",
          "publier et moderer une campagne",
          "traiter une participation et son suivi",
          "repondre aux demandes de support ou de contact",
          "assurer la securite et la tracabilite du service",
        ],
      },
      {
        title: "Base juridique",
        paragraphs: [
          "Les traitements peuvent reposer, selon les cas, sur l'execution du service demande, le respect d'obligations legales, l'interet legitime de l'editeur a securiser la plateforme ou, lorsque cela est requis, le consentement de la personne concernee.",
        ],
      },
      {
        title: "Affichage public et anonymat",
        paragraphs: [
          "Lors d'une contribution, le donateur peut choisir un affichage public anonyme de son don. Ce choix agit sur la visibilite publique du nom, mais ne supprime pas les informations necessaires au traitement du paiement, au suivi administratif ou a la prevention de la fraude.",
        ],
      },
      {
        title: "Destinataires des donnees",
        paragraphs: [
          "Les donnees sont accessibles, dans la limite de ce qui est necessaire, a l'editeur de la plateforme, a ses prestataires techniques et au prestataire de paiement utilise pour finaliser les transactions.",
          "Les donnees ne doivent pas etre communiquees a des tiers non autorises, sauf obligation legale, demande legitime d'une autorite competente ou necessite strictement liee a l'exploitation du service.",
        ],
      },
      {
        title: "Conservation des donnees",
        paragraphs: [
          "Les donnees sont conservees pendant une duree proportionnee aux finalites du service, puis archivees ou supprimees selon leur nature, les contraintes techniques et les obligations legales applicables.",
          "Les informations relatives aux paiements et a la preuve des transactions peuvent etre conservees plus longtemps que les simples donnees de navigation ou de contact.",
        ],
      },
      {
        title: "Securite",
        paragraphs: [
          "L'editeur met en oeuvre des mesures raisonnables de securite pour proteger les donnees contre l'acces non autorise, la perte, l'alteration ou la divulgation illicite.",
          "Malgre ces efforts, aucun service en ligne ne peut garantir une securite absolue. Les utilisateurs sont invites a proteger leurs identifiants et a signaler tout incident suspect.",
        ],
      },
      {
        title: "Droits des personnes",
        paragraphs: [
          "Sous reserve du cadre juridique applicable, chaque personne peut demander l'acces a ses donnees, leur rectification, leur suppression, la limitation de certains traitements ou, lorsque cela est possible, s'opposer a leur utilisation.",
          "Les demandes peuvent etre adressees via les moyens de contact mentionnes sur le site. Une preuve d'identite peut etre demandee lorsque cela est necessaire pour securiser la reponse.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Regles d'utilisation",
    title: "Conditions generales d'utilisation",
    intro:
      "Les presentes conditions definissent les regles d'acces et d'utilisation de la plateforme, ainsi que les responsabilites respectives des organisateurs, contributeurs et administrateurs du service.",
    note:
      "Cette version constitue une base d'encadrement pour le service. Elle doit etre relue et validee avant production, en particulier sur les volets paiements, responsabilites et droit applicable.",
    sections: [
      {
        title: "Objet des CGU",
        paragraphs: [
          "Les presentes conditions ont pour objet d'encadrer l'utilisation de la plateforme Sunu Cagnotte, la creation de campagnes, la consultation des cagnottes publiees et la participation financiere via le service.",
        ],
      },
      {
        title: "Acces au service",
        paragraphs: [
          "Le site est accessible aux visiteurs pour la consultation des campagnes publiees. Certaines fonctionnalites, notamment la creation et l'administration d'une cagnotte, peuvent necessiter la creation d'un compte.",
          "L'utilisateur s'engage a fournir des informations exactes, actuelles et sinceres lors de son inscription ou de l'utilisation des formulaires proposes.",
        ],
      },
      {
        title: "Creation et publication d'une campagne",
        paragraphs: [
          "L'organisateur d'une campagne est responsable des informations qu'il publie ou soumet a validation: titre, description, image, categorie, montant cible et toute information relative a la cause presentee.",
          "La plateforme peut refuser, suspendre ou retirer une campagne contraire a son cadre editorial, trompeuse, incomplete, illicite ou incompatible avec les objectifs du service.",
        ],
        bullets: [
          "la campagne doit reposer sur une presentation loyale et intelligible",
          "les informations essentielles ne doivent pas etre mensongeres ou trompeuses",
          "la plateforme peut demander des precisions avant publication",
        ],
      },
      {
        title: "Participation et paiement",
        paragraphs: [
          "Le donateur peut participer a une campagne publiee via le prestataire de paiement integre au service. Le paiement est traite via PayDunya et les moyens de paiement effectivement proposes dans le parcours au moment de la transaction.",
          "Le donateur doit verifier le montant saisi, les informations communiquees et, le cas echeant, son choix d'affichage public anonyme avant validation du paiement.",
        ],
      },
      {
        title: "Commissions et frais",
        paragraphs: [
          "La plateforme n'a pas vocation a prelever une commission propre sur les dons si cette absence de commission est affichee dans le parcours. En revanche, des frais techniques ou frais de traitement peuvent etre appliques par le prestataire de paiement selon le moyen utilise.",
          "L'utilisateur reconnait que les frais lies au paiement relevent du cadre operationnel du prestataire et non d'une marge cachee de la plateforme, sauf indication contraire explicite.",
        ],
      },
      {
        title: "Responsabilites",
        paragraphs: [
          "La plateforme agit comme un service de mise a disposition, d'edition et de moderation. Elle ne garantit pas l'aboutissement d'une collecte, ni la reussite de l'objectif financier d'une campagne.",
          "L'organisateur reste responsable de l'usage des fonds collectes, des engagements qu'il prend envers les contributeurs et de la conformite des informations diffusees.",
        ],
      },
      {
        title: "Suspension, limitation et suppression",
        paragraphs: [
          "L'editeur peut suspendre ou limiter l'acces a tout ou partie du service en cas de manquement aux presentes conditions, de comportement abusif, de suspicion de fraude, de risque pour la securite du service ou de demande emanant d'une autorite competente.",
        ],
      },
      {
        title: "Evolution des conditions",
        paragraphs: [
          "Les presentes conditions peuvent evoluer pour tenir compte de l'evolution du service, du cadre juridique, des moyens de paiement ou des regles internes de moderation. La version en vigueur est celle publiee sur le site au moment de la consultation.",
        ],
      },
    ],
  },
};

type LegalPageProps = {
  kind: LegalPageKind;
};

export function LegalPage({ kind }: LegalPageProps) {
  const content = LEGAL_CONTENT[kind];

  usePageSeo({
    title: content.title,
    description: content.intro,
    canonicalPath:
      kind === "mentions"
        ? "/mentions-legales"
        : kind === "privacy"
          ? "/politique-confidentialite"
          : "/cgu",
  });

  return (
    <div className="page">
      <section className="page-section narrow">
        <div className="section-heading">
          <span>{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
        </div>

        <article className="panel prose legal-prose">
          <div className="legal-note">
            <strong>Note de cadrage</strong>
            <p>{content.note}</p>
          </div>

          {content.sections.map((section) => (
            <section key={section.title} className="legal-section">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </section>
    </div>
  );
}
