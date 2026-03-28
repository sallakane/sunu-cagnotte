import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthProvider";
import { apiRequest } from "../lib/api";
import { formatXof } from "../lib/currency";
import type { FundraiserSummary } from "../types";

export function DashboardHomePage() {
  const auth = useAuth();
  const [fundraisers, setFundraisers] = useState<FundraiserSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.token) {
      return;
    }

    apiRequest<{ items: FundraiserSummary[] }>("/me/fundraisers", {
      token: auth.token,
    })
      .then((response) => {
        setFundraisers(response.items);
      })
      .catch((requestError: Error) => {
        setError(requestError.message);
      });
  }, [auth.token]);

  const totalCollected = fundraisers.reduce(
    (sum, fundraiser) => sum + fundraiser.collectedAmount,
    0,
  );
  const pendingCount = fundraisers.filter(
    (fundraiser) => fundraiser.status === "pending_review",
  ).length;

  return (
    <div className="dashboard-page">
      <div className="section-heading">
        <span>Tableau de bord</span>
        <h1>Vue d'ensemble créateur</h1>
        <p>
          Cette zone regroupera les indicateurs essentiels et l'état des
          cagnottes après connexion.
        </p>
      </div>

      {error ? <article className="panel">{error}</article> : null}

      <div className="stats-grid">
        <article className="panel">
          <strong>{fundraisers.length}</strong>
          <span>Cagnottes suivies</span>
        </article>
        <article className="panel">
          <strong>{formatXof(totalCollected)}</strong>
          <span>Total collecté</span>
        </article>
        <article className="panel">
          <strong>{pendingCount}</strong>
          <span>En attente de validation</span>
        </article>
      </div>
    </div>
  );
}
