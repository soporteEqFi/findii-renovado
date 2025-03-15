// Customer type definition
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  lastContact: string;
}

// User type definition
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  email?: string;
  access_token?: string;
}

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