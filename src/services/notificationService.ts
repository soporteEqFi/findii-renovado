import { apiGet, apiPut, apiPatch, apiDelete, apiPost } from './baseService';
import {
  Notification,
  NotificationResponse,
  NotificationUpdateData,
  NotificationFilters
} from '../types/notification';

class NotificationService {
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
      return response.data || [];
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

      return response.data || [];
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
      await apiPost(endpoint, data);
      return true;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
