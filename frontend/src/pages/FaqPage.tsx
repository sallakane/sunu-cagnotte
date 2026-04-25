import { Link } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";
import { usePageSeo } from "../lib/usePageSeo";

const DONOR_STEPS = [
  {
    emoji: "🔍",
    title: "Trouvez la cagnotte",
    desc: "Parcourez les cagnottes publiées et choisissez celle que vous souhaitez soutenir.",
  },
  {
    emoji: "📋",
    title: "Remplissez le formulaire",
    desc: "Indiquez votre prénom, votre montant et, si vous le souhaitez, un message d'encouragement.",
  },
  {
    emoji: "💳",
    title: "Validez le paiement",
    desc: "Payez en toute sécurité via Orange Money, Wave ou Free Money. Vous pouvez rester anonyme.",
  },
  {
    emoji: "✅",
    title: "C'est tout !",
    desc: "Votre don est confirmé immédiatement. Aucun compte, aucune inscription.",
  },
];

const CREATOR_STEPS = [
  {
    emoji: "👤",
    title: "Créez votre compte",
    desc: "Inscrivez-vous gratuitement avec votre adresse email. Cela ne prend qu'une minute.",
  },
  {
    emoji: "✏️",
    title: "Rédigez votre cagnotte",
    desc: "Renseignez le titre, la description, l'objectif en F CFA, la date de fin et une photo de couverture.",
  },
  {
    emoji: "📤",
    title: "Soumettez à validation",
    desc: "D'un clic, envoyez votre cagnotte à la modération. Vous pouvez aussi la sauvegarder en brouillon.",
  },
  {
    emoji: "⏱️",
    title: "Validation en moins de 3h",
    desc: "L'administrateur examine votre cagnotte et la publie dans les 3 heures maximum.",
  },
  {
    emoji: "🌐",
    title: "Votre cagnotte est en ligne",
    desc: "Elle apparaît sur la plateforme, visible par tous. Les dons peuvent commencer à affluer.",
  },
  {
    emoji: "💰",
    title: "Réception des fonds",
    desc: "À la date de fin, le modérateur vous transfère l'intégralité des fonds collectés.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Quels moyens de paiement sont acceptés ?",
    answer:
      "Les paiements sont traités par PayTech. Les moyens disponibles sont Orange Money, Wave et Free Money selon votre opérateur. Le parcours de paiement est entièrement sécurisé.",
  },
  {
    question: "Y a-t-il des frais ou une commission sur les dons ?",
    answer:
      "Sunu Cagnotte ne prélève aucune commission sur les dons. Des frais techniques minimes peuvent s'appliquer selon le moyen de paiement utilisé par le prestataire PayTech, mais il n'y a aucune marge cachée prélevée par la plateforme.",
  },
  {
    question: "Puis-je faire un don sans que mon nom soit visible ?",
    answer:
      "Oui. Dans le formulaire de don, cochez simplement \"Rester anonyme\". Votre nom n'apparaîtra pas sur la page publique de la cagnotte. Vos informations restent néanmoins utilisées pour traiter le paiement.",
  },
  {
    question: "Comment savoir quand ma cagnotte est validée ?",
    answer:
      "Vous recevez un email de confirmation dès que l'administrateur publie votre cagnotte. Vous pouvez aussi suivre son statut en temps réel depuis votre espace créateur.",
  },
  {
    question: "Que se passe-t-il si l'objectif n'est pas atteint à la date de fin ?",
    answer:
      "Les fonds collectés vous sont transmis dans tous les cas. Il n'y a pas de seuil minimum à atteindre. Chaque don compte, quelle que soit la somme totale collectée.",
  },
  {
    question: "Comment clôturer ma cagnotte avant la date prévue ?",
    answer:
      "Envoyez un message depuis la page Contact en précisant le titre de votre cagnotte. Le modérateur clôturera votre cagnotte et organisera le transfert des fonds collectés jusqu'à ce moment.",
  },
  {
    question: "Combien de temps pour recevoir les fonds après la clôture ?",
    answer:
      "Le modérateur prend en charge le transfert des fonds à la date de fin ou dès la clôture anticipée. Les délais dépendent ensuite du moyen de virement retenu.",
  },
  {
    question: "Puis-je modifier ma cagnotte après sa publication ?",
    answer:
      "Certaines informations (titre, description, objectif, date de fin) peuvent être ajustées depuis votre espace créateur. Tout changement majeur reste soumis à la relecture de l'administrateur.",
  },
];

export function FaqPage() {
  usePageSeo({
    title: "Comment ça marche",
    description:
      "Découvrez comment faire un don ou créer une cagnotte sur Sunu Cagnotte. Parcours simple, paiement sécurisé, validation rapide.",
    canonicalPath: "/comment-ca-marche",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  });

  return (
    <div className="page how-page">
      <section className="page-section">
        <SectionHeading
          eyebrow="Plateforme solidaire"
          title="Comment ça marche ?"
          description="Que vous souhaitiez soutenir une cause ou lancer votre propre collecte, tout est conçu pour être simple et rapide."
        />

        <div className="how-tracks">
          <div className="panel how-track">
            <div className="how-track__head">
              <span className="how-track__icon">🤝</span>
              <div>
                <span className="tag">Donateurs</span>
                <h2 className="how-track__title">Je veux faire un don</h2>
                <p className="how-track__subtitle">
                  Aucun compte requis. Quelques minutes suffisent.
                </p>
              </div>
            </div>

            <div className="how-steps">
              {DONOR_STEPS.map((step, i) => (
                <div className="how-step" key={step.title}>
                  <div className="how-step__num">
                    <span className="how-step__num-inner">{i + 1}</span>
                  </div>
                  <div className="how-step__body">
                    <p className="how-step__title">
                      <span className="how-step__emoji">{step.emoji}</span>{" "}
                      {step.title}
                    </p>
                    <p className="how-step__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="how-track__note">
              💡 <span>Pas besoin de créer un compte. Le parcours de don est ouvert à tous.</span>
            </div>

            <Link to="/cagnottes" className="button">
              Voir les cagnottes
            </Link>
          </div>

          <div className="panel how-track">
            <div className="how-track__head">
              <span className="how-track__icon">🚀</span>
              <div>
                <span className="tag">Créateurs</span>
                <h2 className="how-track__title">Je veux créer une cagnotte</h2>
                <p className="how-track__subtitle">
                  Inscription gratuite. Validation sous 3h.
                </p>
              </div>
            </div>

            <div className="how-steps">
              {CREATOR_STEPS.map((step, i) => (
                <div className="how-step" key={step.title}>
                  <div className="how-step__num">
                    <span className="how-step__num-inner">{i + 1}</span>
                  </div>
                  <div className="how-step__body">
                    <p className="how-step__title">
                      <span className="how-step__emoji">{step.emoji}</span>{" "}
                      {step.title}
                    </p>
                    <p className="how-step__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="how-track__note">
              📩 <span>Vous souhaitez clôturer avant la date de fin ?{" "}
                <strong>
                  <Link to="/contact">Contactez le modérateur</Link>
                </strong>{" "}
                et les fonds vous seront transférés rapidement.
              </span>
            </div>

            <Link to="/inscription" className="button">
              Créer mon compte
            </Link>
          </div>
        </div>

        <div className="faq-section">
          <div className="faq-section__header">
            <span className="tag">Questions fréquentes</span>
            <h2>Tout ce qu'il faut savoir</h2>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <details
                className="faq-item"
                key={item.question}
                open={i === 0}
              >
                <summary className="faq-item__summary">{item.question}</summary>
                <div className="faq-item__content">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
