import { CreditType } from '../types/creditTypes';

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

export const getCreditTypes = async (cedula: string): Promise<CreditType[]> => {
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
  
  return await response.json();
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