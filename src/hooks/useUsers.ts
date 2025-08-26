import { useState, useCallback } from 'react';
import { User, CreateUserData, UpdateUserData } from '../types/user';
import { userService } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async (empresaId: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getUsers(empresaId);
      setUsers(data);
    } catch (error) {
      setError('Error cargando usuarios');
      console.error('Error cargando usuarios:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewUser = useCallback(async (userData: CreateUserData, empresaId: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const newUser = await userService.createUser(userData, empresaId);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (error) {
      setError('Error creando usuario');
      console.error('Error creando usuario:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserData = useCallback(async (userId: number, updateData: UpdateUserData, empresaId: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await userService.updateUser(userId, updateData, empresaId);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      return updatedUser;
    } catch (error) {
      setError('Error actualizando usuario');
      console.error('Error actualizando usuario:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUserData = useCallback(async (userId: number, empresaId: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      await userService.deleteUser(userId, empresaId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      setError('Error eliminando usuario');
      console.error('Error eliminando usuario:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (userId: number, empresaId: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await userService.getUserById(userId, empresaId);
      return user;
    } catch (error) {
      setError('Error obteniendo usuario');
      console.error('Error obteniendo usuario:', error);
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
    createUser: createNewUser,
    updateUser: updateUserData,
    deleteUser: deleteUserData,
    getUserById,
    setUsers
  };
};