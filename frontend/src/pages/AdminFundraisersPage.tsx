import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthProvider";
import { apiRequest, ApiError } from "../lib/api";
import { formatXof } from "../lib/currency";
import { formatStatusLabel } from "../lib/status";
import type { FundraiserSummary } from "../types";
import { ProgressBar } from "../components/ProgressBar";

type AdminFundraiser = FundraiserSummary & {
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
};

export function AdminFundraisersPage() {
  const auth = useAuth();
  const [items, setItems] = useState<AdminFundraiser[]>([]);
  const [filter, setFilter] = useState("pending_review");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  async function loadItems(currentFilter: string) {
    if (!auth.token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const suffix = currentFilter ? `?status=${currentFilter}` : "";
      const response = await apiRequest<{ items: AdminFundraiser[] }>(
        `/admin/fundraisers${suffix}`,
        {
          token: auth.token,
        },
      );

      setItems(response.items);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Chargement impossible.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems(filter);
  }, [auth.token, filter]);

  async function approve(id: string) {
    if (!auth.token) {
      return;
    }

    setProcessingId(id);
    setError(null);

    try {
      await apiRequest(`/admin/fundraisers/${id}/approve`, {
        method: "PATCH",
        token: auth.token,
      });

      await loadItems(filter);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Validation impossible.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function reject(id: string) {
    if (!auth.token) {
      return;
    }

    setProcessingId(id);
    setError(null);

    try {
      await apiRequest(`/admin/fundraisers/${id}/reject`, {
        method: "PATCH",
        token: auth.token,
        body: {
          comment,
        },
      });
      setRejectingId(null);
      setComment("");
      await loadItems(filter);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Refus impossible.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="section-heading">
        <span>Moderation</span>
        <h1>Validation et publication des cagnottes</h1>
        <p>
          Une cagnotte approuvee passe en statut publie et devient visible sur
          les pages publiques.
        </p>
      </div>

      <div className="filter-bar admin-filter-bar">
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="">Toutes</option>
          <option value="pending_review">En attente</option>
          <option value="published">Publiees</option>
          <option value="rejected">Refusees</option>
          <option value="draft">Brouillons</option>
          <option value="archived">Archivees</option>
        </select>
      </div>

      {error ? <article className="panel">{error}</article> : null}
      {loading ? <article className="panel">Chargement des cagnottes...</article> : null}
      {!loading && items.length === 0 ? (
        <article className="panel">Aucune cagnotte pour ce filtre.</article>
      ) : null}

      {items.length > 0 ? (
        <div className="admin-fundraiser-list">
          {items.map((item) => (
            <article className="admin-fundraiser-card" key={item.id}>
              <div className="admin-fundraiser-card__header">
                <div>
                  <span className="tag">{formatStatusLabel(item.status)}</span>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                </div>
                <div className="admin-fundraiser-card__owner">
                  <strong>
                    {item.owner.firstName} {item.owner.lastName}
                  </strong>
                  <span>{item.owner.email}</span>
                  <span>{item.owner.phone}</span>
                </div>
              </div>

              <div className="fundraiser-card__stats">
                <strong>{formatXof(item.collectedAmount)}</strong>
                <span>sur {formatXof(item.targetAmount)}</span>
              </div>

              <ProgressBar value={item.progressPercentage} />

              <div className="fundraiser-card__footer">
                <span>{item.progressPercentage}% atteints</span>
                <span>{item.daysRemaining} jours restants</span>
              </div>

              <p className="admin-fundraiser-card__meta">
                Validation admin : {formatStatusLabel(item.adminValidationStatus)}
              </p>

              {item.adminValidationComment ? (
                <p className="admin-fundraiser-card__comment">
                  Motif : {item.adminValidationComment}
                </p>
              ) : null}

              {item.status === "pending_review" || item.status === "rejected" ? (
                <div className="button-row">
                  <button
                    type="button"
                    className="button"
                    onClick={() => void approve(item.id)}
                    disabled={processingId === item.id}
                  >
                    Approuver et publier
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    disabled={processingId === item.id}
                    onClick={() =>
                      setRejectingId((current) => (current === item.id ? null : item.id))
                    }
                  >
                    Refuser
                  </button>
                </div>
              ) : null}

              {rejectingId === item.id ? (
                <div className="admin-reject-box">
                  <textarea
                    rows={4}
                    placeholder="Commentaire de refus (optionnel)"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                  <button
                    type="button"
                    className="button button--ghost"
                    disabled={processingId === item.id}
                    onClick={() => void reject(item.id)}
                  >
                    Confirmer le refus
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
