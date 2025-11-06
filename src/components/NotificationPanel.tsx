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
      case 'urgente': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'alta': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'normal': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'baja': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800/60';
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
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-2 sm:pr-4">
      <div
        ref={panelRef}
        className="w-full max-w-sm sm:w-96 max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col mx-2 sm:mx-0 notification-panel-mobile"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/40">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Notificaciones</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Cargando notificaciones...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No tienes notificaciones pendientes</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
                    className={`p-4 border-l-4 ${getPriorityColor(notification.prioridad)} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer`}
                    onClick={() => onEditNotification?.(notification)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-2 flex-1">
                        {getPriorityIcon(notification.prioridad)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate text-left">
                            {notification.titulo}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">
                            {getTypeLabel(notification.tipo)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-3 line-clamp-2 text-left">
                      {notification.mensaje}
                    </p>

                    {/* Dates */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
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
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(notification.created_at)}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Marcar como leída"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsCompleted(notification.id);
                          }}
                          className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                          title="Marcar como completada"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        {onEditNotification && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditNotification(notification);
                            }}
                            className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
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
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-300">
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
