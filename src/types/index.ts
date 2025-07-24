// Re-export types from their specific files
export type { Customer } from './customer';
export type { User } from './user';
export type { CreditType, CreditTypeField, FieldValidation } from './creditTypes';

// API response types
export interface LoginResponse {
  acceso: string;
  usuario: Array<{
    id?: string;
    id_usuario?: number;
    nombre?: string;
    username?: string;
    [key: string]: any;
  }>;
  rol: string;
  access_token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 