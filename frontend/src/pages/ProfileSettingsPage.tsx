import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthProvider";
import { apiRequest, ApiError, getApiValidationMessages } from "../lib/api";
import type { MeProfile } from "../types";

export function ProfileSettingsPage() {
  const auth = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.token) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    apiRequest<{ item: MeProfile }>("/me", {
      token: auth.token,
    })
      .then((response) => {
        if (!active) {
          return;
        }

        setForm({
          firstName: response.item.firstName,
          lastName: response.item.lastName,
          email: response.item.email,
          phone: response.item.phone,
        });
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

  function updateField<Key extends keyof typeof form>(
    key: Key,
    value: (typeof form)[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!auth.token) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setValidationErrors([]);

    try {
      const response = await apiRequest<{ item: MeProfile; message: string }>("/me", {
        method: "PUT",
        token: auth.token,
        body: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        },
      });

      setForm((current) => ({
        ...current,
        firstName: response.item.firstName,
        lastName: response.item.lastName,
        phone: response.item.phone,
      }));
      setSuccess(response.message);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
        setValidationErrors(getApiValidationMessages(requestError));
      } else {
        setError("Mise a jour impossible.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="section-heading">
        <span>Profil</span>
        <h1>Parametres du compte</h1>
        <p>
          Le createur pourra modifier ses informations de base et son mot de
          passe.
        </p>
      </div>

      {loading ? <article className="panel">Chargement du profil...</article> : null}

      {!loading ? (
        <form className="panel form-stack" onSubmit={handleSubmit}>
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

          {success ? <div className="alert alert--success">{success}</div> : null}

          <div className="two-columns">
            <input
              required
              placeholder="Prenom"
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
            <input
              required
              placeholder="Nom"
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            disabled
          />
          <input
            required
            type="tel"
            placeholder="Telephone"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
          <button type="submit" className="button" disabled={saving}>
            {saving ? "Mise a jour..." : "Mettre a jour le profil"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
