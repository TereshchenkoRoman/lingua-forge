import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import AuthService from '../../lib/auth/auth.service';
import type { LoginRequest, UserResponse } from '../../types/api';

type AuthContextValue = {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

const currentUserQueryKey = ['currentUser'];
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        await AuthService.refresh();

        const currentUser = await AuthService.getCurrentUser();

        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (payload: LoginRequest) => {
      await AuthService.login(payload);

      const currentUser = await AuthService.getCurrentUser();

      setUser(currentUser);
      queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
      queryClient.removeQueries({ queryKey: currentUserQueryKey });
    }
  }, [queryClient]);

  const refresh = useCallback(async () => {
    await AuthService.refresh();

    const currentUser = await AuthService.getCurrentUser();

    setUser(currentUser);
    queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
  }, [queryClient]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}