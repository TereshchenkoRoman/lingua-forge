import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import AuthService from '../../../lib/auth/auth.service';

const currentUserQueryKey = ['currentUser'];

export function useAuthForms() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLoginSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    navigate('/dashboard', { replace: true });
  }, [navigate, queryClient]);

  const handleLogout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.warn('Logout request failed', error);
    } finally {
      queryClient.removeQueries({ queryKey: currentUserQueryKey });
      navigate('/auth/login', { replace: true });
    }
  }, [navigate, queryClient]);

  return {
    handleLoginSuccess,
    handleLogout,
  };
}