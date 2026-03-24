import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { parseJwtPayload } from "../lib/jwt";

const AUTH_TOKEN_KEY = "cagnotte.auth.token";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  roles: string[];
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  });
  const roles = parseJwtPayload(token)?.roles ?? [];

  useEffect(() => {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
      return;
    }

    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: token !== null,
        roles,
        isAdmin: roles.includes("ROLE_ADMIN"),
        login: setToken,
        logout: () => setToken(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
