export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access: string;
};

export type RefreshResponse = {
  access: string;
};

export type RegisterRequest = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2?: string;
  level_english?: EnglishLevel;
  allow_save_audio?: boolean;
};

export type RegisterResponse = {
  id: number;
  email: string;
};

export type PasswordResetRequestPayload = {
  email: string;
};

export type PasswordResetConfirmPayload = {
  uid?: string;
  token: string;
  new_password: string;
};

export type UserProfileResponse = {
  level_english?: EnglishLevel | null;
  allow_save_audio?: boolean | null;
};

export type UserResponse = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  profile_complete?: boolean;
  profile?: UserProfileResponse | null;
};