import api from './api';
import { Account } from '../types';

// For demo purposes, we'll use mock data
const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Premium Savings Account',
    balance: 15250.75,
    status: 'active',
    type: 'savings',
    lastActivity: '2023-05-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'Business Checking Account',
    balance: 42680.30,
    status: 'active',
    type: 'checking',
    lastActivity: '2023-05-18T09:45:00Z',
  },
  {
    id: '3',
    name: 'Investment Portfolio',
    balance: 127890.45,
    status: 'active',
    type: 'investment',
    lastActivity: '2023-05-10T11:20:00Z',
  },
  {
    id: '4',
    name: 'Retirement Fund',
    balance: 358975.00,
    status: 'inactive',
    type: 'retirement',
    lastActivity: '2023-04-28T15:15:00Z',
  },
  {
    id: '5',
    name: 'Emergency Savings',
    balance: 7500.50,
    status: 'active',
    type: 'savings',
    lastActivity: '2023-05-05T10:00:00Z',
  },
];

export const getAccounts = async (): Promise<Account[]> => {
  // In a real app, this would be an API call
  // return api.get('/accounts').then(response => response.data);
  
  // For demo, return mock data
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAccounts), 500);
  });
};

export const getAvailableAccounts = async (): Promise<Account[]> => {
  // In a real app: return api.get('/accounts/available').then(response => response.data);
  
  // For demo, filter active accounts
  return new Promise((resolve) => {
    setTimeout(() => {
      const availableAccounts = mockAccounts.filter(account => account.status === 'active');
      resolve(availableAccounts);
    }, 500);
  });
};

export const getAccountById = async (id: string): Promise<Account | null> => {
  // In a real app: return api.get(`/accounts/${id}`).then(response => response.data);
  
  // For demo, find by id
  return new Promise((resolve) => {
    setTimeout(() => {
      const account = mockAccounts.find(acc => acc.id === id) || null;
      resolve(account);
    }, 500);
  });
};