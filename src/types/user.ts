export interface User {
  id: number;
  nombre: string;
  rol: string;
  email: string;
  cedula: string;
  empresa: string;
  password?: string;
  imagen_aliado?: string | null;
  apellido?: string;
  usuario?: string;
  info_extra?: {
    banco_nombre: string;
    ciudad: string;
    linea_credito: string;
  };
}