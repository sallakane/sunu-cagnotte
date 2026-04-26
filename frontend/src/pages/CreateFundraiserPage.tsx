import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../app/AuthProvider";
import { apiRequest, ApiError, getApiValidationMessages } from "../lib/api";
import { FUNDRAISER_CATEGORIES } from "../lib/fundraiserCategories";
import type { FundraiserSummary } from "../types";

export function CreateFundraiserPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const defaultEndDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().slice(0, 10);
  })();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [endDate, setEndDate] = useState(isEditMode ? "" : defaultEndDate);
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageUploadError, setCoverImageUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(isEditMode);

  useEffect(() => {
    if (!auth.token || !id) {
      setLoadingInitialData(false);
      return;
    }

    let active = true;
    setLoadingInitialData(true);
    setError(null);
    setValidationErrors([]);

    apiRequest<{ item: FundraiserSummary }>(`/me/fundraisers/${id}`, {
      token: auth.token,
    })
      .then((response) => {
        if (!active) {
          return;
        }

        setTitle(response.item.title);
        setDescription(response.item.description);
        setTargetAmount(String(response.item.targetAmount));
        setEndDate(response.item.endDate.slice(0, 10));
        setCategory(response.item.category ?? "");
        setCoverImage(response.item.coverImage ?? "");
        setCoverImageUploadError(null);
      })
      .catch((requestError: Error) => {
        if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingInitialData(false);
        }
      });

    return () => {
      active = false;
    };
  }, [auth.token, id]);

  async function handleCoverImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !auth.token) {
      return;
    }

    setUploadingCoverImage(true);
    setCoverImageUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiRequest<{ url: string }>("/uploads/fundraiser-cover", {
        method: "POST",
        token: auth.token,
        body: formData,
      });

      setCoverImage(response.url);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        const [validationMessage] = getApiValidationMessages(requestError);
        setCoverImageUploadError(validationMessage ?? requestError.message);
      } else {
        setCoverImageUploadError("Le téléchargement de l’image a échoué.");
      }
    } finally {
      setUploadingCoverImage(false);
    }
  }

  async function handleCreate(mode: "draft" | "submit") {
    if (!auth.token || loadingInitialData || uploadingCoverImage) {
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const endpoint = isEditMode && id ? `/fundraisers/${id}` : "/fundraisers";
      const method = isEditMode ? "PUT" : "POST";

      const saved = await apiRequest<{ item: FundraiserSummary }>(endpoint, {
        method,
        token: auth.token,
        body: {
          title,
          description,
          targetAmount,
          endDate,
          category,
          coverImage,
        },
      });

      if (mode === "submit") {
        await apiRequest(`/fundraisers/${saved.item.id}/submit`, {
          method: "PATCH",
          token: auth.token,
        });
      }

      navigate("/espace/cagnottes", { replace: true });
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
        setValidationErrors(getApiValidationMessages(requestError));
      } else {
        setError("Création impossible.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="section-heading">
        <span>{isEditMode ? "Modifier la cagnotte" : "Nouvelle cagnotte"}</span>
        <h1>{isEditMode ? "Mettre à jour la campagne" : "Créer une campagne"}</h1>
        <p>
          Complète les informations de la cagnotte, puis enregistre-la en
          brouillon ou soumets-la à validation.
        </p>
      </div>

      {loadingInitialData ? (
        <article className="panel">Chargement de la cagnotte...</article>
      ) : null}

      {!loadingInitialData ? (
      <form className="panel form-stack">
        {error ? (
          <div className="alert alert--error">
            <strong>{error}</strong>
            {validationErrors.length > 0 ? (
              <ul className="error-list">
                {validationErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        <input
          required
          placeholder="Nom de la cagnotte"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          rows={6}
          required
          minLength={20}
          placeholder="Description complète"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="two-columns">
          <input
            required
            min={1}
            type="number"
            placeholder="Montant cible en F CFA"
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
          />
          <input
            type="date"
            required
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">Catégorie (optionnel)</option>
          {FUNDRAISER_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="image-upload-field">
          <div className="form-field">
            <label className="form-label" htmlFor="fundraiser-cover-image">
              Image de couverture
              <span className="form-label__optional">Optionnel</span>
            </label>
            <input
              id="fundraiser-cover-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => void handleCoverImageUpload(event)}
              disabled={uploadingCoverImage}
            />
          </div>
          <p className="image-upload-field__hint">
            Formats acceptés : JPG, PNG, WEBP. Taille maximale : 5 Mo.
          </p>
          {coverImageUploadError ? (
            <div className="alert alert--error">
              <strong>{coverImageUploadError}</strong>
            </div>
          ) : null}
          {coverImage ? (
            <div className="image-upload-preview">
              <img src={coverImage} alt="Aperçu de la couverture" />
              <div className="image-upload-preview__actions">
                <span className="image-upload-preview__status">
                  {uploadingCoverImage ? "Téléchargement en cours..." : "Image prête pour la cagnotte"}
                </span>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => {
                    setCoverImage("");
                    setCoverImageUploadError(null);
                  }}
                  disabled={uploadingCoverImage || loading}
                >
                  Retirer l’image
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="button-row">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => handleCreate("draft")}
            disabled={loading || uploadingCoverImage}
          >
            {loading
                ? "Enregistrement..."
                : uploadingCoverImage
                ? "Téléchargement..."
              : isEditMode
                ? "Enregistrer les modifications"
                : "Enregistrer en brouillon"}
          </button>
          <button
            type="button"
            className="button"
            onClick={() => handleCreate("submit")}
            disabled={loading || uploadingCoverImage}
          >
            {loading
              ? "Soumission..."
              : uploadingCoverImage
                ? "Téléchargement..."
              : isEditMode
                ? "Mettre à jour et soumettre"
                : "Soumettre à validation"}
          </button>
        </div>
      </form>
      ) : null}
    </div>
  );
}
