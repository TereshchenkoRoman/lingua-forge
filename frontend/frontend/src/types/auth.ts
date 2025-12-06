export interface AuthState {
  access: string | null;
  user: UserProfile | null;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_email_confirmed: boolean;
  profile?: {
    level_english: string;
    allow_save_audio: boolean;
  };
}