import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthProvider";
import { apiRequest, ApiError } from "../lib/api";
import { FormatXof } from "../components/FormatXof";
import { formatStatusLabel } from "../lib/status";

type AdminContribution = {
  id: string;
  fundraiser: {
    id: string;
    title: string;
    slug: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  amountGross: number;
  amountNet: number | null;
  providerFeeAmount: number | null;
  isAnonymous: boolean;
  publicDisplayName: string | null;
  publicName: string;
  message: string | null;
  paymentProvider: string;
  paymentReference: string;
  providerTransactionId: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type EditForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  publicDisplayName: string;
  message: string;
  isAnonymous: boolean;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type FundraiserOption = { id: string; title: string };

export function AdminContributorsPage() {
  const auth = useAuth();
  const [items, setItems] = useState<AdminContribution[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [fundraiserFilter, setFundraiserFilter] = useState("");
  const [fundraisers, setFundraisers] = useState<FundraiserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    publicDisplayName: "",
    message: "",
    isAnonymous: false,
  });

  useEffect(() => {
    if (!auth.token) return;
    apiRequest<{ items: FundraiserOption[] }>("/admin/fundraisers", { token: auth.token })
      .then((res) => setFundraisers(res.items))
      .catch(() => {});
  }, [auth.token]);

  async function loadItems(currentStatus: string, currentFundraiserId: string) {
    if (!auth.token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentStatus) params.set("status", currentStatus);
      if (currentFundraiserId) params.set("fundraiserId", currentFundraiserId);
      const suffix = params.toString() ? `?${params.toString()}` : "";
      const response = await apiRequest<{ items: AdminContribution[] }>(
        `/admin/contributions${suffix}`,
        { token: auth.token },
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
    void loadItems(statusFilter, fundraiserFilter);
  }, [auth.token, statusFilter, fundraiserFilter]);

  function openEdit(item: AdminContribution) {
    setEditingId(item.id);
    setEditForm({
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      phone: item.phone,
      publicDisplayName: item.publicDisplayName ?? "",
      message: item.message ?? "",
      isAnonymous: item.isAnonymous,
    });
  }

  async function saveEdit(id: string) {
    if (!auth.token) return;
    setProcessingId(id);
    setError(null);
    try {
      await apiRequest(`/admin/contributions/${id}`, {
        method: "PUT",
        token: auth.token,
        body: {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          phone: editForm.phone,
          publicDisplayName: editForm.publicDisplayName || null,
          message: editForm.message || null,
          isAnonymous: editForm.isAnonymous,
        },
      });
      setEditingId(null);
      await loadItems(statusFilter, fundraiserFilter);
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
        <span>Gestion des donateurs</span>
        <h1>Donateurs et dons</h1>
        <p>
          Consultez et modifiez les informations des donateurs ainsi que les
          détails liés à chaque don.
        </p>
      </div>

      <div className="filter-bar admin-filter-bar">
        <select
          value={fundraiserFilter}
          onChange={(event) => setFundraiserFilter(event.target.value)}
        >
          <option value="">Toutes les cagnottes</option>
          {fundraisers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="paid">Payés</option>
          <option value="pending">En attente</option>
          <option value="initiated">Initiés</option>
          <option value="failed">Échoués</option>
          <option value="cancelled">Annulés</option>
          <option value="refunded">Remboursés</option>
        </select>
      </div>

      {error ? <article className="panel">{error}</article> : null}
      {loading ? (
        <article className="panel">Chargement des dons...</article>
      ) : null}
      {!loading && items.length === 0 ? (
        <article className="panel">Aucun don pour ce filtre.</article>
      ) : null}

      {items.length > 0 ? (
        <div className="admin-fundraiser-list">
          {items.map((item) => (
            <article className="admin-fundraiser-card" key={item.id}>
              <div className="admin-fundraiser-card__header">
                <div>
                  <span className="tag">{formatStatusLabel(item.status)}</span>
                  <h3>{item.publicName}</h3>
                  <p className="admin-fundraiser-card__meta">
                    Cagnotte :{" "}
                    <strong>{item.fundraiser.title}</strong>
                  </p>
                </div>
                <div className="admin-fundraiser-card__owner">
                  <strong>
                    {item.firstName} {item.lastName}
                  </strong>
                  <span>{item.email}</span>
                  <span>{item.phone}</span>
                </div>
              </div>

              <div className="fundraiser-card__stats">
                <strong><FormatXof amount={item.amountGross} /></strong>
                {item.amountNet !== null ? (
                  <span>net : <FormatXof amount={item.amountNet} /></span>
                ) : null}
              </div>

              <div className="admin-fundraiser-card__meta">
                <span>Référence : {item.paymentReference}</span>
                {item.providerTransactionId ? (
                  <span> · TX : {item.providerTransactionId}</span>
                ) : null}
                <span> · Payé le : {formatDate(item.paidAt)}</span>
              </div>

              {item.message ? (
                <p className="admin-fundraiser-card__comment">
                  Message : {item.message}
                </p>
              ) : null}

              <p className="admin-fundraiser-card__meta">
                Affichage public :{" "}
                <strong>{item.publicName}</strong>
                {item.isAnonymous ? " (anonyme)" : ""}
              </p>

              <div className="button-row">
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
                  {editingId === item.id ? "Fermer" : "Modifier"}
                </button>
              </div>

              {editingId === item.id ? (
                <div className="admin-edit-box">
                  <p className="admin-fundraiser-card__meta">
                    Informations du donateur
                  </p>
                  <div className="admin-edit-box__row">
                    <div className="form-group">
                      <label>Prénom</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            firstName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Nom</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            lastName: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-edit-box__row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Téléphone</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Nom d'affichage public (optionnel)</label>
                    <input
                      type="text"
                      value={editForm.publicDisplayName}
                      placeholder="Laissez vide pour utiliser Prénom N."
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          publicDisplayName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Message associé au don</label>
                    <textarea
                      rows={3}
                      value={editForm.message}
                      placeholder="(optionnel)"
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          message: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={editForm.isAnonymous}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            isAnonymous: e.target.checked,
                          }))
                        }
                      />
                      <span>Afficher comme donateur anonyme</span>
                    </label>
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
