import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiRequest, getApiValidationMessages } from "../lib/api";
import { usePageSeo } from "../lib/usePageSeo";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  usePageSeo({
    title: "Mot de passe oublie",
    description: "Demandez un lien de reinitialisation pour acceder de nouveau a votre espace createur.",
    canonicalPath: "/mot-de-passe-oublie",
    robots: "noindex,nofollow",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    setSuccess(null);

    try {
      const response = await apiRequest<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });

      setSuccess(response.message);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
        setValidationErrors(getApiValidationMessages(requestError));
      } else {
        setError("Demande impossible.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <section className="page-section narrow">
        <div className="section-heading">
          <span>Acces au compte</span>
          <h1>Mot de passe oublie</h1>
          <p>Saisis ton email pour recevoir un lien de reinitialisation.</p>
        </div>

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

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>

          <Link to="/connexion" className="detail-inline-link">
            Retour a la connexion
          </Link>
        </form>
      </section>
    </div>
  );
}
