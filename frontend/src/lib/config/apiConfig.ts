export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_PATHS = {
  login: '/api/v1/auth/login/',
  refresh: '/api/v1/auth/token/refresh/',
  logout: '/api/v1/auth/logout/',
  register: '/api/v1/auth/register/',
  emailConfirm: '/api/v1/auth/email/confirm/',
  passwordReset: '/api/v1/auth/password-reset/',
  passwordResetConfirm: '/api/v1/auth/password-reset/confirm/',
  oauthGoogleUrl: '/api/v1/auth/google/url/',
  oauthGoogleComplete: '/api/v1/auth/google/complete/',
  currentUser: '/api/v1/auth/profile/',
} as const;