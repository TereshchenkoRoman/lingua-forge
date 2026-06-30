import axios from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

type RefreshResponse = {
  access?: string;
  accessToken?: string;
  access_token?: string;
};

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

type FailedRequest = {
  resolve: (value: AxiosResponse | PromiseLike<AxiosResponse>) => void;
  reject: (error: unknown) => void;
  config: RetryableRequestConfig;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const REFRESH_PATH = '/api/v1/auth/token/refresh/';
const AUTHORIZATION_HEADER = 'Authorization';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

function getRefreshUrl(): string {
  return `${API_BASE.replace(/\/$/, '')}${REFRESH_PATH}`;
}

function setAuthorizationHeader(config: AxiosRequestConfig, token: string): void {
  config.headers = config.headers ?? {};
  config.headers[AUTHORIZATION_HEADER] = `Bearer ${token}`;
}

function removeAuthorizationHeader(config: InternalAxiosRequestConfig): void {
  delete config.headers[AUTHORIZATION_HEADER];
}

function getTokenFromRefreshResponse(data?: RefreshResponse): string | undefined {
  return data?.access || data?.accessToken || data?.access_token;
}

function processQueue(error: unknown, token?: string): void {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
      return;
    }

    if (token) {
      setAuthorizationHeader(config, token);
    }

    resolve(api.request(config));
  });

  failedQueue = [];
}

export function getAccessToken(): string | undefined {
  return accessToken ?? undefined;
}

export function setAccessToken(token: string | null): void {
  const normalizedToken = token?.trim();

  if (!normalizedToken) {
    clearAccessToken();
    return;
  }

  accessToken = normalizedToken;
  api.defaults.headers.common[AUTHORIZATION_HEADER] = `Bearer ${normalizedToken}`;
}

export function clearAccessToken(): void {
  accessToken = null;
  delete api.defaults.headers.common[AUTHORIZATION_HEADER];
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers[AUTHORIZATION_HEADER] = `Bearer ${token}`;
    } else {
      removeAuthorizationHeader(config);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || !error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
          config: originalRequest,
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post<RefreshResponse>(
        getRefreshUrl(),
        {},
        { withCredentials: true },
      );

      const newToken = getTokenFromRefreshResponse(data);

      if (!newToken) {
        throw new Error('No access token returned from refresh');
      }

      setAccessToken(newToken);
      processQueue(null, newToken);
      setAuthorizationHeader(originalRequest, newToken);

      return api.request(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      processQueue(refreshError);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;