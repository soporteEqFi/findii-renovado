// Re-export types from their specific files
export * from './user';
export * from './customer';
export * from './esquemas';
export * from './fieldDefinition';
export * from './notification';

// Tipo para documentos
export interface Document {
  id: number;
  nombre: string;
  documento_url: string;
  solicitante_id: number;
  created_at: string;
  updated_at: string;
  file_size?: number;
}

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

// Tipo para respuesta de API
export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
  error?: string;
}