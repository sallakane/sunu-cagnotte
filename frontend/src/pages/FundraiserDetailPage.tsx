import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiError, apiRequest, getApiValidationMessages } from "../lib/api";
import { ProgressDonut } from "../components/ProgressDonut";
import { FormatXof } from "../components/FormatXof";
import { formatLongDate } from "../lib/dates";
import { usePageSeo } from "../lib/usePageSeo";
import type { FundraiserDetail } from "../types";

function buildSiteUrl(path: string) {
  const base =
    ((import.meta.env.VITE_SITE_URL as string | undefined)?.trim() ?? "").replace(/\/+$/, "") ||
    window.location.origin;
  return `${base}${path}`;
}

const PAYMENT_METHODS = ["Orange Money", "Wave", "Free Money"];
const DESCRIPTION_COLLAPSE_THRESHOLD = 340;

export function FundraiserDetailPage() {
  const { slug } = useParams();
  const [fundraiser, setFundraiser] = useState<FundraiserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [contributionError, setContributionError] = useState<string | null>(null);
  const [contributionValidationErrors, setContributionValidationErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    amount: "",
    message: "",
    isAnonymous: false,
    acceptLegal: false,
  });
  const seoDescriptionSource = fundraiser?.excerpt.trim() || fundraiser?.description.trim() || "";
  const seoDescription =
    seoDescriptionSource.length > 158
      ? `${seoDescriptionSource.slice(0, 155).trim()}...`
      : seoDescriptionSource || "Consultez le détail de cette cagnotte solidaire et participez en ligne.";

  const structuredData = useMemo(() => {
    if (!fundraiser || !slug) return undefined;

    const pageUrl = buildSiteUrl(`/cagnottes/${slug}`);
    const imageUrl = fundraiser.coverImage
      ? fundraiser.coverImage.startsWith("http")
        ? fundraiser.coverImage
        : buildSiteUrl(fundraiser.coverImage)
      : buildSiteUrl("/banner/banniere.png");
    const startDate = fundraiser.publishedAt ?? fundraiser.createdAt;

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: buildSiteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Cagnottes", item: buildSiteUrl("/cagnottes") },
            { "@type": "ListItem", position: 3, name: fundraiser.title, item: pageUrl },
          ],
        },
        {
          "@type": "Event",
          name: fundraiser.title,
          description: seoDescriptionSource || fundraiser.description,
          image: imageUrl,
          url: pageUrl,
          startDate,
          endDate: fundraiser.endDate,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          location: {
            "@type": "VirtualLocation",
            url: pageUrl,
          },
          organizer: {
            "@type": "Organization",
            name: "Sunu Cagnotte",
            url: buildSiteUrl("/"),
          },
          offers: {
            "@type": "Offer",
            price: 200,
            priceCurrency: fundraiser.currency || "XOF",
            url: pageUrl,
            availability: "https://schema.org/InStock",
          },
        },
      ],
    };
  }, [fundraiser, slug, seoDescriptionSource]);

  usePageSeo({
    title: fundraiser?.title || "Détail de la cagnotte",
    description: seoDescription,
    canonicalPath: slug ? `/cagnottes/${slug}` : "/cagnottes",
    image: fundraiser?.coverImage || "/banner/banniere.png",
    robots: error && !loading ? "noindex,nofollow" : "index,follow",
    type: "article",
    structuredData,
  });

  useEffect(() => {
    if (!slug) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setIsDescriptionExpanded(false);

    apiRequest<{ item: FundraiserDetail }>(`/fundraisers/${slug}`)
      .then((response) => {
        if (active) {
          setFundraiser(response.item);
        }
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
  }, [slug]);

  function updateField<Key extends keyof typeof form>(
    key: Key,
    value: (typeof form)[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleContributionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fundraiser) {
      return;
    }

    setSubmitting(true);
    setContributionError(null);
    setContributionValidationErrors([]);

    try {
      const response = await apiRequest<{
        payment: {
          redirectUrl: string;
        };
      }>(`/fundraisers/${fundraiser.id}/contributions/initiate`, {
        method: "POST",
        body: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          amount: form.amount,
          message: form.message,
          isAnonymous: form.isAnonymous,
          acceptLegal: form.acceptLegal,
        },
      });

      window.location.assign(response.payment.redirectUrl);
    } catch (requestError) {
      const validationMessages = getApiValidationMessages(requestError);

      if (validationMessages.length > 0) {
        setContributionValidationErrors(validationMessages);
      }

      setContributionError(
        requestError instanceof ApiError
          ? requestError.message
          : "Le paiement n'a pas pu être initialisé.",
      );
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <section className="page-section narrow">
          <article className="panel">Chargement de la cagnotte...</article>
        </section>
      </div>
    );
  }

  if (error || !fundraiser) {
    return (
      <div className="page">
        <section className="page-section narrow">
          <article className="panel">
            {error ?? "Cagnotte introuvable."}
          </article>
        </section>
      </div>
    );
  }

  const hasSeparateExcerpt =
    fundraiser.excerpt.trim().length > 0 &&
    fundraiser.excerpt.trim() !== fundraiser.description.trim();
  const canCollapseDescription =
    fundraiser.description.trim().length > DESCRIPTION_COLLAPSE_THRESHOLD;
  const formattedEndDate = formatLongDate(fundraiser.endDate);
  const remainingAmount = Math.max(fundraiser.remainingAmount, 0);

  return (
    <div className="page page--fundraiser-detail">
      <section className="detail-hero">
        <div className="detail-hero__media">
          {fundraiser.coverImage ? (
            <img src={fundraiser.coverImage} alt={fundraiser.title} fetchPriority="high" />
          ) : (
            <div className="detail-placeholder">Cagnotte solidaire</div>
          )}
        </div>

        <div className="detail-hero__content">
          <div className="detail-hero__meta">
            <span className="tag">{fundraiser.category ?? "Solidarité"}</span>
            <span className="detail-chip">Clôture le {formattedEndDate}</span>
          </div>
          <h1>{fundraiser.title}</h1>
          {hasSeparateExcerpt ? <p className="detail-hero__excerpt">{fundraiser.excerpt}</p> : null}

          <div className="detail-hero__actions">
            <a className="button" href="#contribution-panel">
              Participer maintenant
            </a>
            <a className="detail-inline-link" href="#story-panel">
              Lire l’histoire
            </a>
          </div>

          <div className="detail-overview">
            <article className="detail-progress-card">
              <ProgressDonut value={fundraiser.progressPercentage} />
              <div className="detail-progress-card__content">
                <span className="detail-progress-card__eyebrow">Progression actuelle</span>
                <strong className="detail-progress-card__amount">
                  <FormatXof amount={fundraiser.collectedAmount} />
                </strong>
                <p>
                  déjà collectés sur un objectif de <FormatXof amount={fundraiser.targetAmount} />.
                </p>
                <div className="detail-progress-card__footer">
                  <span><FormatXof amount={remainingAmount} /> restants</span>
                  <span>{fundraiser.daysRemaining} jours restants</span>
                </div>
              </div>
            </article>

            <div className="detail-metrics">
              <article className="detail-stat">
                <span className="detail-stat__label">Contributeurs</span>
                <strong>{fundraiser.contributorCount}</strong>
              </article>
              <article className="detail-stat">
                <span className="detail-stat__label">Clôture</span>
                <strong className="detail-stat__text">{formattedEndDate}</strong>
              </article>
              <article className="detail-stat">
                <span className="detail-stat__label">Temps restant</span>
                <strong>{fundraiser.daysRemaining} jours</strong>
              </article>
              <article className="detail-stat">
                <span className="detail-stat__label">Objectif</span>
                <strong><FormatXof amount={fundraiser.targetAmount} /></strong>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <article className="panel panel--story" id="story-panel">
          <div className="detail-section__meta">
            <span className="tag">Histoire</span>
          </div>
          <h2>Pourquoi cette cagnotte</h2>
          <div
            className={
              isDescriptionExpanded
                ? "detail-story__content detail-story__content--expanded"
                : "detail-story__content"
            }
          >
            <p>{fundraiser.description}</p>
          </div>
          {canCollapseDescription ? (
            <button
              type="button"
              className="detail-story__toggle"
              onClick={() => setIsDescriptionExpanded((current) => !current)}
            >
              {isDescriptionExpanded ? "Afficher moins" : "Lire plus"}
            </button>
          ) : null}
        </article>

        <aside className="panel panel--sticky panel--contribution" id="contribution-panel">
          <div className="detail-section__meta">
            <span className="tag">Participer</span>
            <span className="detail-chip">Minimum 200 F CFA</span>
          </div>
          <h2>Faire un don</h2>
          <p className="panel__intro">
            Paiement mobile simple, rapide et sécurisé via PayTech.
          </p>
          <form className="form-stack" onSubmit={handleContributionSubmit}>
            {contributionError ? (
              <div className="alert alert--error">
                <strong>{contributionError}</strong>
                {contributionValidationErrors.length > 0 ? (
                  <ul className="error-list">
                    {contributionValidationErrors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <div className="payment-methods">
              <span className="payment-methods__label">Paiement sécurisé via PayTech</span>
              <div className="payment-methods__list">
                {PAYMENT_METHODS.map((method) => (
                  <span key={method} className="payment-method-chip">
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <input
              required
              placeholder="Prénom"
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
            <input
              required
              placeholder="Nom"
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />
            <div className="form-field">
              <label className="form-label" htmlFor="contribution-email">
                Email
                <span className="form-label__optional">Optionnel</span>
              </label>
              <input
                id="contribution-email"
                type="email"
                autoComplete="email"
                placeholder="votre@email.com"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="contribution-phone">
                Téléphone
                <span className="form-label__optional">Optionnel</span>
              </label>
              <input
                id="contribution-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+221 77 000 00 00"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </div>
            <input
              required
              min={200}
              type="number"
              inputMode="decimal"
              placeholder="Montant libre en F CFA (minimum 200)"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
            />
            <textarea
              placeholder="Message optionnel"
              rows={4}
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(event) => updateField("isAnonymous", event.target.checked)}
              />
              <span>Afficher anonymement mon don publiquement</span>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                required
                checked={form.acceptLegal}
                onChange={(event) => updateField("acceptLegal", event.target.checked)}
              />
              <span>J'accepte les CGU et la politique de confidentialité</span>
            </label>
            <button
              type="submit"
              className="button button--payment"
              disabled={submitting}
            >
              <span className="button__eyebrow">Orange Money, Wave, Free Money</span>
              <strong>{submitting ? "Redirection sécurisée..." : "Continuer vers le paiement sécurisé"}</strong>
            </button>
          </form>
        </aside>
      </section>

      <section className="page-section">
        <h2>Derniers donateurs</h2>
        {fundraiser.recentContributions.length === 0 ? (
          <article className="panel">
            Aucune contribution publique n'est encore disponible pour cette
            cagnotte.
          </article>
        ) : (
          <div className="donor-list">
            {fundraiser.recentContributions.map((donation) => (
              <article className="donor-card" key={donation.id}>
                <div className="donor-card__meta">
                  <strong className="donor-card__name">{donation.displayName}</strong>
                  <span className="donor-card__amount"><FormatXof amount={donation.amount} /></span>
                </div>
                {donation.message ? (
                  <p className="donor-card__message">{donation.message}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
