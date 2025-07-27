import { API_CONFIG } from '../config/constants';

// API response type for login
interface LoginResponse {
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
  
  if (data.acceso !== 'AUTORIZADO') {
    throw new Error('Access denied');
  }
  
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