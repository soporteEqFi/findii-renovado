import { apiGet, apiPut, apiPatch, apiDelete, apiPost } from './baseService';
import {
  Notification,
  NotificationResponse,
  NotificationUpdateData,
  NotificationFilters
} from '../types/notification';

class NotificationService {
  // Obtener tipos de notificación configurados
  async getNotificationTypes(empresaId: number): Promise<string[]> {
    try {
      const endpoint = `/notificaciones/tipos-configurados?empresa_id=${empresaId}`;
      console.log('🔍 Consultando tipos de notificación en:', endpoint);

      const response = await apiGet<{
        data: {
          tipos: string[];
          estados: string[];
          prioridades: string[];
        }
      }>(endpoint);
      console.log('📋 Respuesta completa del endpoint tipos-configurados:', response);

      const tipos = response.data?.tipos || [];
      console.log('📋 Tipos extraídos:', tipos);

      return tipos;
    } catch (error) {
      console.error('Error al obtener tipos de notificación:', error);
      return [];
    }
  }

  // Obtener configuración completa de notificaciones
  async getNotificationConfig(empresaId: number): Promise<{
    tipos: string[];
    estados: string[];
    prioridades: string[];
    estadosActuales: string[];
    accionesRequeridas: string[];
  }> {
    try {
      const endpoint = `/notificaciones/tipos-configurados?empresa_id=${empresaId}`;
      const response = await apiGet<{
        data: {
          tipos: string[];
          estados: string[];
          prioridades: string[];
          estadosActuales: string[];
          accionesRequeridas: string[];
        }
      }>(endpoint);

      return {
        tipos: response.data?.tipos || [],
        estados: response.data?.estados || [],
        prioridades: response.data?.prioridades || [],
        estadosActuales: response.data?.estadosActuales || [],
        accionesRequeridas: response.data?.accionesRequeridas || []
      };
    } catch (error) {
      console.error('Error al obtener configuración de notificaciones:', error);
      return {
        tipos: [],
        estados: [],
        prioridades: [],
        estadosActuales: [],
        accionesRequeridas: []
      };
    }
  }

    // Obtener todas las notificaciones
  async getNotifications(filters: NotificationFilters): Promise<Notification[]> {
    try {
      const params = new URLSearchParams();
      params.append('empresa_id', filters.empresa_id.toString());

      if (filters.solicitud_id) {
        params.append('solicitud_id', filters.solicitud_id.toString());
      }

      const endpoint = `/notificaciones?${params.toString()}`;
      // console.log('🔍 URL de notificaciones:', endpoint);
      const response = await apiGet<NotificationResponse>(endpoint);

      // console.log('📋 Notificaciones recibidas:', response.data);
      const notifications = response.data || [];

      // Ordenar por fecha de creación (más reciente primero)
      return notifications.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return [];
    }
  }

  // Obtener notificaciones pendientes
  async getPendingNotifications(empresaId: number): Promise<Notification[]> {
    try {
            const endpoint = `/notificaciones/pendientes?empresa_id=${empresaId}`;
      const response = await apiGet<NotificationResponse>(endpoint);

      const notifications = response.data || [];

      // Ordenar por fecha de creación (más reciente primero)
      return notifications.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error al obtener notificaciones pendientes:', error);
      return [];
    }
  }

  // Obtener notificación específica
  async getNotification(id: number, empresaId: number): Promise<Notification | null> {
    try {
            const endpoint = `/notificaciones/${id}?empresa_id=${empresaId}`;
      const response = await apiGet<NotificationResponse>(endpoint);

      return response.data?.[0] || null;
    } catch (error) {
      console.error('Error al obtener notificación:', error);
      return null;
    }
  }

  // Actualizar notificación completa
  async updateNotification(id: number, empresaId: number, data: NotificationUpdateData): Promise<boolean> {
    try {
      const endpoint = `/notificaciones/${id}?empresa_id=${empresaId}`;
      await apiPut(endpoint, data);
      return true;
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      return false;
    }
  }

  // Actualizar campos específicos
  async patchNotification(id: number, empresaId: number, data: NotificationUpdateData): Promise<boolean> {
    try {
      const endpoint = `/notificaciones/${id}?empresa_id=${empresaId}`;
      await apiPatch(endpoint, data);
      return true;
    } catch (error) {
      console.error('Error al actualizar campos de notificación:', error);
      return false;
    }
  }

  // Marcar como leída
  async markAsRead(id: number, empresaId: number): Promise<boolean> {
    try {
      const endpoint = `/notificaciones/${id}/marcar-leida?empresa_id=${empresaId}`;
      await apiPatch(endpoint, {});
      return true;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      return false;
    }
  }

  // Eliminar notificación
  async deleteNotification(id: number, empresaId: number): Promise<boolean> {
    try {
      const endpoint = `/notificaciones/${id}?empresa_id=${empresaId}`;
      await apiDelete(endpoint);
      return true;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      return false;
    }
  }

  // Crear nueva notificación
  async createNotification(empresaId: number, data: any): Promise<boolean> {
    try {
      const endpoint = `/notificaciones?empresa_id=${empresaId}`;

      // Obtener tipos disponibles para validación
      const tiposDisponibles = await this.getNotificationTypes(empresaId);
      console.log('📋 TIPOS DE NOTIFICACIÓN DISPONIBLES:', tiposDisponibles);

      console.log('📤 EXACTAMENTE LO QUE SE ENVÍA PARA CREAR NOTIFICACIÓN:');
      console.log('Endpoint:', endpoint);
      console.log('Data:', JSON.stringify(data, null, 2));

      // TEMPORAL: Si no hay tipos disponibles, usar los tipos conocidos
      if (tiposDisponibles.length === 0) {
        console.log('⚠️ No se obtuvieron tipos del endpoint, usando tipos conocidos');
        const tiposConocidos = ['retomar_operacion', 'revisar_documentos'];
        console.log('📋 Usando tipos conocidos:', tiposConocidos);

        // Validar con tipos conocidos
        if (data.tipo && !tiposConocidos.includes(data.tipo)) {
          console.error('❌ TIPO DE NOTIFICACIÓN INVÁLIDO:', data.tipo);
          console.log('✅ Tipos válidos:', tiposConocidos);
          throw new Error(`Tipo de notificación inválido: ${data.tipo}. Tipos disponibles: ${tiposConocidos.join(', ')}`);
        }
      } else {
        // Validar con tipos obtenidos del endpoint
        if (data.tipo && !tiposDisponibles.includes(data.tipo)) {
          console.error('❌ TIPO DE NOTIFICACIÓN INVÁLIDO:', data.tipo);
          console.log('✅ Tipos válidos:', tiposDisponibles);
          throw new Error(`Tipo de notificación inválido: ${data.tipo}. Tipos disponibles: ${tiposDisponibles.join(', ')}`);
        }
      }

      await apiPost(endpoint, data);
      return true;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
