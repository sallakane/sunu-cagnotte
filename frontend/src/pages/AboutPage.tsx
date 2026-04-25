import { Link } from "react-router-dom";
import { usePageSeo } from "../lib/usePageSeo";

const VALUES = [
  {
    icon: "V",
    title: "Vérification",
    description:
      "Chaque cagnotte est examinée par l'équipe avant d'être publiée. Aucune campagne non vérifiée n'est visible du public.",
  },
  {
    icon: "T",
    title: "Transparence",
    description:
      "Les montants collectés, le nombre de contributeurs et la progression sont affichés en temps réel sur chaque page de cagnotte.",
  },
  {
    icon: "A",
    title: "Accessibilité",
    description:
      "Contribution par Orange Money, Wave ou Free Money. Pas de carte bancaire, pas de compte requis pour participer.",
  },
  {
    icon: "C",
    title: "Communauté",
    description:
      "Plateforme à but non lucratif conçue pour les réalités locales. Les retours de la communauté guident chaque évolution.",
  },
];

export function AboutPage() {
  usePageSeo({
    title: "Qui sommes-nous",
    description:
      "Sunu Cagnotte est une initiative sénégalaise à but non lucratif pour rendre les cagnottes en ligne accessibles, vérifiées et adaptées aux usages locaux.",
    canonicalPath: "/qui-sommes-nous",
  });

  return (
    <div className="page page--about">
      <section className="hero">
        <div className="hero__copy">
          <span className="hero__eyebrow">Qui sommes-nous</span>
          <h1>Une initiative sénégalaise pour une solidarité numérique</h1>
          <p>
            Sunu Cagnotte est une plateforme à but non lucratif. Elle est née d'un constat
            simple : beaucoup d'initiatives solidaires s'organisent déjà au Sénégal, mais les
            outils disponibles restent peu accessibles, peu localisés et insuffisamment rassurants.
            Nous avons voulu changer ça.
          </p>
          <div className="hero__actions">
            <Link className="button" to="/cagnottes">Explorer les cagnottes</Link>
            <Link className="button button--ghost" to="/contact">Nous écrire</Link>
          </div>
        </div>

        <div className="hero__panel">
          <article className="hero-card hero-card--accent">
            <strong>0 % de commission</strong>
            <p>
              Nous ne prélevons aucune commission sur les montants collectés. Chaque franc
              versé va intégralement à la cagnotte choisie, déduction faite des seuls frais
              de paiement mobile de l'opérateur.
            </p>
          </article>
          <article className="hero-card">
            <strong>Vérification humaine</strong>
            <p>
              Aucune campagne n'est publiée sans examen préalable de l'équipe.
              C'est ce qui nous distingue des plateformes ouvertes sans contrôle.
            </p>
          </article>
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <span>Nos valeurs</span>
          <h2>Ce qui guide chaque décision</h2>
          <p>Quatre principes fondent la façon dont Sunu Cagnotte est conçue et gérée.</p>
        </div>

        <div className="feature-grid">
          {VALUES.map((value) => (
            <article key={value.title} className="feature-card about-value-card">
              <span className="about-value-card__icon" aria-hidden="true">{value.icon}</span>
              <strong>{value.title}</strong>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="about-nonprofit">
          <div className="about-nonprofit__copy">
            <span className="tag">But non lucratif</span>
            <h2>Une plateforme qui n'a pas d'actionnaire à satisfaire</h2>
            <p>
              Sunu Cagnotte ne cherche pas à maximiser un profit. Les décisions sont
              prises dans l'intérêt des porteurs de projet et de leurs contributeurs,
              pas dans celui d'investisseurs. Si la plateforme évolue, c'est parce que
              la communauté le demande — et vos idées comptent autant que les nôtres.
            </p>
            <Link className="button" to="/contact?type=suggestion">Partager une idée</Link>
          </div>
          <div className="about-nonprofit__aside">
            <article className="about-stat">
              <strong>Sénégal</strong>
              <span>Plateforme locale, pour les besoins locaux</span>
            </article>
            <article className="about-stat">
              <strong>Mobile-first</strong>
              <span>Pensée pour Orange Money, Wave et Free Money</span>
            </article>
            <article className="about-stat">
              <strong>Équipe restreinte</strong>
              <span>Chaque message reçu est lu et traité par une personne réelle</span>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section narrow">
        <div className="panel about-cta">
          <h2>Une question ou une idée ?</h2>
          <p>
            Sunu Cagnotte est en construction continue. Si vous souhaitez signaler un
            problème, proposer une amélioration ou simplement en savoir plus, l'équipe
            vous répond.
          </p>
          <div className="hero__actions">
            <Link className="button" to="/contact">Contacter l'équipe</Link>
            <Link className="button button--ghost" to="/cagnottes">Voir les cagnottes</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
