import api from './api';
import { Rental } from '../types';

// Mock data for rentals
const mockRentals: Rental[] = [
  {
    id: '1',
    userId: '101',
    propertyId: 'p1',
    startDate: '2023-01-15',
    endDate: '2023-07-15',
    status: 'active',
    price: 1200,
    propertyName: 'Sunset Apartments #301',
  },
  {
    id: '2',
    userId: '102',
    propertyId: 'p2',
    startDate: '2022-08-01',
    endDate: '2023-02-01',
    status: 'expired',
    price: 950,
    propertyName: 'Downtown Loft #205',
  },
  {
    id: '3',
    userId: '101',
    propertyId: 'p3',
    startDate: '2023-03-10',
    endDate: '2023-09-10',
    status: 'active',
    price: 1450,
    propertyName: 'Riverside Condos #512',
  },
  {
    id: '4',
    userId: '103',
    propertyId: 'p4',
    startDate: '2022-11-15',
    endDate: '2023-05-15',
    status: 'expired',
    price: 1100,
    propertyName: 'Park View Heights #708',
  },
  {
    id: '5',
    userId: '102',
    propertyId: 'p5',
    startDate: '2023-04-01',
    endDate: '2023-10-01',
    status: 'active',
    price: 1350,
    propertyName: 'Marina Bay Apartments #403',
  },
];

export const getRentals = async (): Promise<Rental[]> => {
  // In a real app: return api.get('/rentals').then(response => response.data);
  
  // For demo, return mock data
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockRentals), 500);
  });
};

export const getActiveRentals = async (userId: string): Promise<Rental[]> => {
  // In a real app: return api.get(`/users/${userId}/rentals/active`).then(response => response.data);
  
  // For demo, filter active rentals for user
  return new Promise((resolve) => {
    setTimeout(() => {
      const activeRentals = mockRentals.filter(
        rental => rental.userId === userId && rental.status === 'active'
      );
      resolve(activeRentals);
    }, 500);
  });
};

export const getExpiredRentals = async (userId: string): Promise<Rental[]> => {
  // In a real app: return api.get(`/users/${userId}/rentals/expired`).then(response => response.data);
  
  // For demo, filter expired rentals for user
  return new Promise((resolve) => {
    setTimeout(() => {
      const expiredRentals = mockRentals.filter(
        rental => rental.userId === userId && rental.status === 'expired'
      );
      resolve(expiredRentals);
    }, 500);
  });
};