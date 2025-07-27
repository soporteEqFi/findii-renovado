import { User } from '../types/user';
import { apiGet, apiPost, apiPut, apiDelete } from './baseService';
import { API_CONFIG } from '../config/constants';

export const fetchUsers = async (): Promise<User[]> => {
  const data = await apiGet<any>(API_CONFIG.ENDPOINTS.GET_ALL_USERS);
  return data.users || [];
};

export const createUser = async (userData: {
  email: string;
  password: string;
  nombre: string;
  rol: string;
  cedula: string;
  empresa: string;
}): Promise<User> => {
  console.log('Creating user with data:', userData);
  return await apiPost<User>(API_CONFIG.ENDPOINTS.CREATE_USER, userData);
};

export const updateUser = async (user: User): Promise<User> => {
  console.log('Updating user:', user);
  
  const updateData = {
    email: user.email,
    password: user.password || '',
    nombre: user.nombre,
    rol: user.rol,
    cedula: user.cedula,
    empresa: user.empresa,
    id: user.id
  };

  console.log('Sending update data:', updateData);
  return await apiPut<User>(API_CONFIG.ENDPOINTS.UPDATE_USER, updateData);
};

export const deleteUser = async (userId: number): Promise<void> => {
  await apiDelete(`${API_CONFIG.ENDPOINTS.DELETE_USER}/${userId}`);
}; 