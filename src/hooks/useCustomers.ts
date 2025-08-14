import { useState, useCallback } from 'react';
import { Customer } from '../types/customer';
import { buildApiUrl, API_CONFIG } from '../config/constants';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener la cédula del asesor desde localStorage
      const cedula = localStorage.getItem('cedula') || '';

      if (!cedula) {
        console.error('No se encontró la cédula del asesor en localStorage');
        setError('Error: No se encontró la información del asesor');
        setCustomers([]);
        return;
      }

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.GET_COMBINED_DATA), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          cedula: cedula
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      console.log('API Response raw:', data);

      if (data.datos_combinados && Array.isArray(data.datos_combinados)) {
        setCustomers(data.datos_combinados);
        setTotalRecords(data.datos_combinados.length);
      } else {
        console.error('Invalid data structure received:', data);
        setCustomers([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
      setError(err instanceof Error ? err.message : 'Error loading customers');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCustomer = async (customer: Customer) => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener la cédula del asesor
      const cedula = localStorage.getItem('cedula') || '';

      if (!cedula) {
        throw new Error('No se encontró la información del asesor');
      }

      // Preparar los datos del cliente para enviar como JSON
      const customerData = {
        ...customer,
        cedula: cedula
      };

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EDIT_RECORD), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.message || 'Failed to update customer');
      }

      const updatedCustomer = await response.json();

      // Actualizar la lista de clientes con el cliente actualizado
      setCustomers(prevCustomers =>
        prevCustomers.map(c =>
          c.id === customer.id ? { ...c, ...updatedCustomer } : c
        )
      );

      return updatedCustomer;
    } catch (err) {
      console.error('Error updating customer:', err);
      setError(err instanceof Error ? err.message : 'Error updating customer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener la cédula del asesor
      const cedula = localStorage.getItem('cedula') || '';

      if (!cedula) {
        throw new Error('No se encontró la información del asesor');
      }

      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.DELETE_CUSTOMER}/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          cedula: cedula
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      // Actualizar la lista de clientes eliminando el cliente borrado
      setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err instanceof Error ? err.message : 'Error deleting customer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (customer: Customer, newStatus: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener la cédula del asesor
      const cedula = localStorage.getItem('cedula') || '';

      if (!cedula) {
        throw new Error('No se encontró la información del asesor');
      }

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EDIT_STATUS), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          estado: newStatus,
          id: customer.id,
          numero_documento: customer.numero_documento,
          cedula: cedula
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedCustomer = await response.json();

      // Actualizar la lista de clientes con el estado actualizado
      setCustomers(prevCustomers =>
        prevCustomers.map(c =>
          c.id === customer.id ? { ...c, estado: newStatus } : c
        )
      );

      return updatedCustomer;
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Error updating status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    customers,
    isLoading,
    error,
    totalRecords,
    loadCustomers,
    updateCustomer,
    deleteCustomer,
    updateStatus
  };
};