import { User } from '../types/user';
import { apiGet, apiPost, apiPut, apiDelete } from './baseService';
import { API_CONFIG } from '../config/constants';

export const fetchUsers = async (): Promise<User[]> => {
  // Obtener la cédula del asesor
  const cedula = localStorage.getItem('cedula') || '';

  if (!cedula) {
    throw new Error('No se encontró la información del asesor');
  }

  // Usar POST para enviar la cédula en el body
  const data = await apiPost<any>(API_CONFIG.ENDPOINTS.GET_ALL_USERS, {
    cedula: cedula
  });
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

  // Obtener la cédula del asesor
  const asesorCedula = localStorage.getItem('cedula') || '';

  if (!asesorCedula) {
    throw new Error('No se encontró la información del asesor');
  }

  // Incluir la cédula del asesor en los datos
  const dataWithCedula = {
    ...userData,
    asesor_cedula: asesorCedula
  };

  return await apiPost<User>(API_CONFIG.ENDPOINTS.CREATE_USER, dataWithCedula);
};

export const updateUser = async (user: User): Promise<User> => {
  console.log('Updating user:', user);

  // Obtener la cédula del asesor
  const asesorCedula = localStorage.getItem('cedula') || '';

  if (!asesorCedula) {
    throw new Error('No se encontró la información del asesor');
  }

  const updateData = {
    email: user.email,
    password: user.password || '',
    nombre: user.nombre,
    rol: user.rol,
    cedula: user.cedula,
    empresa: user.empresa,
    id: user.id,
    asesor_cedula: asesorCedula
  };

  console.log('Sending update data:', updateData);
  return await apiPut<User>(API_CONFIG.ENDPOINTS.UPDATE_USER, updateData);
};

export const deleteUser = async (userId: number): Promise<void> => {
  // Obtener la cédula del asesor
  const asesorCedula = localStorage.getItem('cedula') || '';

  if (!asesorCedula) {
    throw new Error('No se encontró la información del asesor');
  }

  // Usar POST para enviar la cédula en el body
  await apiPost(`${API_CONFIG.ENDPOINTS.DELETE_USER}/${userId}`, {
    cedula: asesorCedula
  });
};