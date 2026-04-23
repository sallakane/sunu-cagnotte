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

type EditForm = {
  title: string;
  description: string;
  category: string;
  targetAmount: string;
  endDate: string;
};

function toDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10);
}

export function AdminFundraisersPage() {
  const auth = useAuth();
  const [items, setItems] = useState<AdminFundraiser[]>([]);
  const [filter, setFilter] = useState("pending_review");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [invalidatingId, setInvalidatingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    description: "",
    category: "",
    targetAmount: "",
    endDate: "",
  });

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

  function openEdit(item: AdminFundraiser) {
    setEditingId(item.id);
    setRejectingId(null);
    setInvalidatingId(null);
    setEditForm({
      title: item.title,
      description: item.description ?? "",
      category: item.category ?? "",
      targetAmount: String(item.targetAmount),
      endDate: toDateInputValue(item.endDate),
    });
  }

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
        body: { comment },
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

  async function invalidate(id: string) {
    if (!auth.token) {
      return;
    }

    setProcessingId(id);
    setError(null);

    try {
      await apiRequest(`/admin/fundraisers/${id}/invalidate`, {
        method: "PATCH",
        token: auth.token,
        body: { comment },
      });
      setInvalidatingId(null);
      setComment("");
      await loadItems(filter);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Invalidation impossible.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function saveEdit(id: string) {
    if (!auth.token) {
      return;
    }

    setProcessingId(id);
    setError(null);

    try {
      await apiRequest(`/admin/fundraisers/${id}`, {
        method: "PUT",
        token: auth.token,
        body: {
          title: editForm.title,
          description: editForm.description,
          category: editForm.category || null,
          targetAmount: parseFloat(editForm.targetAmount),
          endDate: editForm.endDate,
        },
      });
      setEditingId(null);
      await loadItems(filter);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Modification impossible.",
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
          Une cagnotte approuvée passe en statut publié et devient visible sur
          les pages publiques.
        </p>
      </div>

      <div className="filter-bar admin-filter-bar">
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="">Toutes</option>
          <option value="pending_review">En attente</option>
          <option value="published">Publiées</option>
          <option value="rejected">Refusées</option>
          <option value="draft">Brouillons</option>
          <option value="archived">Archivées</option>
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

              <div className="button-row">
                {item.status === "pending_review" || item.status === "rejected" ? (
                  <>
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
                      onClick={() => {
                        setRejectingId((current) => (current === item.id ? null : item.id));
                        setInvalidatingId(null);
                        setEditingId(null);
                        setComment("");
                      }}
                    >
                      Refuser
                    </button>
                  </>
                ) : null}

                {item.status === "published" || item.status === "completed" ? (
                  <button
                    type="button"
                    className="button button--danger"
                    disabled={processingId === item.id}
                    onClick={() => {
                      setInvalidatingId((current) => (current === item.id ? null : item.id));
                      setRejectingId(null);
                      setEditingId(null);
                      setComment("");
                    }}
                  >
                    Invalider
                  </button>
                ) : null}

                <button
                  type="button"
                  className="button button--ghost"
                  disabled={processingId === item.id}
                  onClick={() => {
                    if (editingId === item.id) {
                      setEditingId(null);
                    } else {
                      openEdit(item);
                    }
                  }}
                >
                  Modifier
                </button>
              </div>

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

              {invalidatingId === item.id ? (
                <div className="admin-reject-box">
                  <p className="admin-fundraiser-card__meta">
                    La cagnotte sera dépubliée et masquée du public.
                  </p>
                  <textarea
                    rows={3}
                    placeholder="Motif d'invalidation (optionnel)"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                  <button
                    type="button"
                    className="button button--danger"
                    disabled={processingId === item.id}
                    onClick={() => void invalidate(item.id)}
                  >
                    Confirmer l'invalidation
                  </button>
                </div>
              ) : null}

              {editingId === item.id ? (
                <div className="admin-edit-box">
                  <div className="form-group">
                    <label>Titre</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows={5}
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="admin-edit-box__row">
                    <div className="form-group">
                      <label>Catégorie</label>
                      <input
                        type="text"
                        value={editForm.category}
                        placeholder="(optionnel)"
                        onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Objectif (XOF)</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.targetAmount}
                        onChange={(e) => setEditForm((f) => ({ ...f, targetAmount: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date de fin</label>
                      <input
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="button-row">
                    <button
                      type="button"
                      className="button"
                      disabled={processingId === item.id}
                      onClick={() => void saveEdit(item.id)}
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      disabled={processingId === item.id}
                      onClick={() => setEditingId(null)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
