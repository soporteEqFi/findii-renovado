// Re-export types from their specific files
export * from './customer';
export * from './user';
export * from './creditTypes';

// Tipo para estados de crédito
export type CreditStatus =
  | 'Pendiente'
  | 'En estudio'
  | 'Pendiente información adicional'
  | 'Aprobado'
  | 'Desembolsado'
  | 'Pagado'
  | 'Negado'
  | 'Desistido';

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