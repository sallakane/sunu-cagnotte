import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, apiRequest } from "../lib/api";
import { usePageSeo } from "../lib/usePageSeo";

export function PaymentTestPage() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  usePageSeo({
    title: "Simulateur paiement",
    description: "Simulateur technique local pour tester les retours de paiement.",
    canonicalPath: reference ? `/paiement/test/${reference}` : "/paiement/test",
    robots: "noindex,nofollow",
  });

  async function simulate(status: "paid" | "failed" | "cancelled") {
    if (!reference) {
      return;
    }

    setSubmitting(status);
    setError(null);

    try {
      await apiRequest("/payments/ipn", {
        method: "POST",
        body: {
          event: "simulated_ipn",
          reference,
          status,
          transaction_id: `TEST-${reference}-${status}`,
          fee_amount: 0,
        },
      });

      navigate(`/paiement/retour?reference=${encodeURIComponent(reference)}`);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Simulation du paiement impossible.",
      );
      setSubmitting(null);
    }
  }

  return (
    <div className="page">
      <section className="page-section narrow">
        <div className="section-heading">
          <span>Mode test</span>
          <h1>Simulateur paiement local</h1>
          <p>
            Cet écran remplace temporairement la redirection externe pour le
            développement local. Il permet de simuler l&apos;IPN serveur avant le
            retour utilisateur.
          </p>
        </div>

        <article className="panel form-stack">
          <strong>Référence {reference ?? "indisponible"}</strong>

          {error ? <div className="alert alert--error">{error}</div> : null}

          <button
            type="button"
            className="button"
            disabled={submitting !== null}
            onClick={() => void simulate("paid")}
          >
            Simuler un paiement valide
          </button>
          <button
            type="button"
            className="button button--ghost"
            disabled={submitting !== null}
            onClick={() => void simulate("failed")}
          >
            Simuler un échec
          </button>
          <button
            type="button"
            className="button button--ghost"
            disabled={submitting !== null}
            onClick={() => void simulate("cancelled")}
          >
            Simuler une annulation
          </button>

          <Link to={reference ? `/paiement/retour?reference=${encodeURIComponent(reference)}` : "/"}>
            Voir l&apos;état courant
          </Link>
        </article>
      </section>
    </div>
  );
}
