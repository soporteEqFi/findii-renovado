import { CreditType } from '../types/creditTypes';

const API_URL = 'http://127.0.0.1:5000';

export const getCreditTypes = async (): Promise<CreditType[]> => {
  const response = await fetch(`${API_URL}/credit-types/`);
  
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

export const createCreditType = async (creditType: CreditType): Promise<CreditType> => {
  const response = await fetch(`${API_URL}/credit-types/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(creditType),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al crear tipo de crédito');
  }
  
  return await response.json();
};

export const updateCreditType = async (creditType: CreditType): Promise<CreditType> => {
  const response = await fetch(`${API_URL}/credit-types/${creditType.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(creditType),
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