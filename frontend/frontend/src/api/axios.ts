import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getAuthStore } from "../stores/authStore";

if (!import.meta.env.VITE_API_URL) {
  throw new Error("VITE_API_URL environment variable is required");
}
const API_URL = import.meta.env.VITE_API_URL;

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const authApi: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function getCookie(name: string): string | null {
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1]);
}

type ExtendedRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

type QueueResolve = (token: string | null) => void;
type QueueReject = (err: any) => void;
type QueueItem = { resolve: QueueResolve; reject: QueueReject; config: ExtendedRequestConfig };

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token);
    }
  });
  failedQueue = [];
};

const isAuthEndpoint = (url?: string | null): boolean => {
  if (!url) return false;
  const path = url.toLowerCase();
  return (
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/token/refresh") ||
    path.includes("/auth/logout") ||
    path.includes("/auth/google/complete") ||
    path.includes("/auth/google/url")
  );
};

api.interceptors.request.use(
  (config) => {
    try {
      const store = getAuthStore();
      const access = store?.getAccess();
      if (access && config.headers) {
        config.headers["Authorization"] = `Bearer ${access}`;
      }
    } catch {
      // continue without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = (error?.config || {}) as ExtendedRequestConfig;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;

    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const store = getAuthStore();

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              try {
                if (token && originalRequest.headers) {
                  originalRequest.headers["Authorization"] = `Bearer ${token}`;
                }
                resolve(api(originalRequest));
              } catch (e) {
                reject(e);
              }
            },
            reject: (err) => reject(err),
            config: originalRequest,
          });
        });
      }

      isRefreshing = true;
      try {
        const csrfToken = getCookie("csrftoken");
        const headers: Record<string, string> = {};
        if (csrfToken) headers["X-CSRFToken"] = csrfToken;

        const resp = await authApi.post("/auth/token/refresh/", {}, { headers });

        const newAccess: string | undefined = resp.data?.access;
        if (!newAccess) {
          throw new Error("Refresh endpoint did not return access token");
        }

        store?.setAccess(newAccess);
        processQueue(null, newAccess);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        } else {
          originalRequest.headers = { Authorization: `Bearer ${newAccess}` };
        }
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        try {
          store?.logout();
        } catch {
          // swallow
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
