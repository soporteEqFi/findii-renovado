import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/constants';

interface UserInfo {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  cedula: string;
  empresa: string;
  imagen_aliado: string;
}

export const useProfile = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user_document = localStorage.getItem('user');
      const userData = JSON.parse(user_document || '{}');
      const user_document_obj = userData.cedula;

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_INFO}/${user_document_obj}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar la información del usuario');
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      setError('Error al cargar la información del usuario');
      console.error('Error fetching user info:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedInfo: Partial<UserInfo>) => {
    try {
      setLoading(true);
      setError(null);
      
      const user_document = localStorage.getItem('user');
      const userData = JSON.parse(user_document || '{}');
      const user_document_obj = userData.cedula;

      const payload = {
        id: updatedInfo.id,
        nombre: updatedInfo.nombre,
        cedula: updatedInfo.cedula,
        rol: updatedInfo.rol,
        empresa: updatedInfo.empresa,
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la información');
      }

      await fetchUserInfo();
      return true;
    } catch (err) {
      setError('Error al actualizar la información del usuario');
      console.error('Error updating user info:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return {
    userInfo,
    loading,
    error,
    fetchUserInfo,
    updateProfile,
  };
}; 