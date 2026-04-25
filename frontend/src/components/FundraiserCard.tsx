import { Link } from "react-router-dom";
import { FormatXof } from "./FormatXof";
import type { FundraiserSummary } from "../types";
import { ProgressBar } from "./ProgressBar";

type FundraiserCardProps = {
  fundraiser: FundraiserSummary;
};

export function FundraiserCard({ fundraiser }: FundraiserCardProps) {
  const fundraiserPath = `/cagnottes/${fundraiser.slug}`;

  return (
    <article className="fundraiser-card">
      <Link to={fundraiserPath} aria-label={`Ouvrir la cagnotte ${fundraiser.title}`}>
        {fundraiser.coverImage ? (
          <img
            className="fundraiser-card__image"
            src={fundraiser.coverImage}
            alt={fundraiser.title}
          />
        ) : (
          <div className="fundraiser-card__placeholder">Cagnotte solidaire</div>
        )}
      </Link>
      <div className="fundraiser-card__content">
        <div className="fundraiser-card__eyebrow">
          <span>{fundraiser.category ?? "Solidarité"}</span>
          <span>{fundraiser.contributorCount} contributeurs</span>
        </div>
        <h3>
          <Link to={fundraiserPath}>{fundraiser.title}</Link>
        </h3>
        <p>{fundraiser.excerpt}</p>
        <div className="fundraiser-card__stats">
          <strong><FormatXof amount={fundraiser.collectedAmount} /></strong>
          <span>sur <FormatXof amount={fundraiser.targetAmount} /></span>
        </div>
        <ProgressBar value={fundraiser.progressPercentage} />
        <div className="fundraiser-card__footer">
          <span>{fundraiser.progressPercentage}% atteints</span>
          <span>{fundraiser.daysRemaining} jours restants</span>
        </div>
        <div className="fundraiser-card__cta">
          <Link className="button button--ghost" to={fundraiserPath}>
            Voir la cagnotte
          </Link>
        </div>
      </div>
    </article>
  );
}
