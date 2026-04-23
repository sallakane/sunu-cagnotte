import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { formatXof } from "../lib/currency";
import { formatStatusLabel } from "../lib/status";
import { usePageSeo } from "../lib/usePageSeo";
import type { PaymentContributionStatus } from "../types";

export function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const reference = searchParams.get("reference");
  const [item, setItem] = useState<PaymentContributionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageSeo({
    title: "Retour de paiement",
    description: "Suivi technique du statut d'une contribution après le parcours de paiement.",
    canonicalPath: "/paiement/retour",
    robots: "noindex,nofollow",
  });

  useEffect(() => {
    if (!token && !reference) {
      setLoading(false);
      setError("Le token ou la référence de paiement est manquant.");
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    const query = token
      ? `token=${encodeURIComponent(token)}`
      : `reference=${encodeURIComponent(reference ?? "")}`;

    apiRequest<{ item: PaymentContributionStatus }>(
      `/payments/return?${query}`,
    )
      .then((response) => {
        if (active) {
          setItem(response.item);
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
  }, [reference, token]);

  const toneClass =
    item?.status === "paid"
      ? "alert alert--success"
      : item?.status === "failed" || item?.status === "cancelled"
        ? "alert alert--error"
        : "alert";

  return (
    <div className="page">
      <section className="page-section narrow">
        <div className="section-heading">
          <span>Paiement</span>
          <h1>Retour du parcours de paiement</h1>
        </div>

        {loading ? <article className="panel">Vérification du paiement...</article> : null}
        {!loading && error ? <article className="panel">{error}</article> : null}

        {!loading && item ? (
          <article className="panel form-stack">
            <div className={toneClass}>
              <strong>{formatStatusLabel(item.status)}</strong>
              <p>
                Référence {item.paymentReference} · {formatXof(item.amountGross)}
              </p>
            </div>

            <p>
              Cagnotte concernée : <strong>{item.fundraiser.title}</strong>
            </p>

            {item.paidAt ? <p>Paiement confirmé le {new Date(item.paidAt).toLocaleString("fr-FR")}</p> : null}

            <div className="button-row">
              <Link to={`/cagnottes/${item.fundraiser.slug}`} className="button">
                Retour à la cagnotte
              </Link>
              {item.status !== "paid" ? (
                <Link
                  to={`/paiement/test/${item.paymentReference}`}
                  className="button button--ghost"
                >
                  Revenir au simulateur local
                </Link>
              ) : null}
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
