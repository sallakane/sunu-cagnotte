import { SectionHeading } from "../components/SectionHeading";
import { usePageSeo } from "../lib/usePageSeo";

export function AboutPage() {
  usePageSeo({
    title: "Qui sommes-nous",
    description:
      "Découvrez la mission de Sunu Cagnotte, son approche de confiance et sa vision d'une collecte plus accessible localement.",
    canonicalPath: "/qui-sommes-nous",
  });

  return (
    <div className="page">
      <section className="page-section">
        <SectionHeading
          eyebrow="Qui sommes-nous"
          title="Une initiative solidaire née d'un manque local"
          description="Le projet se positionne comme une ONG ou une initiative à but non lucratif, avec une promesse de simplicité, de sérieux et d'accessibilité."
        />

        <div className="content-grid">
          <article className="panel">
            <h2>Notre mission</h2>
            <p>
              Rendre les cagnottes en ligne plus accessibles au Sénégal, avec
              une interface claire, un parcours de contribution mobile-first et
              un cadre de confiance adapté aux usages locaux.
            </p>
          </article>
          <article className="panel">
            <h2>Pourquoi maintenant</h2>
            <p>
              Beaucoup d'initiatives solidaires s'organisent déjà, mais les
              outils disponibles restent souvent peu accessibles, peu localisés
              ou insuffisamment rassurants.
            </p>
          </article>
          <article className="panel">
            <h2>Notre approche</h2>
            <p>
              Mettre en avant la transparence, la modération et une identité
              visuelle chaleureuse sans tomber dans le folklore ni l'effet clone.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
