import api from './api';
import { Client } from '../types';

// Mock data for clients
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    createdAt: '2023-01-15T10:30:00Z',
    revendedorId: 'rev001',
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 987-6543',
    status: 'active',
    createdAt: '2023-02-20T14:45:00Z',
    revendedorId: 'rev001',
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 456-7890',
    status: 'inactive',
    createdAt: '2022-11-10T09:15:00Z',
    revendedorId: 'rev002',
  },
  {
    id: '4',
    name: 'David Williams',
    email: 'david.williams@example.com',
    phone: '+1 (555) 222-3333',
    status: 'active',
    createdAt: '2023-03-05T11:20:00Z',
    revendedorId: 'rev001',
  },
  {
    id: '5',
    name: 'Jessica Brown',
    email: 'jessica.brown@example.com',
    phone: '+1 (555) 444-5555',
    status: 'active',
    createdAt: '2023-01-28T16:10:00Z',
    revendedorId: 'rev002',
  },
];

export const getClients = async (revendedorId: string): Promise<Client[]> => {
  // In a real app: return api.get(`/revendedores/${revendedorId}/clients`).then(response => response.data);
  
  // For demo, filter clients by revendedorId
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredClients = mockClients.filter(client => client.revendedorId === revendedorId);
      resolve(filteredClients);
    }, 500);
  });
};

export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
  // In a real app: return api.post('/clients', clientData).then(response => response.data);
  
  // For demo, create a new client with fake ID and timestamp
  return new Promise((resolve) => {
    setTimeout(() => {
      const newClient: Client = {
        ...clientData,
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      resolve(newClient);
    }, 500);
  });
};