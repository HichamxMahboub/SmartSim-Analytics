import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { api } from "../services/api";
import type { AuthResponse, User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser(): User | null {
  const raw = localStorage.getItem("smartsim_user");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem("smartsim_user");
    localStorage.removeItem("smartsim_token");
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("smartsim_token"));
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const persistSession = useCallback((response: AuthResponse) => {
    localStorage.setItem("smartsim_token", response.token);
    localStorage.setItem("smartsim_user", JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
      persistSession(data);
    },
    [persistSession]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
      persistSession(data);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("smartsim_token");
    localStorage.removeItem("smartsim_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}

