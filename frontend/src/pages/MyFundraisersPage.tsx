import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthProvider";
import { DashboardFundraiserCard } from "../components/DashboardFundraiserCard";
import { apiRequest } from "../lib/api";
import type { FundraiserSummary } from "../types";

export function MyFundraisersPage() {
  const auth = useAuth();
  const [fundraisers, setFundraisers] = useState<FundraiserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.token) {
      return;
    }

    let active = true;

    apiRequest<{ items: FundraiserSummary[] }>("/me/fundraisers", {
      token: auth.token,
    })
      .then((response) => {
        if (active) {
          setFundraisers(response.items);
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
  }, [auth.token]);

  return (
    <div className="dashboard-page">
      <div className="section-heading">
        <span>Mes cagnottes</span>
        <h1>Suivre et administrer mes campagnes</h1>
        <p>
          Le détail connecté affichera statut, progression, contributions et
          actions disponibles par cagnotte.
        </p>
      </div>

      {error ? <article className="panel">{error}</article> : null}
      {loading ? <article className="panel">Chargement de vos cagnottes...</article> : null}
      {!loading && !error && fundraisers.length === 0 ? (
          <article className="panel">
            Vous n'avez encore créé aucune cagnotte.
          </article>
      ) : null}
      {!error && fundraisers.length > 0 ? (
        <div className="grid">
          {fundraisers.map((fundraiser) => (
            <DashboardFundraiserCard key={fundraiser.id} fundraiser={fundraiser} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
