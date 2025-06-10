export interface User {
  id: number;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateInput {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}
