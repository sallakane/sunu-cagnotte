import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthProvider";
import { Brand } from "./Brand";

const navItems = [
  { to: "/cagnottes", label: "Cagnottes" },
  { to: "/faq", label: "FAQ" },
  { to: "/qui-sommes-nous", label: "Qui sommes-nous" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const auth = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    auth.logout();
  };

  const headerClassName = [
    "site-header",
    isScrolled ? "site-header--scrolled" : "",
    isMenuOpen ? "site-header--menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClassName}>
      <div className="site-header__content">
        <div className="site-header__bar">
          <Brand
            to="/"
            title="Cagnotte Solidaire"
            subtitle="Sénégal"
            className="brand--header"
            hideText
          />

          <button
            type="button"
            className="site-header__menu-toggle"
            aria-expanded={isMenuOpen}
            aria-controls="site-header-panel"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span className="site-header__menu-toggle-label">Menu</span>
            <span className="site-header__menu-toggle-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        <div
          id="site-header-panel"
          className={isMenuOpen ? "site-header__panel site-header__panel--open" : "site-header__panel"}
        >
          <nav className="site-nav" aria-label="Navigation principale">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleMenuClose}
                className={({ isActive }) =>
                  isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            {auth.isAuthenticated ? (
              <>
                {auth.isAdmin ? (
                  <Link to="/admin" className="button button--ghost" onClick={handleMenuClose}>
                    Administration
                  </Link>
                ) : null}
                <Link to="/espace" className="button button--ghost" onClick={handleMenuClose}>
                  Mon espace
                </Link>
                <Link
                  to="/espace/cagnottes/nouvelle"
                  className="button"
                  onClick={handleMenuClose}
                >
                  Créer une cagnotte
                </Link>
                <button type="button" className="button" onClick={handleLogout}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="button button--ghost" onClick={handleMenuClose}>
                  Connexion
                </Link>
                <Link to="/connexion" className="button" onClick={handleMenuClose}>
                  Créer une cagnotte
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
