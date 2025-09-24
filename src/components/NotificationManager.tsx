import React, { useState } from 'react';
import { NotificationBadge } from './NotificationBadge';
import { NotificationHistory } from './NotificationHistory';
import { Notification } from '../types/notification';
import { solicitudService } from '../services/solicitudService';
import { useEditModal } from '../contexts/EditModalContext';
import toast from 'react-hot-toast';

interface NotificationManagerProps {
  empresaId: number;
  solicitudId?: number;
  showFullHistory?: boolean;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  empresaId,
  solicitudId,
  showFullHistory = false
}) => {
  const { openModal } = useEditModal();
  const [loadingSolicitante, setLoadingSolicitante] = useState(false);

  const handleEditNotification = async (notification: Notification) => {
    if (!notification.solicitud_id) {
      toast.error('No se pudo obtener el ID de solicitud de la notificación');
      return;
    }

    setLoadingSolicitante(true);
    try {
      // Obtener el solicitante_id desde el solicitud_id
      const solicitudData = await solicitudService.obtenerSolicitud(notification.solicitud_id, empresaId);
      
      if (!solicitudData || !solicitudData.solicitante_id) {
        toast.error('No se pudo obtener la información del solicitante');
        return;
      }

      // Abrir el modal de edición del cliente usando el contexto global
      openModal(solicitudData.solicitante_id, 'Editar Cliente desde Notificación');
      
    } catch (error) {
      console.error('Error al obtener información del solicitante:', error);
      toast.error('Error al cargar la información del cliente');
    } finally {
      setLoadingSolicitante(false);
    }
  };

  return (
    <>
      {/* Notification Badge - always visible */}
      <NotificationBadge
        empresaId={empresaId}
        onEditNotification={handleEditNotification}
        loading={loadingSolicitante}
      />

      {/* Full History - only when requested */}
      {showFullHistory && solicitudId && (
        <NotificationHistory
          solicitudId={solicitudId}
          empresaId={empresaId}
        />
      )}
    </>
  );
};
