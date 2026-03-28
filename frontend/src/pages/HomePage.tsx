import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../app/AuthProvider";
import { FundraiserCard } from "../components/FundraiserCard";
import { SectionHeading } from "../components/SectionHeading";
import { apiRequest } from "../lib/api";
import { formatXof } from "../lib/currency";
import { usePageSeo } from "../lib/usePageSeo";
import type { FundraiserSummary } from "../types";

export function HomePage() {
  const auth = useAuth();
  const [fundraisers, setFundraisers] = useState<FundraiserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPublished, setTotalPublished] = useState(0);
  const totalCollected = fundraisers.reduce((sum, fundraiser) => sum + fundraiser.collectedAmount, 0);
  const totalContributors = fundraisers.reduce((sum, fundraiser) => sum + fundraiser.contributorCount, 0);
  const featuredFundraisers = fundraisers.slice(0, 3);

  usePageSeo({
    title: "Accueil",
    description:
      "Plateforme de cagnottes solidaires au Sénégal pour créer, publier et soutenir des campagnes vérifiées avec paiement mobile et carte bancaire.",
    canonicalPath: "/",
    image: "/banner/banniere.png",
  });

  useEffect(() => {
    let active = true;

    apiRequest<{ items: FundraiserSummary[]; meta: { total: number } }>("/fundraisers")
      .then((response) => {
        if (active) {
          setFundraisers(response.items);
          setTotalPublished(response.meta.total);
        }
      })
      .catch((requestError: Error) => {
        if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page page--home">
      <section className="home-hero">
        <div className="home-hero__media">
          <img
            className="home-hero__image"
            src="/banner/banniere.png"
            alt="Communauté réunie autour d'une cagnotte solidaire"
          />
        </div>

        <div className="home-hero__copy">
          <div className="home-hero__content">
            <span className="hero__eyebrow">Solidarité locale, confiance numérique</span>
            <h1>Des cagnottes utiles, crédibles et ancrées dans le Sénégal</h1>
            <p>
              Une plateforme à but non lucratif pour financer des besoins réels,
              mobiliser la diaspora et offrir à chacun un parcours de
              contribution clair et rassurant.
            </p>
            <div className="home-hero__trustline">
              <span>Validation humaine avant publication</span>
              <span>PayDunya, Orange Money, Wave, carte</span>
              <span>0% de commission plateforme</span>
            </div>
            <div className="home-hero__actions">
              <Link
                to={auth.isAuthenticated ? "/espace/cagnottes/nouvelle" : "/connexion"}
                className="button"
              >
                Créer une cagnotte
              </Link>
              <Link to="/cagnottes" className="button button--ghost">
                Explorer les cagnottes
              </Link>
            </div>
          </div>
        </div>

        <div className="home-hero__stats">
          <article className="home-stat home-stat--accent">
            <span className="home-stat__label">Publiees</span>
            <strong>{totalPublished}</strong>
            <span className="home-stat__meta">Cagnottes actuellement en ligne</span>
          </article>
          <article className="home-stat">
            <span className="home-stat__label">Contributeurs</span>
            <strong>{totalContributors}</strong>
            <span className="home-stat__meta">Contributions publiques visibles</span>
          </article>
          <article className="home-stat">
            <span className="home-stat__label">Collectes</span>
            <strong>{formatXof(totalCollected)}</strong>
            <span className="home-stat__meta">Montants publiés sur les campagnes en ligne</span>
          </article>
        </div>
      </section>

      <section className="page-section page-section--home-featured">
        <SectionHeading
          eyebrow="En ce moment"
          title="Trois campagnes mises en avant"
        />
        {!loading && !error && totalPublished > 0 ? (
          <div className="home-section-bar">
            <strong>{featuredFundraisers.length} mises en avant</strong>
            <span>sur {totalPublished} cagnottes publiées</span>
            <Link to="/cagnottes" className="detail-inline-link">
              Voir toutes les cagnottes
            </Link>
          </div>
        ) : null}
        {error ? <article className="panel">{error}</article> : null}
        {loading ? <article className="panel">Chargement des cagnottes...</article> : null}
        {!loading && !error && featuredFundraisers.length === 0 ? (
          <article className="panel">
            Aucune cagnotte publiée pour le moment. Les campagnes apparaîtront
            ici après validation.
          </article>
        ) : null}
        {!error && featuredFundraisers.length > 0 ? (
          <div className="grid">
            {featuredFundraisers.map((fundraiser) => (
              <FundraiserCard key={fundraiser.id} fundraiser={fundraiser} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
