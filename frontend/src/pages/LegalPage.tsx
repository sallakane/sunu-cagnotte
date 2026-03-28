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
    eyebrow: "Cadre légal",
    title: "Mentions légales",
    intro:
      "Informations générales relatives à l'éditeur de la plateforme, à son hébergement et aux conditions générales de mise à disposition du site.",
    note:
      "Cette base doit être complétée avant mise en production avec l'identité légale exacte de l'éditeur, son adresse, ses contacts et les informations d'hébergement définitives.",
    sections: [
      {
        title: "Éditeur de la plateforme",
        paragraphs: [
          "La plateforme Sunu Cagnotte est exploitée par une structure à but non lucratif ou un porteur de projet solidaire, dont les informations d'identification complètes doivent être précisées avant ouverture publique du service.",
          "Doivent notamment être indiqués sur cette page : la dénomination de la structure, sa forme juridique, son siège social, une adresse email de contact, ainsi que toute référence administrative ou d'immatriculation applicable.",
        ],
      },
      {
        title: "Hébergement et infrastructure technique",
        paragraphs: [
          "Le site et ses données sont hébergés par un prestataire technique distinct de l'éditeur. Les références complètes de l'hébergeur, son adresse et ses moyens de contact doivent être ajoutés dans la version définitive.",
          "L'éditeur s'efforce de maintenir un niveau de disponibilité raisonnable du service, sans pouvoir garantir une accessibilité continue en cas de maintenance, d'incident technique ou d'indisponibilité du réseau.",
        ],
      },
      {
        title: "Objet du service",
        paragraphs: [
          "La plateforme permet la création, la publication et la consultation de cagnottes solidaires, ainsi que la participation financière à ces campagnes via un prestataire de paiement tiers.",
          "Le site a pour finalité de faciliter la présentation de besoins, la collecte de contributions et la mise en relation entre organisateurs de campagnes et donateurs, dans un cadre modéré et lisible.",
        ],
      },
      {
        title: "Propriété intellectuelle",
        paragraphs: [
          "Les éléments visuels, textuels, graphiques, logiciels et plus largement les contenus composant la plateforme sont protégés par les règles applicables à la propriété intellectuelle.",
          "Sauf autorisation expresse, toute reproduction, adaptation, diffusion ou réutilisation substantielle des contenus du site est interdite.",
        ],
      },
      {
        title: "Responsabilité éditoriale et contenus publiés",
        paragraphs: [
          "L'éditeur met en place une modération avant publication afin de renforcer la qualité et la fiabilité des campagnes rendues publiques. Cette modération ne vaut toutefois pas garantie absolue sur l'exactitude, l'exhaustivité ou l'évolution ultérieure des informations fournies par les organisateurs.",
          "Les créateurs de campagnes demeurent responsables des contenus, descriptions, images et informations qu'ils soumettent via la plateforme.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "Toute question relative au fonctionnement du site, à son contenu ou à l'exercice d'un droit peut être adressée à l'éditeur via la page de contact ou à l'adresse officielle qui devra être mentionnée ici.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Données personnelles",
    title: "Politique de confidentialité",
    intro:
      "Cette page explique quelles données sont collectées, dans quel but, comment elles sont utilisées et quels droits peuvent être exercés par les utilisateurs et les contributeurs.",
    note:
      "Le contenu ci-dessous constitue une base sérieuse mais reste à ajuster selon la structure juridique exacte du projet, sa politique cookies et ses obligations locales ou internationales applicables.",
    sections: [
      {
        title: "Données collectées",
        paragraphs: [
          "La plateforme peut collecter des données d'identification et de contact lors de la création d'un compte, de la création d'une campagne, de l'envoi d'un message ou d'une participation à une cagnotte.",
          "Selon les cas, cela peut inclure le nom, le prénom, l'email, le numéro de téléphone, le contenu d'une campagne, le montant d'une participation, ainsi que certaines informations liées au paiement ou au suivi administratif de la transaction.",
        ],
      },
      {
        title: "Finalités du traitement",
        paragraphs: [
          "Les données sont traitées pour permettre la gestion des comptes, la modération et la publication des campagnes, le traitement des contributions, le suivi des transactions, la prévention des usages abusifs et la réponse aux demandes de contact.",
          "Certaines données peuvent également être conservées pour satisfaire aux obligations légales, comptables, de sécurité ou de preuve.",
        ],
        bullets: [
          "créer et administrer un compte utilisateur",
          "publier et modérer une campagne",
          "traiter une participation et son suivi",
          "répondre aux demandes de support ou de contact",
          "assurer la sécurité et la traçabilité du service",
        ],
      },
      {
        title: "Base juridique",
        paragraphs: [
          "Les traitements peuvent reposer, selon les cas, sur l'exécution du service demandé, le respect d'obligations légales, l'intérêt légitime de l'éditeur à sécuriser la plateforme ou, lorsque cela est requis, le consentement de la personne concernée.",
        ],
      },
      {
        title: "Affichage public et anonymat",
        paragraphs: [
          "Lors d'une contribution, le donateur peut choisir un affichage public anonyme de son don. Ce choix agit sur la visibilité publique du nom, mais ne supprime pas les informations nécessaires au traitement du paiement, au suivi administratif ou à la prévention de la fraude.",
        ],
      },
      {
        title: "Destinataires des données",
        paragraphs: [
          "Les données sont accessibles, dans la limite de ce qui est nécessaire, à l'éditeur de la plateforme, à ses prestataires techniques et au prestataire de paiement utilisé pour finaliser les transactions.",
          "Les données ne doivent pas être communiquées à des tiers non autorisés, sauf obligation légale, demande légitime d'une autorité compétente ou nécessité strictement liée à l'exploitation du service.",
        ],
      },
      {
        title: "Conservation des données",
        paragraphs: [
          "Les données sont conservées pendant une durée proportionnée aux finalités du service, puis archivées ou supprimées selon leur nature, les contraintes techniques et les obligations légales applicables.",
          "Les informations relatives aux paiements et à la preuve des transactions peuvent être conservées plus longtemps que les simples données de navigation ou de contact.",
        ],
      },
      {
        title: "Sécurité",
        paragraphs: [
          "L'éditeur met en oeuvre des mesures raisonnables de sécurité pour protéger les données contre l'accès non autorisé, la perte, l'altération ou la divulgation illicite.",
          "Malgré ces efforts, aucun service en ligne ne peut garantir une sécurité absolue. Les utilisateurs sont invités à protéger leurs identifiants et à signaler tout incident suspect.",
        ],
      },
      {
        title: "Droits des personnes",
        paragraphs: [
          "Sous réserve du cadre juridique applicable, chaque personne peut demander l'accès à ses données, leur rectification, leur suppression, la limitation de certains traitements ou, lorsque cela est possible, s'opposer à leur utilisation.",
          "Les demandes peuvent être adressées via les moyens de contact mentionnés sur le site. Une preuve d'identité peut être demandée lorsque cela est nécessaire pour sécuriser la réponse.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Règles d'utilisation",
    title: "Conditions générales d'utilisation",
    intro:
      "Les présentes conditions définissent les règles d'accès et d'utilisation de la plateforme, ainsi que les responsabilités respectives des organisateurs, contributeurs et administrateurs du service.",
    note:
      "Cette version constitue une base d'encadrement pour le service. Elle doit être relue et validée avant production, en particulier sur les volets paiements, responsabilités et droit applicable.",
    sections: [
      {
        title: "Objet des CGU",
        paragraphs: [
          "Les présentes conditions ont pour objet d'encadrer l'utilisation de la plateforme Sunu Cagnotte, la création de campagnes, la consultation des cagnottes publiées et la participation financière via le service.",
        ],
      },
      {
        title: "Accès au service",
        paragraphs: [
          "Le site est accessible aux visiteurs pour la consultation des campagnes publiées. Certaines fonctionnalités, notamment la création et l'administration d'une cagnotte, peuvent nécessiter la création d'un compte.",
          "L'utilisateur s'engage à fournir des informations exactes, actuelles et sincères lors de son inscription ou de l'utilisation des formulaires proposés.",
        ],
      },
      {
        title: "Création et publication d'une campagne",
        paragraphs: [
          "L'organisateur d'une campagne est responsable des informations qu'il publie ou soumet à validation : titre, description, image, catégorie, montant cible et toute information relative à la cause présentée.",
          "La plateforme peut refuser, suspendre ou retirer une campagne contraire à son cadre éditorial, trompeuse, incomplète, illicite ou incompatible avec les objectifs du service.",
        ],
        bullets: [
          "la campagne doit reposer sur une présentation loyale et intelligible",
          "les informations essentielles ne doivent pas être mensongères ou trompeuses",
          "la plateforme peut demander des précisions avant publication",
        ],
      },
      {
        title: "Participation et paiement",
        paragraphs: [
          "Le donateur peut participer à une campagne publiée via le prestataire de paiement intégré au service. Le paiement est traité via PayDunya et les moyens de paiement effectivement proposés dans le parcours au moment de la transaction.",
          "Le donateur doit vérifier le montant saisi, les informations communiquées et, le cas échéant, son choix d'affichage public anonyme avant validation du paiement.",
        ],
      },
      {
        title: "Commissions et frais",
        paragraphs: [
          "La plateforme n'a pas vocation à prélever une commission propre sur les dons si cette absence de commission est affichée dans le parcours. En revanche, des frais techniques ou frais de traitement peuvent être appliqués par le prestataire de paiement selon le moyen utilisé.",
          "L'utilisateur reconnaît que les frais liés au paiement relèvent du cadre opérationnel du prestataire et non d'une marge cachée de la plateforme, sauf indication contraire explicite.",
        ],
      },
      {
        title: "Responsabilités",
        paragraphs: [
          "La plateforme agit comme un service de mise à disposition, d'édition et de modération. Elle ne garantit pas l'aboutissement d'une collecte, ni la réussite de l'objectif financier d'une campagne.",
          "L'organisateur reste responsable de l'usage des fonds collectés, des engagements qu'il prend envers les contributeurs et de la conformité des informations diffusées.",
        ],
      },
      {
        title: "Suspension, limitation et suppression",
        paragraphs: [
          "L'éditeur peut suspendre ou limiter l'accès à tout ou partie du service en cas de manquement aux présentes conditions, de comportement abusif, de suspicion de fraude, de risque pour la sécurité du service ou de demande émanant d'une autorité compétente.",
        ],
      },
      {
        title: "Évolution des conditions",
        paragraphs: [
          "Les présentes conditions peuvent évoluer pour tenir compte de l'évolution du service, du cadre juridique, des moyens de paiement ou des règles internes de modération. La version en vigueur est celle publiée sur le site au moment de la consultation.",
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
