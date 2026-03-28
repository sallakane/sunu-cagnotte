import { useEffect, useState } from "react";
import { FundraiserCard } from "../components/FundraiserCard";
import { SectionHeading } from "../components/SectionHeading";
import { apiRequest } from "../lib/api";
import { FUNDRAISER_CATEGORIES } from "../lib/fundraiserCategories";
import { usePageSeo } from "../lib/usePageSeo";
import type { FundraiserSummary } from "../types";

export function FundraisersPage() {
  const [fundraisers, setFundraisers] = useState<FundraiserSummary[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  usePageSeo({
    title: "Toutes les cagnottes",
    description:
      "Consultez les cagnottes publiées, filtrez par catégorie et recherchez une campagne par son titre ou sa description.",
    canonicalPath: "/cagnottes",
    image: "/banner/banniere.png",
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();

    if (searchQuery !== "") {
      params.set("q", searchQuery);
    }

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    setLoading(true);
    setError(null);

    apiRequest<{ items: FundraiserSummary[]; meta: { total: number } }>(
      `/fundraisers${params.toString() ? `?${params.toString()}` : ""}`,
    )
      .then((response) => {
        if (active) {
          setFundraisers(response.items);
          setTotal(response.meta.total);
        }
      })
      .catch((requestError: Error) => {
        if (active) {
          setError(requestError.message);
          setFundraisers([]);
          setTotal(0);
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
  }, [searchQuery, selectedCategory]);

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all";

  return (
    <div className="page page--catalog">
      <section className="page-section">
        <SectionHeading
          eyebrow="Toutes les campagnes"
          title="Liste des cagnottes"
          description="Recherche par titre ou description, filtre par catégorie, et affichage des plus récentes."
        />

        <div className="catalog-toolbar panel">
          <div className="catalog-toolbar__search">
            <label className="form-label" htmlFor="fundraiser-search">
              Rechercher
            </label>
            <input
              id="fundraiser-search"
              type="search"
              placeholder="Titre ou description"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <div className="catalog-toolbar__filters">
            <div className="catalog-toolbar__filters-head">
              <span className="form-label">Catégories</span>
              <span className="catalog-toolbar__hint">Triées des plus récentes</span>
            </div>
            <div className="catalog-category-list" aria-label="Filtrer par catégorie">
              <button
                type="button"
                aria-pressed={selectedCategory === "all"}
                className={
                  selectedCategory === "all"
                    ? "catalog-category-chip catalog-category-chip--active"
                    : "catalog-category-chip"
                }
                onClick={() => setSelectedCategory("all")}
              >
                Toutes
              </button>
              {FUNDRAISER_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  className={
                    selectedCategory === category
                      ? "catalog-category-chip catalog-category-chip--active"
                      : "catalog-category-chip"
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              className="catalog-reset"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>

        {!error && !loading ? (
          <div className="catalog-results-bar">
            <strong>{total} cagnotte{total > 1 ? "s" : ""}</strong>
            <span>
              {selectedCategory === "all" ? "Toutes catégories" : selectedCategory}
            </span>
          </div>
        ) : null}

        {error ? <article className="panel">{error}</article> : null}
        {loading ? <article className="panel">Chargement des cagnottes...</article> : null}
        {!loading && !error && fundraisers.length === 0 ? (
          <article className="panel catalog-empty">
            <strong>
              {hasActiveFilters
                ? "Aucune cagnotte ne correspond à cette recherche."
                : "Aucune cagnotte publiée n'est encore disponible."}
            </strong>
            <p>
              {hasActiveFilters
                ? "Essaie une autre catégorie ou une recherche plus large dans le titre et la description."
                : "Les prochaines campagnes apparaîtront ici, triées des plus récentes aux plus anciennes."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Voir toutes les cagnottes
              </button>
            ) : null}
          </article>
        ) : null}
        {!error && fundraisers.length > 0 ? (
          <div className="grid">
            {fundraisers.map((fundraiser) => (
              <FundraiserCard key={fundraiser.id} fundraiser={fundraiser} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
