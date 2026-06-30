import type { UserResponse } from './api';

export type AuthUser = Pick<
  UserResponse,
  'id' | 'email' | 'first_name' | 'last_name'
>;

export type AuthState = {
  isAuthenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
};