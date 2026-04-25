import { useState } from "react";
import { ApiError, apiRequest, getApiValidationMessages } from "../lib/api";
import { usePageSeo } from "../lib/usePageSeo";

const CONTACT_TYPES = [
  {
    key: "question",
    label: "Une question",
    messagePlaceholder: "Décrivez votre question, nous vous répondrons sous 48h...",
    hint: null as string | null,
  },
  {
    key: "suggestion",
    label: "Idée / Suggestion",
    messagePlaceholder:
      "Décrivez votre idée : fonctionnalité, amélioration, service à ajouter... Tout nous intéresse, même les idées en cours de formulation !",
    hint: "Votre avis compte. Sunu Cagnotte est construite pour la communauté — chaque suggestion est lue et discutée en équipe.",
  },
  {
    key: "signalement",
    label: "Signalement",
    messagePlaceholder: "Décrivez le problème : campagne concernée, nature du signalement, date...",
    hint: null as string | null,
  },
  {
    key: "autre",
    label: "Autre sujet",
    messagePlaceholder: "Décrivez votre demande...",
    hint: null as string | null,
  },
] as const;

type ContactTypeKey = (typeof CONTACT_TYPES)[number]["key"];

export function ContactPage() {
  const [activeType, setActiveType] = useState<ContactTypeKey>("question");
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

  const currentType = CONTACT_TYPES.find((t) => t.key === activeType) ?? CONTACT_TYPES[0];

  usePageSeo({
    title: "Contact",
    description:
      "Contactez l'équipe de Sunu Cagnotte pour une question, une idée d'amélioration ou un signalement. Nous lisons chaque message.",
    canonicalPath: "/contact",
  });

  function updateField<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleTypeChange(key: ContactTypeKey) {
    setActiveType(key);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setValidationErrors([]);

    const subjectWithType =
      activeType !== "question" && activeType !== "autre"
        ? `[${currentType.label}] ${form.subject}`
        : form.subject;

    try {
      const response = await apiRequest<{ message: string }>("/contact", {
        method: "POST",
        body: { ...form, subject: subjectWithType },
      });

      setSuccess(response.message);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setActiveType("question");
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
    <div className="page page--contact">
      <section className="contact-intro page-section">
        <div className="section-heading">
          <span>On vous écoute</span>
          <h1>Parlons-nous</h1>
          <p>
            Cette plateforme est construite pour la communauté et elle avance grâce à elle.
            Que vous ayez une question, une idée à partager ou un signalement à faire —
            l'équipe lit chaque message avec attention.
          </p>
        </div>

        <div className="contact-intro__cards">
          <article className="contact-reason-card">
            <span className="contact-reason-card__icon" aria-hidden="true">?</span>
            <strong>Une question</strong>
            <p>Sur une cagnotte, un paiement, votre compte ou le fonctionnement de la plateforme.</p>
          </article>
          <article className="contact-reason-card contact-reason-card--accent">
            <span className="contact-reason-card__icon" aria-hidden="true">+</span>
            <strong>Idée ou suggestion</strong>
            <p>
              Une nouvelle fonctionnalité, une amélioration, un service que vous aimeriez voir ?
              Partagez-le, chaque idée est discutée en équipe.
            </p>
          </article>
          <article className="contact-reason-card">
            <span className="contact-reason-card__icon" aria-hidden="true">!</span>
            <strong>Signalement</strong>
            <p>Un problème technique ou une campagne qui vous paraît suspecte — nous traitons chaque signalement avec sérieux.</p>
          </article>
        </div>
      </section>

      <section className="page-section narrow">
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
          {success ? (
            <div className="alert alert--success">
              <strong>{success}</strong>
              <p>Nous vous répondrons par email dans les meilleurs délais.</p>
            </div>
          ) : null}

          <div className="contact-type-selector" role="group" aria-label="Type de message">
            {CONTACT_TYPES.map((type) => (
              <button
                key={type.key}
                type="button"
                className={
                  activeType === type.key
                    ? "contact-type-btn contact-type-btn--active"
                    : "contact-type-btn"
                }
                onClick={() => handleTypeChange(type.key)}
              >
                {type.label}
              </button>
            ))}
          </div>

          {currentType.hint ? (
            <p className="contact-hint">{currentType.hint}</p>
          ) : null}

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
            placeholder="Téléphone (optionnel)"
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
            placeholder={currentType.messagePlaceholder}
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
