import { Customer } from '../types';

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

// Base API URL - replace with your actual API URL
const API_URL = 'http://127.0.0.1:5000';

// Helper function to get the auth token
const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Helper to create headers with auth token
const createHeaders = (includeToken = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeToken) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Mock data for development
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 890',
    status: 'active',
    lastContact: '2024-03-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 234 567 891',
    status: 'inactive',
    lastContact: '2024-03-14',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const token = localStorage.getItem('access_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    method,
    headers,
  };
  
  if (body && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch customers using the utility function
export const fetchCustomers = async (): Promise<Customer[]> => {
  const response = await apiRequest<any>('/customers');
  
  // Access the nested array based on your API structure
  const customersArray = response.result.customers;
  
  return customersArray.map((item: any) => ({
    id: String(item.id || ''),
    name: item.nombre || '',
    email: item.correo || '',
    phone: item.telefono || '',
    status: item.estado || 'inactive',
    lastContact: item.ultima_contacto || new Date().toISOString().split('T')[0]
  }));
};

// Update customer using the utility function
export const updateCustomer = async (customer: Customer): Promise<Customer> => {
  const response = await apiRequest<any>(`/update-customer/${customer.id}`, 'PUT', customer);
  
  // Map API response to Customer object
  return {
    id: response.id || String(response.id_customer),
    name: response.name || response.nombre || response.customer_name,
    email: response.email || response.correo,
    phone: response.phone || response.telefono || response.phone_number,
    status: response.status || response.estado || 'inactive',
    lastContact: response.lastContact || response.ultima_contacto || response.last_contact || new Date().toISOString().split('T')[0]
  };
};

// Delete customer using the utility function
export const deleteCustomer = async (id: string): Promise<void> => {
  await apiRequest(`/customers/${id}`, 'DELETE');
};

// Add a new customer
export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  const response = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    throw new Error('Failed to add customer');
  }

  return response.json();
};

// Login function (alternative to the one in AuthContext)
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/iniciar-sesion/`, {
    method: 'POST',
    headers: createHeaders(false),
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
    const token = getToken();
    if (!token) return false;

    const response = await fetch(`${API_URL}/validate-token`, {
      method: 'GET',
      headers: createHeaders(),
    });

    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};