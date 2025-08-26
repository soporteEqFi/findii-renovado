import { User, UserInfoExtra } from '../types/user';
import { buildApiUrl } from '../config/constants';

export const userService = {
  // Listar todos los usuarios de una empresa
  async getUsers(empresaId: number = 1): Promise<User[]> {
    try {
      const response = await fetch(
        buildApiUrl(`/usuarios/?empresa_id=${empresaId}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener usuarios: ${response.statusText}`);
      }

      const result = await response.json();
      const users = result.data || result || [];

      // Procesar info_extra para asegurar que sea un objeto
      return users.map((user: User) => ({
        ...user,
        info_extra: this.processInfoExtra(user.info_extra)
      }));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  },

  // Obtener un usuario específico por ID
  async getUserById(userId: number, empresaId: number = 1): Promise<User> {
    try {
      const response = await fetch(
        buildApiUrl(`/usuarios/${userId}?empresa_id=${empresaId}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener usuario: ${response.statusText}`);
      }

      const result = await response.json();
      const user = result.data || result;

      return {
        ...user,
        info_extra: this.processInfoExtra(user.info_extra)
      };
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  },

  // Crear un nuevo usuario
  async createUser(userData: {
    nombre: string;
    cedula: string;
    correo: string;
    contraseña: string;
    rol: string;
    info_extra?: UserInfoExtra;
  }, empresaId: number = 1): Promise<User> {
    try {
      // Limpiar info_extra si está vacío
      const cleanUserData = {
        ...userData,
        info_extra: this.cleanInfoExtra(userData.info_extra)
      };

      const response = await fetch(
        buildApiUrl(`/usuarios/?empresa_id=${empresaId}`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(cleanUserData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error al crear usuario: ${response.statusText}`);
      }

      const result = await response.json();
      const user = result.data || result;

      return {
        ...user,
        info_extra: this.processInfoExtra(user.info_extra)
      };
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  },

  // Actualizar usuario
  async updateUser(
    userId: number,
    updateData: {
      nombre?: string;
      cedula?: string;
      correo?: string;
      contraseña?: string;
      rol?: string;
      info_extra?: UserInfoExtra;
    },
    empresaId: number = 1
  ): Promise<User> {
    try {
      // Limpiar info_extra si está presente
      const cleanUpdateData = {
        ...updateData,
        info_extra: updateData.info_extra ? this.cleanInfoExtra(updateData.info_extra) : undefined
      };

      const response = await fetch(
        buildApiUrl(`/usuarios/${userId}?empresa_id=${empresaId}`),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(cleanUpdateData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error al actualizar usuario: ${response.statusText}`);
      }

      const result = await response.json();
      const user = result.data || result;

      return {
        ...user,
        info_extra: this.processInfoExtra(user.info_extra)
      };
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  },

  // Eliminar usuario
  async deleteUser(userId: number, empresaId: number = 1): Promise<void> {
    try {
      const response = await fetch(
        buildApiUrl(`/usuarios/${userId}?empresa_id=${empresaId}`),
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error al eliminar usuario: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  },

  // Helper para procesar info_extra
  processInfoExtra(infoExtra: any): UserInfoExtra | undefined {
    if (!infoExtra) return undefined;

    try {
      if (typeof infoExtra === 'string') {
        return JSON.parse(infoExtra);
      }
      return infoExtra;
    } catch {
      return undefined;
    }
  },

  // Helper para limpiar info_extra (remover campos vacíos)
  cleanInfoExtra(infoExtra: UserInfoExtra | undefined): UserInfoExtra | undefined {
    if (!infoExtra) return undefined;

    const cleaned: UserInfoExtra = {};
    Object.keys(infoExtra).forEach(key => {
      const value = infoExtra[key];
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    });

    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
};

// Mantener compatibilidad con el código existente
export const fetchUsers = async (): Promise<User[]> => {
  return await userService.getUsers();
};

export const createUser = async (userData: {
  email: string;
  password: string;
  nombre: string;
  rol: string;
  cedula: string;
  empresa: string;
}): Promise<User> => {
  return await userService.createUser({
    nombre: userData.nombre,
    cedula: userData.cedula,
    correo: userData.email,
    contraseña: userData.password,
    rol: userData.rol
  });
};

export const updateUser = async (user: User): Promise<User> => {
  const updateData: any = {};

  if (user.nombre) updateData.nombre = user.nombre;
  if (user.cedula) updateData.cedula = user.cedula;
  if (user.correo) updateData.correo = user.correo;
  if (user.contraseña) updateData.contraseña = user.contraseña;
  if (user.rol) updateData.rol = user.rol;
  if (user.info_extra) updateData.info_extra = user.info_extra;

  return await userService.updateUser(user.id, updateData);
};

export const deleteUser = async (userId: number): Promise<void> => {
  return await userService.deleteUser(userId);
};