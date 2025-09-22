import { API_CONFIG } from '../config/constants';

// Tipos base para respuestas API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Configuración base para headers
const getBaseHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Agregar headers de empresa y usuario
  const empresaId = localStorage.getItem('empresa_id');
  const userId = localStorage.getItem('user_id');

  if (empresaId) {
    headers['X-Empresa-Id'] = empresaId;
  }

  if (userId) {
    headers['X-User-Id'] = userId;
  }

  return headers;
};

// Función base para llamadas API
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: getBaseHeaders(),
    ...options,
  };

  const response = await fetch(url, config);

  console.log('API Response Info:', {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    ok: response.ok,
    contentType: response.headers.get('content-type')
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
      body: errorText.substring(0, 500) // Primeros 500 caracteres
    });
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  // Verificar si la respuesta es JSON antes de parsear
  const contentType = response.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    const responseText = await response.text();
    console.error('Non-JSON Response:', {
      contentType,
      body: responseText.substring(0, 500)
    });
    throw new Error(`Expected JSON but got ${contentType}: ${responseText.substring(0, 100)}`);
  }

  return response.json();
};

// Funciones helper para métodos HTTP comunes
export const apiGet = <T>(endpoint: string): Promise<T> => {
  return apiCall<T>(endpoint, { method: 'GET' });
};

export const apiPost = <T>(endpoint: string, data: any): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const apiPut = <T>(endpoint: string, data: any): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const apiPatch = <T>(endpoint: string, data: any): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const apiDelete = <T>(endpoint: string): Promise<T> => {
  return apiCall<T>(endpoint, { method: 'DELETE' });
};