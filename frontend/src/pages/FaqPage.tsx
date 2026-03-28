import { Link } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";
import { usePageSeo } from "../lib/usePageSeo";

const FAQ_SECTIONS = [
  {
    title: "Comment fonctionne une campagne ?",
    items: [
      {
        question: "Qu'est-ce qu'une campagne sur la plateforme ?",
        answer:
          "Une campagne est une cagnotte solidaire publiée pour financer un besoin précis. Chaque page affiche son objectif, son échéance, sa progression et les dons publics récents quand le donateur choisit de les rendre visibles.",
      },
      {
        question: "Que se passe-t-il avant la publication ?",
        answer:
          "La campagne est d'abord enregistrée puis relue avant publication. Cette vérification permet d'écarter les contenus incomplets, trompeurs ou non conformes au cadre de la plateforme.",
      },
      {
        question: "Que voit le public une fois la campagne publiée ?",
        answer:
          "Les visiteurs voient uniquement les campagnes publiées. Ils peuvent consulter le titre, le contexte, la catégorie, la date de fin, le montant collecté, l'objectif et, selon les choix des contributeurs, les derniers dons publics.",
      },
    ],
  },
  {
    title: "Comment créer une cagnotte ?",
    items: [
      {
        question: "Quelles informations faut-il renseigner ?",
        answer:
          "Pour créer une cagnotte, il faut au minimum un titre clair, une description suffisamment détaillée, un montant cible et une date de fin. Une catégorie et une image de couverture peuvent aussi être ajoutées.",
      },
      {
        question: "Peut-on enregistrer sans publier tout de suite ?",
        answer:
          "Oui. La création permet d'enregistrer une campagne avant de la soumettre. Cela laisse le temps de relire le contenu, d'ajuster le montant cible ou d'améliorer la présentation avant validation.",
      },
      {
        question: "Quand la campagne devient-elle visible ?",
        answer:
          "Elle devient visible uniquement après validation et publication. Tant que cette étape n'est pas terminée, elle n'apparaît pas dans la liste publique des cagnottes.",
      },
    ],
  },
  {
    title: "Comment participer ?",
    items: [
      {
        question: "Faut-il un compte pour faire un don ?",
        answer:
          "Non. Le parcours de participation est conçu pour rester simple. Le donateur renseigne ses informations utiles, son montant, un message s'il le souhaite, puis continue vers le paiement sécurisé.",
      },
      {
        question: "Quels moyens de paiement sont proposés ?",
        answer:
          "Le paiement passe par PayDunya avec les moyens actuellement affichés dans le parcours : Orange Money, Wave, carte bancaire et Free Money selon les disponibilités proposées par le prestataire.",
      },
      {
        question: "Peut-on participer anonymement ?",
        answer:
          "Oui. Le donateur peut choisir de masquer publiquement son nom sur la liste des dons. Les informations nécessaires au traitement du paiement restent toutefois utilisées pour la transaction.",
      },
    ],
  },
  {
    title: "Comment fonctionnent les commissions ?",
    items: [
      {
        question: "La plateforme prend-elle une commission sur les dons ?",
        answer:
          "La promesse actuelle de la plateforme est de ne pas ajouter de commission propre au service sur le montant du don. Le donateur paie donc le montant qu'il choisit, hors frais éventuels liés au prestataire de paiement.",
      },
      {
        question: "Y a-t-il des frais de paiement ?",
        answer:
          "Des frais peuvent exister du côté du prestataire de paiement selon le moyen utilisé. Ces frais ne correspondent pas à une commission plateforme, mais aux coûts techniques du traitement du paiement.",
      },
      {
        question: "Comment cette information est-elle présentée ?",
        answer:
          "La page de campagne et le parcours de participation doivent rester explicites sur ce point : ce qui relève du don, ce qui relève du paiement, et l'absence de marge cachée prélevée par la plateforme.",
      },
    ],
  },
];

export function FaqPage() {
  usePageSeo({
    title: "FAQ",
    description:
      "Questions fréquentes sur le fonctionnement d'une campagne, sa création, la participation, les moyens de paiement et les commissions.",
    canonicalPath: "/faq",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_SECTIONS.flatMap((section) =>
        section.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      ),
    },
  });

  return (
    <div className="page faq-page">
      <section className="page-section">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions fréquentes"
          description="Le fonctionnement d'une campagne, sa création, la participation, les moyens de paiement et la question des commissions."
        />

        <div className="faq-intro panel">
          <div className="faq-intro__copy">
            <strong>Tout ce qu'il faut comprendre avant de lancer ou soutenir une cagnotte.</strong>
            <p>
              Cette page rassemble les réponses essentielles pour expliquer
              clairement le parcours d'une campagne, de sa création jusqu'au don.
            </p>
          </div>
          <div className="faq-intro__actions">
            <Link to="/inscription" className="button">
              Créer une cagnotte
            </Link>
            <Link to="/cagnottes" className="button button--ghost">
              Voir les cagnottes
            </Link>
          </div>
        </div>

        <div className="faq-sections">
          {FAQ_SECTIONS.map((section, sectionIndex) => (
            <section className="faq-section" key={section.title}>
              <div className="faq-section__header">
                <span className="tag">Thème {sectionIndex + 1}</span>
                <h2>{section.title}</h2>
              </div>

              <div className="faq-list">
                {section.items.map((item, itemIndex) => (
                  <details
                    className="faq-item"
                    key={item.question}
                    open={sectionIndex === 0 && itemIndex === 0}
                  >
                    <summary className="faq-item__summary">{item.question}</summary>
                    <div className="faq-item__content">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
