import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../app/AuthProvider";
import { apiRequest, ApiError } from "../lib/api";
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
  const [loading, setLoading] = useState(false);

  usePageSeo({
    title: "Inscription",
    description: "Creez un espace porteur de cagnotte pour proposer, suivre et administrer vos campagnes.",
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

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: {
          firstName,
          lastName,
          email,
          phone,
          password,
        },
      });

      navigate("/connexion", {
        replace: true,
        state: { registered: true },
      });
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
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
          <h1>Creer votre espace pour creer et gerer vos cagnottes</h1>
        </div>

        <form className="panel form-stack" onSubmit={handleSubmit}>
          {error ? <div className="alert alert--error">{error}</div> : null}
          <div className="two-columns">
            <input
              placeholder="Prenom"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <input
              placeholder="Nom"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            placeholder="Telephone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Creation..." : "Creer mon compte"}
          </button>
        </form>
      </section>
    </div>
  );
}
