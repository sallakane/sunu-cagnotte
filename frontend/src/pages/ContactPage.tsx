import { useState } from "react";
import { ApiError, apiRequest, getApiValidationMessages } from "../lib/api";
import { usePageSeo } from "../lib/usePageSeo";

export function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  usePageSeo({
    title: "Contact",
    description:
      "Contactez l'equipe de Sunu Cagnotte pour une question, un accompagnement ou un signalement concernant une campagne.",
    canonicalPath: "/contact",
  });

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
    setLoading(true);
    setError(null);
    setSuccess(null);
    setValidationErrors([]);

    try {
      const response = await apiRequest<{ message: string }>("/contact", {
        method: "POST",
        body: form,
      });

      setSuccess(response.message);
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
        setValidationErrors(getApiValidationMessages(requestError));
      } else {
        setError("Envoi impossible.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <section className="page-section narrow">
        <div className="section-heading">
          <span>Contact</span>
          <h1>Nous ecrire</h1>
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
            required
            placeholder="Nom complet"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
          <input
            placeholder="Telephone (optionnel)"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
          <input
            required
            placeholder="Sujet"
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
          />
          <textarea
            required
            minLength={10}
            placeholder="Votre message"
            rows={6}
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
          />
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le message"}
          </button>
        </form>
      </section>
    </div>
  );
}
