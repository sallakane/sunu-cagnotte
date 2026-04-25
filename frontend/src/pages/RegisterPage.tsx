import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../app/AuthProvider";
import { apiRequest, ApiError, getApiValidationMessages } from "../lib/api";
import { usePageSeo } from "../lib/usePageSeo";

export function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  usePageSeo({
    title: "Inscription",
    description: "Créez un espace porteur de cagnotte pour proposer, suivre et administrer vos campagnes.",
    canonicalPath: "/inscription",
    robots: "noindex,nofollow",
  });

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: { firstName, lastName, email, phone, password },
      });

      navigate("/connexion", {
        replace: true,
        state: { registered: true },
      });
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
        setValidationErrors(getApiValidationMessages(requestError));
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <section className="page-section narrow">
        <div className="section-heading">
          <span>Nouveau compte</span>
          <h1>Créer votre espace pour créer et gérer vos cagnottes</h1>
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
          <div className="two-columns">
            <input
              required
              placeholder="Prénom"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <input
              required
              placeholder="Nom"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="tel"
            placeholder="Téléphone (optionnel)"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Mot de passe (8 caractères minimum)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>
      </section>
    </div>
  );
}
