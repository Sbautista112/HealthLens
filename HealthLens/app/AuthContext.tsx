import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ActivityIndicator, View } from "react-native";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  type User,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { fetchWithAuth } from "../api/client";

export type AuthContextValue = {
  user: User | null;
  idToken: string | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  tokenError: Error | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Returns a bound `fetch` that attaches `Authorization: Bearer <idToken>`. */
export function useFetchWithAuth() {
  const { getIdToken } = useAuth();
  return useCallback(
    (input: RequestInfo | URL, init?: RequestInit) =>
      fetchWithAuth(() => getIdToken(), input, init),
    [getIdToken]
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    const unsubToken = onIdTokenChanged(auth, (firebaseUser) => {
      setTokenError(null);
      if (!firebaseUser) {
        setIdToken(null);
        return;
      }
      firebaseUser
        .getIdToken()
        .then((t) => setIdToken(t))
        .catch((e) => {
          const err = e instanceof Error ? e : new Error(String(e));
          setTokenError(err);
          setIdToken(null);
        });
    });
    return () => {
      unsubAuth();
      unsubToken();
    };
  }, []);

  const getIdToken = useCallback(async (forceRefresh?: boolean) => {
    if (user === undefined || user === null) return null;
    try {
      setTokenError(null);
      const t = await user.getIdToken(forceRefresh);
      setIdToken(t);
      return t;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setTokenError(err);
      return null;
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      idToken,
      getIdToken,
      tokenError,
    }),
    [user, idToken, getIdToken, tokenError]
  );

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
