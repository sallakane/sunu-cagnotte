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
    title: "Mot de passe oublié",
    description: "Demandez un lien de réinitialisation pour accéder de nouveau à votre espace créateur.",
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
          <span>Accès au compte</span>
          <h1>Mot de passe oublié</h1>
          <p>Saisis ton email pour recevoir un lien de réinitialisation.</p>
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
            Retour à la connexion
          </Link>
        </form>
      </section>
    </div>
  );
}
