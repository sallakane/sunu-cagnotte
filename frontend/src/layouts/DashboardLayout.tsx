import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../app/AuthProvider";
import { Brand } from "../components/Brand";

const dashboardLinks = [
  { to: "/espace", label: "Vue d'ensemble" },
  { to: "/espace/cagnottes", label: "Mes cagnottes" },
  { to: "/espace/cagnottes/nouvelle", label: "Nouvelle cagnotte" },
  { to: "/espace/profil", label: "Profil" },
];

export function DashboardLayout() {
  const auth = useAuth();

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Brand
          className="brand--stacked"
          title="Espace createur"
          subtitle="Gestion des cagnottes"
          mark="CS"
        />

        <nav className="dashboard-nav" aria-label="Navigation dashboard">
          {dashboardLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/espace"}
              className={({ isActive }) =>
                isActive
                  ? "dashboard-nav__link dashboard-nav__link--active"
                  : "dashboard-nav__link"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-sidebar__actions">
          {auth.isAdmin ? (
            <NavLink to="/admin" className="dashboard-nav__link">
              Administration
            </NavLink>
          ) : null}
          <NavLink to="/" className="dashboard-nav__link">
            Retour au site
          </NavLink>
          <button
            type="button"
            className="dashboard-nav__link dashboard-nav__button"
            onClick={auth.logout}
          >
            Se deconnecter
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
