import { User, UserInfoExtra } from '../types/user';
import { buildApiUrl } from '../config/constants';

export const userService = {
  // Listar usuarios de una empresa.
  // Por defecto envía X-User-Id y X-Empresa-Id para que el backend aplique el filtrado por rol
  // (p.ej., supervisor ve solo su equipo, asesor se ve a sí mismo). Para usos internos que
  // requieren el universo completo (p.ej., búsqueda de banqueros), se puede desactivar
  // enviando { includeIdentityHeaders: false }.
  async getUsers(
    empresaId?: number,
    options?: { includeIdentityHeaders?: boolean }
  ): Promise<User[]> {
    try {
      const empresaIdToUse = empresaId || parseInt(localStorage.getItem('empresa_id') || '1', 10);
      const includeIdentityHeaders = options?.includeIdentityHeaders !== false; // default true

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      };

      // Enviar headers de identidad para que el backend filtre por rol
      if (includeIdentityHeaders) {
        const empresaHeader = (empresaIdToUse || localStorage.getItem('empresa_id')) + '';
        const userIdHeader = localStorage.getItem('user_id');
        headers['X-Empresa-Id'] = empresaHeader;
        if (userIdHeader) headers['X-User-Id'] = userIdHeader;
      }

      const response = await fetch(
        buildApiUrl(`/usuarios/?empresa_id=${empresaIdToUse}`),
        {
          method: 'GET',
          headers
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

  // Obtener solo los supervisores de una empresa
  // Importante: pedimos el universo completo (sin headers de identidad) y filtramos en frontend
  // para que funcione incluso si el usuario logueado es asesor o supervisor.
  async getSupervisors(empresaId?: number): Promise<User[]> {
    try {
      const users = await this.getUsers(empresaId, { includeIdentityHeaders: false });

      // Filtrar solo usuarios con rol "supervisor"
      const supervisors = users.filter((user: User) => user.rol === 'supervisor');

      return supervisors.map((user: User) => ({
        ...user,
        info_extra: this.processInfoExtra(user.info_extra)
      }));
    } catch (error) {
      console.error('Error obteniendo supervisores:', error);
      throw error;
    }
  },

  // Obtener un usuario específico por ID
  async getUserById(userId: number, empresaId?: number): Promise<User> {
    try {
      const empresaIdToUse = empresaId || parseInt(localStorage.getItem('empresa_id') || '1', 10);
      const response = await fetch(
        buildApiUrl(`/usuarios/${userId}?empresa_id=${empresaIdToUse}`),
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
    reports_to_id?: number | null;
    info_extra?: UserInfoExtra;
  }, empresaId?: number): Promise<User> {
    try {
      const empresaIdToUse = empresaId || parseInt(localStorage.getItem('empresa_id') || '1', 10);
      // Limpiar info_extra si está vacío
      const cleanUserData = {
        ...userData,
        info_extra: this.cleanInfoExtra(userData.info_extra)
      };

      const response = await fetch(
        buildApiUrl(`/usuarios/?empresa_id=${empresaIdToUse}`),
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
      reports_to_id?: number | null;
      info_extra?: UserInfoExtra;
    },
    empresaId?: number
  ): Promise<User> {
    try {
      const empresaIdToUse = empresaId || parseInt(localStorage.getItem('empresa_id') || '1', 10);

      // Limpiar info_extra si está presente
      const cleanUpdateData = {
        ...updateData,
        info_extra: updateData.info_extra ? this.cleanInfoExtra(updateData.info_extra) : undefined
      };


      const response = await fetch(
        buildApiUrl(`/usuarios/${userId}`),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Empresa-Id': empresaIdToUse.toString(),
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
      console.error('❌ Error actualizando usuario:', error);
      throw error;
    }
  },

  // Eliminar usuario
  async deleteUser(userId: number, empresaId?: number): Promise<void> {
    try {
      const empresaIdToUse = empresaId || parseInt(localStorage.getItem('empresa_id') || '1', 10);
      const response = await fetch(
        buildApiUrl(`/usuarios/${userId}?empresa_id=${empresaIdToUse}`),
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
  },

  // Obtener información del usuario logueado desde localStorage (perfil)
  async getCurrentUserInfo(): Promise<{
    id: number;
    nombre: string;
    correo: string;
    cedula: string;
    rol: string;
    empresa_id: number;
  }> {
    try {
      // Primero intentar obtener desde localStorage (información del perfil)
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);

        return {
          id: userObj.id || parseInt(localStorage.getItem('user_id') || '0'),
          nombre: userObj.nombre || userObj.nombres || 'Usuario',
          correo: userObj.correo || userObj.email || '',
          cedula: userObj.cedula || localStorage.getItem('cedula') || '',
          rol: userObj.rol || 'user',
          empresa_id: parseInt(localStorage.getItem('empresa_id') || '1')
        };
      }

      // Si no hay información en localStorage, intentar desde API
      const response = await fetch(buildApiUrl('/get-user-info'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener información del usuario: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error obteniendo información del usuario logueado:', error);

      // Fallback: usar información básica disponible en localStorage
      return {
        id: parseInt(localStorage.getItem('user_id') || '0'),
        nombre: localStorage.getItem('user_name') || 'Usuario',
        correo: localStorage.getItem('user_email') || '',
        cedula: localStorage.getItem('cedula') || '',
        rol: localStorage.getItem('user_role') || 'user',
        empresa_id: parseInt(localStorage.getItem('empresa_id') || '1')
      };
    }
  },

  // Buscar banquero por criterios de banco y ciudad
  async findBankerByCriteria(bancoNombre: string, ciudadSolicitud: string, empresaId?: number): Promise<{
    nombre: string;
    correo: string;
  } | null> {
    try {
      const empresaIdToUse = empresaId || parseInt(localStorage.getItem('empresa_id') || '1', 10);


      // Obtener todos los usuarios de la empresa sin restricción por rol del solicitante
      const users = await this.getUsers(empresaIdToUse, { includeIdentityHeaders: false });
      // Filtrar usuarios con rol 'banco'
      const bankUsers = users.filter(user => user.rol === 'banco');

      // Buscar usuarios con rol 'banco' que tengan información adicional que coincida
      const banker = bankUsers.find(user => {
        // Verificar información adicional
        const infoExtra = this.processInfoExtra(user.info_extra);
        if (!infoExtra) {
          return false;
        }

        // Buscar coincidencias en la información adicional
        // La información adicional debe contener el banco y la ciudad
        const infoString = JSON.stringify(infoExtra).toLowerCase();
        const bancoLower = bancoNombre.toLowerCase();
        const ciudadLower = ciudadSolicitud.toLowerCase();

        const hasBanco = infoString.includes(bancoLower);
        const hasCiudad = infoString.includes(ciudadLower);


        return hasBanco && hasCiudad;
      });

      if (banker) {
        return {
          nombre: banker.nombre,
          correo: banker.correo
        };
      }

      return null;
    } catch (error) {
      console.error('Error buscando banquero por criterios:', error);
      return null;
    }
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