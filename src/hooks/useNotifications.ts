import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { Notification, NotificationUpdateData, NotificationFilters } from '../types/notification';
import { buildApiUrl } from '../config/constants';

export const useNotifications = (empresaId: number) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar notificaciones
  const loadNotifications = useCallback(async (filters?: Partial<NotificationFilters>) => {
    setLoading(true);
    setError(null);

    try {
      const data = await notificationService.getNotifications({
        empresa_id: empresaId,
        ...filters
      });
      setNotifications(data);
    } catch (err) {
      setError('Error al cargar notificaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  // Cargar notificaciones pendientes
  const loadPendingNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await notificationService.getPendingNotifications(empresaId);
      setNotifications(data);
    } catch (err) {
      setError('Error al cargar notificaciones pendientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  // Actualizar notificación
  const updateNotification = useCallback(async (
    id: number,
    data: NotificationUpdateData
  ) => {
    try {
      const success = await notificationService.patchNotification(id, empresaId, data);
      if (success) {
        // Actualizar la notificación en el estado local
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? { ...notification, ...data, updated_at: new Date().toISOString() }
              : notification
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al actualizar notificación');
      console.error(err);
      return false;
    }
  }, [empresaId]);

  // Marcar como leída
  const markAsRead = useCallback(async (id: number) => {
    try {
      const success = await notificationService.markAsRead(id, empresaId);
      if (success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? { ...notification, estado: 'leida', updated_at: new Date().toISOString() }
              : notification
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al marcar notificación como leída');
      console.error(err);
      return false;
    }
  }, [empresaId]);

  // Eliminar notificación
  const deleteNotification = useCallback(async (id: number) => {
    try {
      const success = await notificationService.deleteNotification(id, empresaId);
      if (success) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al eliminar notificación');
      console.error(err);
      return false;
    }
  }, [empresaId]);

  // Crear notificación
  const createNotification = useCallback(async (data: any) => {
    try {
      const success = await notificationService.createNotification(empresaId, data);
      return success;
    } catch (err) {
      setError('Error al crear notificación');
      return false;
    }
  }, [empresaId]);

      // Obtener notificaciones por solicitud
  const getNotificationsBySolicitud = useCallback(async (solicitudId: number) => {
    await loadNotifications({ solicitud_id: solicitudId });
  }, [loadNotifications]);

  return {
    notifications,
    loading,
    error,
    loadNotifications,
    loadPendingNotifications,
    updateNotification,
    markAsRead,
    deleteNotification,
    getNotificationsBySolicitud,
    createNotification
  };
};
