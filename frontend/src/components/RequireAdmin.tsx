import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../app/AuthProvider";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  if (!auth.isAdmin) {
    return <Navigate to="/espace" replace />;
  }

  return children;
}
