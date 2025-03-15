import { useState, useCallback } from 'react';
import { Customer } from '../types/customer';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:5000/get-combined-data', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
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
    // ... lógica de actualización
  };

  const deleteCustomer = async (id: string) => {
    // ... lógica de eliminación
  };

  const updateStatus = async (customer: Customer, newStatus: string) => {
    // ... lógica de actualización de estado
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