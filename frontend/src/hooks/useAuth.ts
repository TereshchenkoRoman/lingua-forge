import { create } from 'zustand';

import type { AuthState } from '../types/auth';

type AuthActions = {
  setAuthenticated: (user: AuthState['user']) => void;
  setUnauthenticated: () => void;
  setLoading: (loading: boolean) => void;
};

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  user: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setAuthenticated: (user) =>
    set({
      isAuthenticated: true,
      loading: false,
      user,
    }),

  setUnauthenticated: () => set(initialState),

  setLoading: (loading) => set({ loading }),
}));

export default useAuthStore;