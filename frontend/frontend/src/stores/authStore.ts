// frontend/src/auth/useAuth.ts
// AuthStore singleton for managing access token and user info.
// Integrates with existing api axios instance (api) to keep Authorization header in sync.

import api from "../api/axios";
import type { AuthState, UserProfile } from "../types/auth";

const ACCESS_STORAGE_KEY = "access";

let store: AuthStore | null = null;

export class AuthStore {
  private state: AuthState = { access: null, user: null };
  private listeners: Array<() => void> = [];
  private inflightProfile: Promise<any> | null = null;

  constructor() {
    // Load persisted access token if present. Use persist: false to avoid writing back during init.
    try {
      const saved = localStorage.getItem(ACCESS_STORAGE_KEY);
      if (saved) {
        this.setAccess(saved, { persist: false });
      }
    } catch {
      // Ignore localStorage errors during initialization.
    }
  }

  getState(): AuthState {
    return this.state;
  }

  getAccess(): string | null {
    return this.state.access;
  }

  getUser(): UserProfile | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return Boolean(this.state.access);
  }

  /**
   * Set or remove access token.
   * @param token - token string or null to remove
   * @param opts.persist - if true, write to localStorage; default true
   */
  setAccess(token: string | null, opts: { persist?: boolean } = { persist: true }) {
    this.state.access = token;

    if (token) {
      // Keep axios default header in sync for requests that don't rely on interceptors.
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      if (opts.persist) {
        try {
          localStorage.setItem(ACCESS_STORAGE_KEY, token);
        } catch {
          // ignore storage errors
        }
      }
    } else {
      delete api.defaults.headers.common["Authorization"];
      try {
        localStorage.removeItem(ACCESS_STORAGE_KEY);
      } catch {
        // ignore
      }
    }

    this.emit();
  }

  setUser(user: UserProfile | null) {
    this.state.user = user;
    this.emit();
  }

  /**
   * Clear local auth state only.
   */
  logout() {
    this.state = { access: null, user: null };
    delete api.defaults.headers.common["Authorization"];
    try {
      localStorage.removeItem(ACCESS_STORAGE_KEY);
    } catch {
      // ignore
    }
    this.emit();
  }

  /**
   * Subscribe to store changes. Returns unsubscribe function.
   */
  subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // swallow listener errors
      }
    });
  }

  /**
   * Fetch profile from backend with in-flight deduplication.
   * Returns the backend response (resp.data).
   */
  async refreshProfile(): Promise<any> {
    if (this.inflightProfile) return this.inflightProfile;

    this.inflightProfile = (async () => {
      try {
        const resp = await api.get("/auth/profile/");
        // store.setUser expects the backend format; store the returned payload as-is
        this.setUser(resp.data);
        return resp.data;
      } finally {
        this.inflightProfile = null;
      }
    })();

    return this.inflightProfile;
  }
}

/**
 * Initialize and return singleton store.
 */
export const initAuthStore = (): AuthStore => {
  if (!store) store = new AuthStore();
  return store;
};

/**
 * Return store instance; if not initialized yet, initialize it.
 * This guarantees non-null store for callers outside React tree (e.g. redirect handlers).
 */
export const getAuthStore = (): AuthStore => {
  if (!store) store = new AuthStore();
  return store;
};

/**
 * Default initializer used by components/hooks.
 */
export default function useAuthProvider(): AuthStore {
  if (!store) store = new AuthStore();
  return store;
}