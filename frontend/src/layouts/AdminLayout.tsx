import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../app/AuthProvider";
import { Brand } from "../components/Brand";

const adminLinks = [
  { to: "/admin", label: "Validation cagnottes" },
  { to: "/admin/donateurs", label: "Donateurs et dons" },
];

export function AdminLayout() {
  const auth = useAuth();

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Brand
          className="brand--stacked"
          title="Espace admin"
          subtitle="Moderation et publication"
          mark="AD"
        />

        <nav className="dashboard-nav" aria-label="Navigation admin">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
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
          <NavLink to="/" className="dashboard-nav__link">
            Retour au site
          </NavLink>
          <NavLink to="/espace" className="dashboard-nav__link">
            Espace createur
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
