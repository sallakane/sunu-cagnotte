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
          "Une campagne est une cagnotte solidaire publiee pour financer un besoin precis. Chaque page affiche son objectif, son echeance, sa progression et les dons publics recents quand le donateur choisit de les rendre visibles.",
      },
      {
        question: "Que se passe-t-il avant la publication ?",
        answer:
          "La campagne est d'abord enregistree puis relue avant publication. Cette verification permet d'ecarter les contenus incomplets, trompeurs ou non conformes au cadre de la plateforme.",
      },
      {
        question: "Que voit le public une fois la campagne publiee ?",
        answer:
          "Les visiteurs voient uniquement les campagnes publiees. Ils peuvent consulter le titre, le contexte, la categorie, la date de fin, le montant collecte, l'objectif et, selon les choix des contributeurs, les derniers dons publics.",
      },
    ],
  },
  {
    title: "Comment creer une cagnotte ?",
    items: [
      {
        question: "Quelles informations faut-il renseigner ?",
        answer:
          "Pour creer une cagnotte, il faut au minimum un titre clair, une description suffisamment detaillee, un montant cible et une date de fin. Une categorie et une image de couverture peuvent aussi etre ajoutees.",
      },
      {
        question: "Peut-on enregistrer sans publier tout de suite ?",
        answer:
          "Oui. La creation permet d'enregistrer une campagne avant de la soumettre. Cela laisse le temps de relire le contenu, d'ajuster le montant cible ou d'ameliorer la presentation avant validation.",
      },
      {
        question: "Quand la campagne devient-elle visible ?",
        answer:
          "Elle devient visible uniquement apres validation et publication. Tant que cette etape n'est pas terminee, elle n'apparait pas dans la liste publique des cagnottes.",
      },
    ],
  },
  {
    title: "Comment participer ?",
    items: [
      {
        question: "Faut-il un compte pour faire un don ?",
        answer:
          "Non. Le parcours de participation est concu pour rester simple. Le donateur renseigne ses informations utiles, son montant, un message s'il le souhaite, puis continue vers le paiement securise.",
      },
      {
        question: "Quels moyens de paiement sont proposes ?",
        answer:
          "Le paiement passe par PayDunya avec les moyens actuellement affiches dans le parcours: Orange Money, Wave, carte bancaire et Free Money selon les disponibilites proposees par le prestataire.",
      },
      {
        question: "Peut-on participer anonymement ?",
        answer:
          "Oui. Le donateur peut choisir de masquer publiquement son nom sur la liste des dons. Les informations necessaires au traitement du paiement restent toutefois utilisees pour la transaction.",
      },
    ],
  },
  {
    title: "Comment fonctionnent les commissions ?",
    items: [
      {
        question: "La plateforme prend-elle une commission sur les dons ?",
        answer:
          "La promesse actuelle de la plateforme est de ne pas ajouter de commission propre au service sur le montant du don. Le donateur paie donc le montant qu'il choisit, hors frais eventuels lies au prestataire de paiement.",
      },
      {
        question: "Y a-t-il des frais de paiement ?",
        answer:
          "Des frais peuvent exister du cote du prestataire de paiement selon le moyen utilise. Ces frais ne correspondent pas a une commission plateforme, mais aux couts techniques du traitement du paiement.",
      },
      {
        question: "Comment cette information est-elle presentee ?",
        answer:
          "La page de campagne et le parcours de participation doivent rester explicites sur ce point: ce qui releve du don, ce qui releve du paiement, et l'absence de marge cachee prelevee par la plateforme.",
      },
    ],
  },
];

export function FaqPage() {
  usePageSeo({
    title: "FAQ",
    description:
      "Questions frequentes sur le fonctionnement d'une campagne, sa creation, la participation, les moyens de paiement et les commissions.",
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
          title="Questions frequentes"
          description="Le fonctionnement d'une campagne, sa creation, la participation, les moyens de paiement et la question des commissions."
        />

        <div className="faq-intro panel">
          <div className="faq-intro__copy">
            <strong>Tout ce qu'il faut comprendre avant de lancer ou soutenir une cagnotte.</strong>
            <p>
              Cette page rassemble les reponses essentielles pour expliquer
              clairement le parcours d'une campagne, de sa creation jusqu'au don.
            </p>
          </div>
          <div className="faq-intro__actions">
            <Link to="/inscription" className="button">
              Creer une cagnotte
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
                <span className="tag">Theme {sectionIndex + 1}</span>
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
