import api, { clearAccessToken, setAccessToken } from '../api/axios';
import { API_PATHS } from '../config/apiConfig';
import type {
  LoginRequest,
  LoginResponse,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  UserResponse,
} from '../../types/api';

type TokenResponse = {
  access?: string;
  access_token?: string;
  accessToken?: string;
};

type GoogleOAuthUrlResponse = {
  url?: string;
  auth_url?: string;
  authUrl?: string;
};

function extractToken(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const { access, access_token, accessToken } = data as TokenResponse;

  return access || access_token || accessToken;
}

function handleTokenFromResponse(data: unknown): string | undefined {
  const token = extractToken(data);

  if (token) {
    setAccessToken(token);
  }

  return token;
}

export class AuthService {
  static async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(API_PATHS.login, payload, {
      withCredentials: true,
    });

    handleTokenFromResponse(data);

    return data;
  }

  static async refresh(): Promise<RefreshResponse> {
    const { data } = await api.post<RefreshResponse>(
      API_PATHS.refresh,
      {},
      { withCredentials: true },
    );

    handleTokenFromResponse(data);

    return data;
  }

  static async logout(refresh?: string): Promise<void> {
    try {
      await api.post(
        API_PATHS.logout,
        refresh ? { refresh } : {},
        { withCredentials: true },
      );
    } finally {
      clearAccessToken();
    }
  }

  static async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>(API_PATHS.register, payload, {
      withCredentials: true,
    });

    handleTokenFromResponse(data);

    return data;
  }

  static async requestPasswordReset(
    payload: PasswordResetRequestPayload,
  ): Promise<void> {
    await api.post(API_PATHS.passwordReset, payload);
  }

  static async confirmPasswordReset(
    payload: PasswordResetConfirmPayload,
  ): Promise<void> {
    await api.post(API_PATHS.passwordResetConfirm, payload);
  }

  static async getGoogleOAuthUrl(): Promise<GoogleOAuthUrlResponse> {
    const { data } = await api.get<GoogleOAuthUrlResponse>(API_PATHS.oauthGoogleUrl, {
      withCredentials: true,
    });

    return data;
  }

  static async completeGoogleOAuth(): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(
      API_PATHS.oauthGoogleComplete,
      {},
      { withCredentials: true },
    );

    handleTokenFromResponse(data);

    return data;
  }

  static async confirmEmail(token: string): Promise<void> {
    await api.get(API_PATHS.emailConfirm, {
      params: { token },
    });
  }

  static async getCurrentUser(): Promise<UserResponse> {
    const { data } = await api.get<UserResponse>(API_PATHS.currentUser);

    return data;
  }

  static async updateCurrentUser(
    payload: Partial<UserResponse>,
  ): Promise<UserResponse> {
    const { data } = await api.put<UserResponse>(API_PATHS.currentUser, payload);

    return data;
  }
}

export default AuthService;