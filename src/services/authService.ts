import { API_CONFIG } from '../config/constants';

// API response type for login (más flexible)
interface LoginResponse {
  acceso?: string;
  status?: string;
  success?: boolean;
  ok?: boolean;
  message?: string;
  usuario?: Array<{
    id?: string;
    id_usuario?: number;
    nombre?: string;
    username?: string;
    [key: string]: any;
  }>;
  user?: {
    id?: string;
    id_usuario?: number;
    nombre?: string;
    username?: string;
    cedula?: string;
    email?: string;
    rol?: string;
    [key: string]: any;
  };
  data?: Array<{
    id?: string;
    id_usuario?: number;
    nombre?: string;
    username?: string;
    [key: string]: any;
  }>;
  rol?: string;
  access_token?: string;
  token?: string;
  accessToken?: string;
  [key: string]: any;
}

// Base API URL
const API_URL = API_CONFIG.BASE_URL;

// Nota: apiRequest no se está usando actualmente
// Si necesitas una función genérica para llamadas API, puedes descomentarla

// Nota: Las funciones de customers se manejan en useCustomers.ts

// Login function
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();

  // Verificar si la respuesta tiene la estructura esperada
  if (!data) {
    throw new Error('No se recibieron datos del servidor');
  }

  // Verificar si el campo de autorización existe (más flexible)
  const acceso = data.acceso || data.status || data.success || data.ok;
  if (acceso === undefined) {
    console.error('Campos disponibles en la respuesta:', Object.keys(data));
    throw new Error('Respuesta del servidor inválida: no se encontró campo de acceso/autorización');
  }

  // Verificar si el acceso está autorizado (más flexible)
  const isAuthorized = acceso === 'AUTORIZADO' || acceso === 'authorized' || acceso === true || acceso === 'success' || acceso === true;
  if (!isAuthorized) {
    throw new Error('Access denied');
  }

  // Verificar si el campo 'usuario' existe y no está vacío (más flexible)
  const usuario = data.usuario || data.user || data.data;
  if (!usuario) {
    console.error('Campos disponibles en la respuesta:', Object.keys(data));
    throw new Error('Respuesta del servidor inválida: datos de usuario no encontrados');
  }

  // El campo usuario puede ser un objeto o un array
  // Si es un objeto, lo convertimos a array para mantener compatibilidad
  if (!Array.isArray(usuario)) {
    data.usuario = [usuario];
  } else {
    data.usuario = usuario;
  }

  if (data.usuario.length === 0) {
    throw new Error('Respuesta del servidor inválida: datos de usuario vacíos');
  }

  // Verificar si el campo 'access_token' existe (más flexible)
  const token = data.access_token || data.token || data.accessToken;
  if (!token) {
    console.error('Campos disponibles en la respuesta:', Object.keys(data));
    throw new Error('Respuesta del servidor inválida: token no encontrado');
  }

  // Asignar el token encontrado
  data.access_token = token;

  return data;
};

// Function to check if token is valid
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    const response = await fetch(`${API_URL}${API_CONFIG.ENDPOINTS.VALIDATE_TOKEN}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};