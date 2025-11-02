import { buildApiUrl, API_CONFIG } from '../config/constants';

// Tipos para observaciones según el formato del backend
export interface ObservacionBackend {
  id: string;
  tipo: string;
  fecha: string;
  observacion: string;
  usuario_id?: number;
  usuario_nombre?: string;
}

export interface HistorialResponse {
  historial: ObservacionBackend[];
}

// Tipos para observaciones del frontend (compatibilidad)
export interface Observacion {
  observacion: string;
  fecha_creacion: string;
  usuario_id?: number;
  usuario_nombre?: string;
}

// Tipo para la respuesta de actualización
export interface SolicitudUpdateResponse {
  ok: boolean;
  data?: any;
  error?: string;
}

// Tipo para actualizar solicitud
export interface SolicitudUpdateData {
  observaciones?: Observacion[]; // Para campos JSONB
  [key: string]: any; // Para otros campos que se puedan actualizar
}

export const solicitudService = {
  // Obtener información básica de una solicitud (incluyendo solicitante_id)
  async obtenerSolicitud(
    solicitudId: number,
    empresaId: number = 1
  ): Promise<{ id: number; solicitante_id: number; estado: string } | null> {
    try {
      const url = buildApiUrl(`/solicitudes/${solicitudId}?empresa_id=${empresaId}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-Id': empresaId.toString(),
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.ok && result.data) {
        return {
          id: result.data.id,
          solicitante_id: result.data.solicitante_id,
          estado: result.data.estado
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error al obtener solicitud:', error);
      return null;
    }
  },

  // Obtener historial de observaciones de una solicitud
  async obtenerObservaciones(
    solicitudId: number,
    empresaId: number = 1
  ): Promise<ObservacionBackend[]> {
    try {
      // Endpoint para obtener historial de observaciones
      const url = buildApiUrl(`/solicitudes/${solicitudId}/observaciones?empresa_id=${empresaId}`);

      // console.log('🔍 Obteniendo historial de observaciones:', {
      //   solicitudId,
      //   empresaId,
      //   url,
      //   fullUrl: url,
      //   baseUrl: API_CONFIG.BASE_URL,
      //   endpoint: `/solicitudes/${solicitudId}/observaciones?empresa_id=${empresaId}`
      // });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-Id': empresaId.toString(),
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      // console.log('📡 Respuesta del servidor:', {
      //   status: response.status,
      //   statusText: response.statusText,
      //   ok: response.ok,
      //   headers: Object.fromEntries(response.headers.entries())
      // });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      // console.log('✅ Historial de observaciones obtenido:', result);

      // Manejar diferentes estructuras de respuesta
      if (result.historial) {
        return result.historial;
      } else if (result.data && result.data.historial) {
        return result.data.historial;
      } else if (result.data && result.data.observaciones && Array.isArray(result.data.observaciones)) {
        // console.log('✅ Encontradas observaciones en result.data.observaciones:', result.data.observaciones);
        return result.data.observaciones;
      } else if (result.data && Array.isArray(result.data)) {
        return result.data;
      } else if (Array.isArray(result)) {
        return result;
      } else {
        console.warn('⚠️ Estructura de respuesta inesperada:', result);
        return [];
      }
    } catch (error) {
      console.error('❌ Error al obtener historial de observaciones:', error);
      return [];
    }
  },

  // Agregar observación a una solicitud
  async agregarObservacion(
    solicitudId: number,
    observacion: string,
    empresaId: number = 1,
    tipo: string = 'comentario'
  ): Promise<SolicitudUpdateResponse> {
    try {
      // Usar el endpoint correcto POST /solicitudes/<id>/observaciones
      const url = buildApiUrl(`/solicitudes/${solicitudId}/observaciones?empresa_id=${empresaId}`);

      const userId = parseInt(localStorage.getItem('user_id') || '1');

      // Obtener el nombre del usuario desde el objeto user en localStorage
      let userName = 'Usuario';
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const userObj = JSON.parse(userData);
          userName = userObj.nombre || userObj.nombres || 'Usuario';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // Crear el payload según la documentación de la API
      const requestData = {
        observacion: observacion.trim(),
        tipo: tipo,
        fecha_creacion: new Date().toISOString(),
        usuario_id: userId,
        usuario_nombre: userName
      };

      console.log('🔍 Agregando observación a solicitud:', {
        solicitudId,
        requestData,
        empresaId,
        url
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-Id': empresaId.toString(),
          'X-User-Id': userId.toString(),
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(requestData)
      });

      // console.log('📡 Respuesta del servidor:', {
      //   status: response.status,
      //   statusText: response.statusText,
      //   ok: response.ok
      // });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Observación agregada exitosamente:', result);

      return {
        ok: true,
        data: result
      };
    } catch (error) {
      console.error('❌ Error al agregar observación:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  // Actualizar otros campos de la solicitud
  async actualizarSolicitud(
    solicitudId: number,
    datos: SolicitudUpdateData,
    empresaId: number = 1
  ): Promise<SolicitudUpdateResponse> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.SOLICITUDES_PATCH.replace('{id}', solicitudId.toString());
      const url = buildApiUrl(endpoint);

      const userId = localStorage.getItem('user_id') || '1';

      console.log('🔍 Actualizando solicitud:', {
        solicitudId,
        datos,
        empresaId
      });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-Id': empresaId.toString(),
          'X-User-Id': userId,
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Solicitud actualizada exitosamente:', result);

      return {
        ok: true,
        data: result
      };
    } catch (error) {
      console.error('❌ Error al actualizar solicitud:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
};
