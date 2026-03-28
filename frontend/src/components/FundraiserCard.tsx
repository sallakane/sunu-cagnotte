import { Link } from "react-router-dom";
import { formatXof } from "../lib/currency";
import type { FundraiserSummary } from "../types";
import { ProgressBar } from "./ProgressBar";

type FundraiserCardProps = {
  fundraiser: FundraiserSummary;
};

export function FundraiserCard({ fundraiser }: FundraiserCardProps) {
  return (
    <article className="fundraiser-card">
      {fundraiser.coverImage ? (
        <img
          className="fundraiser-card__image"
          src={fundraiser.coverImage}
          alt={fundraiser.title}
        />
      ) : (
        <div className="fundraiser-card__placeholder">Cagnotte solidaire</div>
      )}
      <div className="fundraiser-card__content">
        <div className="fundraiser-card__eyebrow">
          <span>{fundraiser.category ?? "Solidarité"}</span>
          <span>{fundraiser.contributorCount} contributeurs</span>
        </div>
        <h3>{fundraiser.title}</h3>
        <p>{fundraiser.excerpt}</p>
        <div className="fundraiser-card__stats">
          <strong>{formatXof(fundraiser.collectedAmount)}</strong>
          <span>sur {formatXof(fundraiser.targetAmount)}</span>
        </div>
        <ProgressBar value={fundraiser.progressPercentage} />
        <div className="fundraiser-card__footer">
          <span>{fundraiser.progressPercentage}% atteints</span>
          <span>{fundraiser.daysRemaining} jours restants</span>
        </div>
        <div className="fundraiser-card__cta">
          <Link className="button button--ghost" to={`/cagnottes/${fundraiser.slug}`}>
            Voir la cagnotte
          </Link>
        </div>
      </div>
    </article>
  );
}
