import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

interface UserInfo {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  cedula: string;
  empresa?: string;
  imagen_aliado?: string | null;
  apellido?: string;
  usuario?: string;
  info_extra?: any;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar los datos del contexto de autenticación
  useEffect(() => {
    console.log('🔍 useProfile: Usuario del contexto:', user);
    if (user) {
      const userData = {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        cedula: user.cedula,
        empresa: user.empresa,
        imagen_aliado: user.imagen_aliado,
        apellido: user.apellido,
        usuario: user.usuario,
        info_extra: user.info_extra
      };
      console.log('✅ useProfile: Datos del usuario procesados:', userData);
      setUserInfo(userData);
    } else {
      console.log('❌ useProfile: No hay usuario en el contexto');
    }
  }, [user]);

  const updateProfile = async (updatedInfo: Partial<UserInfo> & { contraseña?: string }) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Preparar datos para actualizar
      const updateData: any = {
        nombre: updatedInfo.nombre,
        cedula: updatedInfo.cedula,
        correo: updatedInfo.correo,
        rol: updatedInfo.rol,
        info_extra: updatedInfo.info_extra
      };

      // Incluir contraseña solo si se proporcionó
      if (updatedInfo.contraseña) {
        updateData.contraseña = updatedInfo.contraseña;
        console.log('🔐 Actualizando contraseña del usuario');
      }

      // Usar el servicio de usuarios para actualizar
      const updatedUser = await userService.updateUser(user.id, updateData);

      // Actualizar el estado local
      const newUserInfo = {
        ...userInfo,
        ...updatedUser,
        empresa: updatedUser.empresa || userInfo?.empresa,
        imagen_aliado: updatedUser.imagen_aliado || userInfo?.imagen_aliado
      };

      setUserInfo(newUserInfo);

      // Actualizar también el localStorage para persistir los cambios
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedStoredUser = {
          ...parsedUser,
          ...newUserInfo
        };
        localStorage.setItem('user', JSON.stringify(updatedStoredUser));
        console.log('✅ Usuario actualizado en localStorage');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la información del usuario';
      setError(errorMessage);
      console.error('Error updating user info:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    userInfo,
    loading,
    error,
    updateProfile,
  };
};