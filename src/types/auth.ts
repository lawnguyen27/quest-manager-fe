export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface User {
  id: number;
  email: string;
  fullName: string;
  roleName: 'CUSTOMER' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SigninRequest {
  email: string;
  pass: string;
}

export interface SignupRequest {
  email: string;
  pass: string;
  birthday: string; // ISO format YYYY-MM-DD
  phone?: string;
  fullName?: string;
  gender?: Gender;
  city?: string;
  address?: string;
}
