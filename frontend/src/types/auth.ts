// types/auth.ts

export type UserRole = 'ADMIN' | 'AUTHOR' | 'RETAIL';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  userId: string;
  role: UserRole;
}
