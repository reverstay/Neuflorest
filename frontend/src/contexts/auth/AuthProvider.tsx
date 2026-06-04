import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from "react";

import type { AuthResponse, AuthUser } from "../../api";

export type AuthTokens = {
  access: string;
  refresh: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  completeLogin: (response: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  const completeLogin = useCallback((response: AuthResponse) => {
    setUser(response.user);
    setTokens({
      access: response.access,
      refresh: response.refresh,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTokens(null);
  }, []);

  const value = useMemo(
    () => ({ user, tokens, completeLogin, logout }),
    [user, tokens, completeLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
