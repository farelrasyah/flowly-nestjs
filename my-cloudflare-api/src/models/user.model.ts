export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  email_verified: boolean;
  verification_token?: string;
  verification_token_expires?: string;
  reset_token?: string;
  reset_token_expires?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  email_verified: boolean;
  createdAt: string;
  updatedAt: string;
}
