import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import useAuthStore from './useAuth';
import { useCurrentUser } from './useUser';

export function useRequireAuth(redirectTo = '/auth/login'): void {
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useCurrentUser();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      setAuthenticated({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      });

      return;
    }

    if (isError || !user) {
      setUnauthenticated();
      navigate(redirectTo, { replace: true });
    }
  }, [
    user,
    isLoading,
    isError,
    redirectTo,
    navigate,
    setAuthenticated,
    setUnauthenticated,
  ]);
}