export interface User {
  id: number;
  nombre: string;
  cedula: string;
  correo: string;
  contraseña?: string;
  rol: string;
  created_at?: string;
  empresa?: string;
  imagen_aliado?: string | null;
  apellido?: string;
  usuario?: string;
  info_extra?: UserInfoExtra;
}

export interface UserInfoExtra {
  ciudad?: string;
  banco_nombre?: string;
  linea_credito?: string;
  [key: string]: any; // Para otros campos dinámicos
}

// Interfaz para crear/actualizar usuarios
export interface CreateUserData {
  nombre: string;
  cedula: string;
  correo: string;
  contraseña: string;
  rol: string;
  info_extra?: UserInfoExtra;
}

export interface UpdateUserData {
  nombre?: string;
  cedula?: string;
  correo?: string;
  contraseña?: string;
  rol?: string;
  info_extra?: UserInfoExtra;
}