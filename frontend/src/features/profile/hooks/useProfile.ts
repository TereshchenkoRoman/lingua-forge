import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UserResponse } from '../../../types/api';
import { ProfileService } from '../service/profile.service';

const profileQueryKey = ['profile'] as const;
const profileStaleTime = 1000 * 60 * 5;

export function useProfile() {
  return useQuery<UserResponse, Error>({
    queryKey: profileQueryKey,
    queryFn: ProfileService.getProfile,
    staleTime: profileStaleTime,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, Partial<UserResponse>, { previous?: UserResponse }>({
    mutationFn: ProfileService.updateProfile,

    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: profileQueryKey });

      const previous = queryClient.getQueryData<UserResponse>(profileQueryKey);

      if (previous) {
        queryClient.setQueryData<UserResponse>(profileQueryKey, {
          ...previous,
          ...patch,
        });
      }

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData<UserResponse>(profileQueryKey, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}