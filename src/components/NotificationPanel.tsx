import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../types/notification';
import { Bell, X, Clock, AlertCircle, CheckCircle, Trash2, Edit } from 'lucide-react';
import Button from './ui/Button';

interface NotificationPanelProps {
  empresaId: number;
  isOpen: boolean;
  onClose: () => void;
  onEditNotification?: (notification: Notification) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  empresaId,
  isOpen,
  onClose,
  onEditNotification
}) => {
  const {
    notifications,
    loading,
    error,
    loadPendingNotifications,
    markAsRead,
    deleteNotification,
    updateNotification
  } = useNotifications(empresaId);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadPendingNotifications();
    }
  }, [isOpen, loadPendingNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    loadPendingNotifications();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      await deleteNotification(id);
      loadPendingNotifications();
    }
  };

  const handleMarkAsCompleted = async (id: number) => {
    await updateNotification(id, { estado: 'completada' });
    loadPendingNotifications();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'border-l-red-500 bg-red-50';
      case 'alta': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-yellow-500 bg-yellow-50';
      case 'baja': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
      case 'alta':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'normal':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'baja':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    const typeLabels: Record<string, string> = {
      'retomar_operacion': 'Retomar Operación',
      'revisar_documentos': 'Revisar Documentos',
      'aprobar_solicitud': 'Aprobar Solicitud',
      'contactar_cliente': 'Contactar Cliente',
      'seguimiento_credito': 'Seguimiento de Crédito',
      'documentacion_pendiente': 'Documentación Pendiente',
      'analisis_credito': 'Análisis de Crédito',
      'desembolso': 'Desembolso'
    };
    return typeLabels[tipo] || tipo;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
      <div
        ref={panelRef}
        className="w-96 max-h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Notificaciones</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando notificaciones...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tienes notificaciones pendientes</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications
                .filter(n => n.estado === 'pendiente')
                .sort((a, b) => {
                  // Sort by priority first, then by date
                  const priorityOrder = { urgente: 4, alta: 3, normal: 2, baja: 1 };
                  const aPriority = priorityOrder[a.prioridad as keyof typeof priorityOrder] || 0;
                  const bPriority = priorityOrder[b.prioridad as keyof typeof priorityOrder] || 0;
                  
                  if (aPriority !== bPriority) {
                    return bPriority - aPriority;
                  }
                  
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getPriorityColor(notification.prioridad)} hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-2 flex-1">
                        {getPriorityIcon(notification.prioridad)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.titulo}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {getTypeLabel(notification.tipo)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {notification.mensaje}
                    </p>

                    {/* Dates */}
                    <div className="text-xs text-gray-500 mb-3 space-y-1">
                      {notification.fecha_recordatorio && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Recordatorio: {formatDate(notification.fecha_recordatorio)}</span>
                        </div>
                      )}
                      {notification.fecha_vencimiento && (
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Vence: {formatDate(notification.fecha_vencimiento)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        {formatDate(notification.created_at)}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Marcar como leída"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMarkAsCompleted(notification.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="Marcar como completada"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        {onEditNotification && (
                          <button
                            onClick={() => onEditNotification(notification)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {notifications.filter(n => n.estado === 'pendiente').length} pendientes
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  // Mark all as read
                  notifications
                    .filter(n => n.estado === 'pendiente')
                    .forEach(n => markAsRead(n.id));
                  setTimeout(() => loadPendingNotifications(), 500);
                }}
              >
                Marcar todas como leídas
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
