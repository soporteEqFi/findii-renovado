export interface Customer {
  id: string;
  nombre?: string;
  numero_documento?: string;
  correo?: string;
  numero_celular?: string;
  ciudad_gestion?: string;
  producto_solicitado?: string;
  banco?: string;
  estado?: string;
  solicitante_id?: string;
  [key: string]: any; // For any other properties
}

export interface User {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}