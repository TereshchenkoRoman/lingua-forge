import { authApi } from "./axios";

export interface GoogleUrlResponse {
  auth_url: string;
}

export interface CompleteAuthResponse {
  access: string;
  user?: any;
}

export async function getGoogleAuthUrl(): Promise<GoogleUrlResponse> {
  const resp = await authApi.get<GoogleUrlResponse>("/auth/google/url/", {
    withCredentials: true,
  });
  return resp.data;
}

export async function completeGoogleAuth(): Promise<CompleteAuthResponse> {
  const resp = await authApi.post<CompleteAuthResponse>(
    "/auth/google/complete/",
    {},
    { withCredentials: true }
  );
  return resp.data;
}
