import React, { useState } from 'react';
import { NotificationBadge } from './NotificationBadge';
import { NotificationHistory } from './NotificationHistory';
import { Notification } from '../types/notification';
import Modal from './ui/Modal';

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
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedNotification(null);
  };

  return (
    <>
      {/* Notification Badge - always visible */}
      <NotificationBadge
        empresaId={empresaId}
        onEditNotification={handleEditNotification}
      />

      {/* Full History - only when requested */}
      {showFullHistory && solicitudId && (
        <NotificationHistory
          solicitudId={solicitudId}
          empresaId={empresaId}
        />
      )}

      {/* Edit Modal - shows when editing a notification */}
      {showEditModal && selectedNotification && (
        <Modal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          title="Editar Notificación desde Panel"
        >
          <div className="p-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-blue-700 text-sm">
                Para editar esta notificación completamente, ve a la sección de detalles del cliente correspondiente.
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedNotification.titulo}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Mensaje</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedNotification.mensaje}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded capitalize">{selectedNotification.prioridad}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded capitalize">{selectedNotification.estado}</p>
                </div>
              </div>
              
              {selectedNotification.solicitud_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID de Solicitud</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedNotification.solicitud_id}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
