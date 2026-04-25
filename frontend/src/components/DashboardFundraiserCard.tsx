import { Link } from "react-router-dom";
import { FormatXof } from "./FormatXof";
import { formatStatusLabel } from "../lib/status";
import type { FundraiserSummary } from "../types";
import { ProgressBar } from "./ProgressBar";

export function DashboardFundraiserCard({
  fundraiser,
}: {
  fundraiser: FundraiserSummary;
}) {
  return (
    <article className="dashboard-fundraiser-card">
      <div className="dashboard-fundraiser-card__top">
        <div>
          <span className="tag">{formatStatusLabel(fundraiser.status)}</span>
          <h3>{fundraiser.title}</h3>
        </div>
        <span className="dashboard-fundraiser-card__meta">
          {formatStatusLabel(fundraiser.adminValidationStatus)}
        </span>
      </div>

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

      <div className="button-row">
        {fundraiser.isEditable ? (
          <Link className="button button--ghost" to={`/espace/cagnottes/${fundraiser.id}/modifier`}>
            Modifier
          </Link>
        ) : null}
        {fundraiser.status === "published" ? (
          <Link className="button button--ghost" to={`/cagnottes/${fundraiser.slug}`}>
            Voir la page publique
          </Link>
        ) : null}
      </div>
    </article>
  );
}
