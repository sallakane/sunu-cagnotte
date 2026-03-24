import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../app/AuthProvider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return (
      <Navigate
        to="/connexion"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
}
