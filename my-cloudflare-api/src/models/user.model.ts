export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // Optional untuk Google users
  email_verified: boolean;
  verification_token?: string;
  verification_token_expires?: string;
  reset_token?: string;
  reset_token_expires?: string;
  google_id?: string;
  provider: 'local' | 'google';
  avatar_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password?: string; // Optional untuk Google users
  google_id?: string;
  provider?: 'local' | 'google';
  avatar_url?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  email_verified: boolean;
  provider: 'local' | 'google';
  avatar_url?: string;
  createdAt: string;
  updatedAt: string;
}
