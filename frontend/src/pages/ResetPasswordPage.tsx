import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, apiRequest, getApiValidationMessages } from "../lib/api";
import { usePageSeo } from "../lib/usePageSeo";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  usePageSeo({
    title: "Reinitialiser le mot de passe",
    description: "Definissez un nouveau mot de passe pour retrouver l acces a votre espace createur.",
    canonicalPath: "/reinitialiser-mot-de-passe",
    robots: "noindex,nofollow",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    setSuccess(null);

    try {
      const response = await apiRequest<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: {
          token,
          password,
          passwordConfirmation,
        },
      });

      setSuccess(response.message);
      window.setTimeout(() => {
        navigate("/connexion", { replace: true });
      }, 1200);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
        setValidationErrors(getApiValidationMessages(requestError));
      } else {
        setError("Reinitialisation impossible.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <section className="page-section narrow">
        <div className="section-heading">
          <span>Securite</span>
          <h1>Reinitialiser le mot de passe</h1>
          <p>Choisis un nouveau mot de passe pour ton espace createur.</p>
        </div>

        <form className="panel form-stack" onSubmit={handleSubmit}>
          {!token ? (
            <div className="alert alert--error">
              <strong>Le lien de reinitialisation est incomplet.</strong>
              <p>Demande un nouveau lien depuis la page mot de passe oublie.</p>
            </div>
          ) : null}

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

          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
          />

          <button type="submit" className="button" disabled={loading || token === ""}>
            {loading ? "Validation..." : "Enregistrer le nouveau mot de passe"}
          </button>

          <Link to="/connexion" className="detail-inline-link">
            Retour a la connexion
          </Link>
        </form>
      </section>
    </div>
  );
}
