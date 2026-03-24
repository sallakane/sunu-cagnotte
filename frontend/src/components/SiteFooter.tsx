import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__lead">
        <div className="site-footer__intro">
          <span className="tag">Initiative solidaire</span>
          <strong>Sunu Cagnotte</strong>
          <p>
            Une plateforme pour rendre les cagnottes plus lisibles, plus fiables
            et plus adaptees au contexte senegalais.
          </p>
        </div>

        <div className="site-footer__cta">
          <Link to="/inscription" className="button">
            Lancer une cagnotte
          </Link>
          <Link to="/cagnottes" className="button button--ghost">
            Voir les campagnes
          </Link>
        </div>
      </div>

      <div className="site-footer__grid">
        <div className="site-footer__column">
          <span className="site-footer__title">Navigation</span>
          <div className="site-footer__links">
            <Link to="/cagnottes">Cagnottes</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/qui-sommes-nous">Qui sommes-nous</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div className="site-footer__column">
          <span className="site-footer__title">Informations</span>
          <div className="site-footer__links">
            <Link to="/mentions-legales">Mentions legales</Link>
            <Link to="/politique-confidentialite">Politique de confidentialite</Link>
            <Link to="/cgu">CGU</Link>
          </div>
        </div>

        <div className="site-footer__column">
          <span className="site-footer__title">Paiement</span>
          <p className="site-footer__text">
            Paiement securise via PayDunya, avec les moyens disponibles dans le
            parcours de contribution.
          </p>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>© 2026 Sunu Cagnotte</span>
        <span>Campagnes publiees apres validation</span>
      </div>
    </footer>
  );
}
