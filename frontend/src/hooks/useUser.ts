import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import AuthService from '../lib/auth/auth.service';
import type { UserResponse } from '../types/api';

const currentUserQueryKey = ['currentUser'] as const;
const currentUserStaleTime = 1000 * 60 * 5;

type UpdateUserContext = {
  previous?: UserResponse;
};

export function useCurrentUser() {
  return useQuery<UserResponse, Error>({
    queryKey: currentUserQueryKey,
    queryFn: AuthService.getCurrentUser,
    retry: 1,
    staleTime: currentUserStaleTime,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, Partial<UserResponse>, UpdateUserContext>({
    mutationFn: AuthService.updateCurrentUser,

    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: currentUserQueryKey });

      const previous = queryClient.getQueryData<UserResponse>(currentUserQueryKey);

      if (previous) {
        queryClient.setQueryData<UserResponse>(currentUserQueryKey, {
          ...previous,
          ...patch,
        });
      }

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData<UserResponse>(currentUserQueryKey, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    },
  });
}