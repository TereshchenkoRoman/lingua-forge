import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { initAuthStore } from "../stores/authStore";
import api from "../api/axios";

type AuthContextValue = {
  getAccess: () => string | null;
  getUser: () => any | null;
  isReady: boolean;
  isAuthenticated: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAccess: (t: string | null, persist: boolean) => void;
  subscribe: (fn: () => void) => (() => void);
  refreshProfile: () => Promise<any>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = initAuthStore();
  const [, setTick] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const inflightProfileRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    const unsub = store.subscribe(() => setTick((t) => t + 1));
    let mounted = true;

    const init = async () => {
      try {
        const access = store.getAccess();
        if (!access) return;
        await refreshProfileInternal();
      } finally {
        if (mounted) setIsReady(true);
      }
    };

    init();

    return () => {
      mounted = false;
      unsub();
    };
  }, [store]);

  const refreshProfileInternal = async (): Promise<any> => {
    if (inflightProfileRef.current) return inflightProfileRef.current;

    inflightProfileRef.current = (async () => {
      try {
        const resp = await api.get("/auth/profile/");
        store.setUser(resp.data);
        return resp.data;
      } finally {
        inflightProfileRef.current = null;
      }
    })();

    return inflightProfileRef.current;
  };

  const refreshProfile = async (): Promise<any> => {
    return refreshProfileInternal();
  };

  const login = async (email: string, password: string) => {
    const resp = await api.post("/auth/login/", { email, password });
    const access = resp.data.access;
    store.setAccess(access, { persist: true });
    await refreshProfileInternal();
    if (!isReady) setIsReady(true);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout/", {});
    } catch {
      // ignore
    }
    store.logout();
    if (!isReady) setIsReady(true);
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    await api.post("/auth/password/change/", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  const value: AuthContextValue = {
    getAccess: () => store.getAccess(),
    getUser: () => store.getState().user,
    isReady,
    isAuthenticated: () => Boolean(store.getAccess()),
    login,
    logout,
    setAccess: (t: string | null, persist: boolean) => store.setAccess(t, { persist }),
    subscribe: (fn: () => void) => store.subscribe(fn),
    refreshProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

export default AuthProvider;