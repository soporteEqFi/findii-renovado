import { useState, useCallback } from 'react';
import { User } from '../types/user';
import { fetchUsers, updateUser, deleteUser } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      setError('Error loading users');
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserData = useCallback(async (user: User) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await updateUser(user);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      return updatedUser;
    } catch (error) {
      setError('Error updating user');
      console.error('Error updating user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUserData = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      setError('Error deleting user');
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    loadUsers,
    updateUser: updateUserData,
    deleteUser: deleteUserData,
    setUsers
  };
}; 