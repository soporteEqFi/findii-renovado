export interface User {
  id: number;
  nombre: string;
  cedula: string;
  correo: string;
  contraseña?: string;
  rol: string;
  reports_to_id?: number | null;
  reports_to_nombre?: string | null;
  created_at?: string;
  empresa?: string;
  empresa_id?: number;
  imagen_aliado?: string | null;
  apellido?: string;
  usuario?: string;
  info_extra?: UserInfoExtra;
}

export interface UserInfoExtra {
  ciudad?: string;
  banco_nombre?: string;
  linea_credito?: string;
  // Campos para usuarios temporales
  usuario_activo?: boolean;
  tiempo_conexion?: string; // Formato DD/MM/YYYY
  [key: string]: any; // Para otros campos dinámicos
}

// Interfaz para crear/actualizar usuarios
export interface CreateUserData {
  nombre: string;
  cedula: string;
  correo: string;
  contraseña: string;
  rol: string;
  reports_to_id?: number | null;
  info_extra?: UserInfoExtra;
}

export interface UpdateUserData {
  nombre?: string;
  cedula?: string;
  correo?: string;
  contraseña?: string;
  rol?: string;
  reports_to_id?: number | null;
  info_extra?: UserInfoExtra;
}