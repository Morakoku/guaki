export type UserRole = 'consumer' | 'client' | 'provider' | 'admin';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  providerId?: string;
  status?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: UserSession | null;
  token: string | null;
  error?: string;
}
