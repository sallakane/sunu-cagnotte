import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../app/AuthProvider";
import { apiRequest, ApiError } from "../lib/api";
import { usePageSeo } from "../lib/usePageSeo";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const successMessage = location.state?.registered
    ? "Compte créé. Vous pouvez maintenant vous connecter."
    : null;

  usePageSeo({
    title: "Connexion",
    description: "Connectez-vous à votre espace créateur pour gérer vos cagnottes solidaires.",
    canonicalPath: "/connexion",
    robots: "noindex,nofollow",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{ token: string }>("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      auth.login(response.token);
      navigate(location.state?.from ?? "/espace", { replace: true });
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError("Connexion impossible.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <section className="page-section narrow">
        <div className="section-heading">
          <span>Espace créateur</span>
          <h1>Connexion</h1>
        </div>

        <form className="panel form-stack" onSubmit={handleSubmit}>
          {successMessage ? (
            <div className="alert alert--success">{successMessage}</div>
          ) : null}
          {error ? <div className="alert alert--error">{error}</div> : null}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <Link to="/mot-de-passe-oublie" className="detail-inline-link">
            Mot de passe oublié ?
          </Link>
          <Link to="/inscription" className="button button--ghost">
            Créer un compte
          </Link>
        </form>
      </section>
    </div>
  );
}
