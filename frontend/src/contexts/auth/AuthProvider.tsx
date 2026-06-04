import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { refreshAccessToken, type AuthResponse, type AuthUser } from "../../api";

export type AuthTokens = {
  access: string;
  refresh: string;
};

type PersistedAuthSession = {
  user: AuthUser;
  tokens: AuthTokens;
};

type AuthContextValue = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  completeLogin: (response: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_STORAGE_KEY = "neuflower.auth.session";

function readPersistedSession(): PersistedAuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession) as Partial<PersistedAuthSession>;

    if (!parsedSession.user || !parsedSession.tokens?.access || !parsedSession.tokens.refresh) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsedSession as PersistedAuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function persistSession(session: PersistedAuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearPersistedSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<PersistedAuthSession | null>(readPersistedSession);

  useEffect(() => {
    const refreshToken = session?.tokens.refresh;

    if (!refreshToken) {
      return;
    }

    let isActive = true;

    refreshAccessToken(refreshToken)
      .then(({ access }) => {
        if (!isActive) {
          return;
        }

        setSession((currentSession) => {
          if (!currentSession || currentSession.tokens.refresh !== refreshToken) {
            return currentSession;
          }

          const refreshedSession = {
            ...currentSession,
            tokens: {
              ...currentSession.tokens,
              access,
            },
          };

          persistSession(refreshedSession);
          return refreshedSession;
        });
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setSession((currentSession) => {
          if (currentSession?.tokens.refresh === refreshToken) {
            clearPersistedSession();
            return null;
          }

          return currentSession;
        });
      });

    return () => {
      isActive = false;
    };
  }, [session?.tokens.refresh]);

  const completeLogin = useCallback((response: AuthResponse) => {
    const nextSession = {
      user: response.user,
      tokens: {
        access: response.access,
        refresh: response.refresh,
      },
    };

    persistSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearPersistedSession();
    setSession(null);
  }, []);

  const user = session?.user ?? null;
  const tokens = session?.tokens ?? null;

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
