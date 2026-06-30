import AuthService from '../../../lib/auth/auth.service';
import type { UserResponse } from '../../../types/api';

export const ProfileService = {
  getProfile: (): Promise<UserResponse> => AuthService.getCurrentUser(),

  updateProfile: (payload: Partial<UserResponse>): Promise<UserResponse> =>
    AuthService.updateCurrentUser(payload),
};