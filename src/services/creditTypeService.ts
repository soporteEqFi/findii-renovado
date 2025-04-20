import { CreditType } from '../types/creditTypes';
import { cacheService } from './cacheService';

const API_URL = 'http://127.0.0.1:5000';

// Función auxiliar para convertir una cadena de camelCase a snake_case
const camelToSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Función para convertir todas las claves de un objeto de camelCase a snake_case
const convertKeysToSnakeCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCase(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnakeCase(key);
    acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
    return acc;
  }, {} as any);
};

const CREDIT_TYPES_CACHE_KEY = 'credit_types';

export const getCreditTypes = async (cedula: string): Promise<CreditType[]> => {
  // Intentar obtener los datos del caché
  const cachedData = cacheService.get<CreditType[]>(`${CREDIT_TYPES_CACHE_KEY}_${cedula}`);
  if (cachedData) {
    console.log('Usando datos en caché para tipos de crédito');
    return cachedData;
  }

  // Si no hay caché, hacer la petición a la API
  console.log('Obteniendo tipos de crédito desde la API');
  const response = await fetch(`${API_URL}/get-all-credit-types/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cedula
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al obtener tipos de crédito');
  }
  
  const responseData = await response.json();
  const creditTypes = responseData.data || [];
  
  // Guardar los datos en el caché
  if (Array.isArray(creditTypes)) {
    cacheService.set(`${CREDIT_TYPES_CACHE_KEY}_${cedula}`, creditTypes);
  }
  
  return Array.isArray(creditTypes) ? creditTypes : [];
};

// Función para limpiar el caché de tipos de crédito
export const clearCreditTypesCache = (cedula: string): void => {
  cacheService.clear(`${CREDIT_TYPES_CACHE_KEY}_${cedula}`);
};

export const getCreditTypeById = async (id: string): Promise<CreditType> => {
  const response = await fetch(`${API_URL}/credit-types/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al obtener tipo de crédito');
  }
  
  return await response.json();
};

export const createCreditType = async (creditType: CreditType, cedula: string): Promise<CreditType> => {
  const snakeCaseCreditType = convertKeysToSnakeCase(creditType);
  
  const response = await fetch(`${API_URL}/add-credit-type/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credit_type: snakeCaseCreditType,
      cedula: cedula
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al crear tipo de crédito');
  }
  
  return await response.json();
};

export const updateCreditType = async (creditType: CreditType): Promise<CreditType> => {
  console.log('Original:', creditType);
  
  // Convertir todas las propiedades de camelCase a snake_case
  const snakeCaseCreditType = convertKeysToSnakeCase(creditType);
  console.log('Convertido a snake_case:', snakeCaseCreditType);
  
  const response = await fetch(`${API_URL}/edit-credit-type/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snakeCaseCreditType),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al actualizar tipo de crédito');
  }
  
  return await response.json();
};

export const deleteCreditType = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/credit-types/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al eliminar tipo de crédito');
  }
};