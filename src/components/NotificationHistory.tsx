import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../types/notification';
import { notificationService } from '../services/notificationService';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface NotificationHistoryProps {
  solicitudId: number;
  empresaId: number;
}

// Componente para crear/editar notificación
const NotificationForm: React.FC<{
  notification?: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<boolean>;
  solicitudId: number;
  empresaId: number;
}> = ({ notification, isOpen, onClose, onSave, solicitudId, empresaId }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    prioridad: 'normal',
    estado: 'pendiente',
    fecha_recordatorio: '',
    fecha_vencimiento: '',
    tipo: 'retomar_operacion'
  });

  const [metadata, setMetadata] = useState({
    accion_requerida: 'revisar_documentos',
    estado_actual: 'en_proceso'
  });

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState<{
    tipos: string[];
    estados: string[];
    prioridades: string[];
    estadosActuales: string[];
    accionesRequeridas: string[];
  }>({
    tipos: [],
    estados: [],
    prioridades: [],
    estadosActuales: [],
    accionesRequeridas: []
  });

    useEffect(() => {
    if (notification) {
                           setFormData({
          titulo: notification.titulo || '',
          mensaje: notification.mensaje || '',
          prioridad: notification.prioridad || 'normal',
          estado: notification.estado || 'pendiente',
          fecha_recordatorio: notification.fecha_recordatorio ?
            new Date(notification.fecha_recordatorio).toISOString().slice(0, 16) : '',
          fecha_vencimiento: notification.fecha_vencimiento ?
            new Date(notification.fecha_vencimiento).toISOString().slice(0, 16) : '',
          tipo: notification.tipo || 'retomar_operacion'
        });

             // Cargar metadata si existe
       if (notification.metadata) {
         setMetadata({
           accion_requerida: notification.metadata.accion_requerida || 'revisar_documentos',
           estado_actual: notification.metadata.estado_actual || 'en_proceso'
         });
       }
                   } else {
        setFormData({
          titulo: '',
          mensaje: '',
          prioridad: 'normal',
          estado: 'pendiente',
          fecha_recordatorio: '',
          fecha_vencimiento: '',
          tipo: 'retomar_operacion'
        });

             setMetadata({
         accion_requerida: 'revisar_documentos',
         estado_actual: 'en_proceso'
       });
    }
  }, [notification]);

  // Cargar configuración de notificaciones cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const loadConfig = async () => {
        try {
          const config = await notificationService.getNotificationConfig(empresaId);
          setNotificationConfig(config);
          console.log('📋 Configuración de notificaciones cargada:', config);
        } catch (error) {
          console.error('Error al cargar configuración de notificaciones:', error);
        }
      };
      loadConfig();
    }
  }, [isOpen, empresaId]);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await onSave({
        ...formData,
        solicitud_id: solicitudId,
        metadata: metadata
      });

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar notificación:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mapeo de tipos dinámicos a etiquetas legibles
  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'retomar_operacion': 'Retomar Operación',
      'revisar_documentos': 'Revisar Documentos'
    };
    return typeLabels[type] || type;
  };

  // Mapeo de estados dinámicos a etiquetas legibles
  const getStateLabel = (state: string) => {
    const stateLabels: Record<string, string> = {
      'pendiente': 'Pendiente',
      'leida': 'Leída',
      'vencida': 'Vencida',
      'completada': 'Completada'
    };
    return stateLabels[state] || state;
  };

  // Mapeo de prioridades dinámicas a etiquetas legibles
  const getPriorityLabel = (priority: string) => {
    const priorityLabels: Record<string, string> = {
      'baja': 'Baja',
      'normal': 'Normal',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return priorityLabels[priority] || priority;
  };

  // Mapeo de estados actuales dinámicos a etiquetas legibles
  const getEstadoActualLabel = (estado: string) => {
    const estadoLabels: Record<string, string> = {
      'en_proceso': 'En Proceso',
      'pendiente_revision': 'Pendiente de Revisión',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return estadoLabels[estado] || estado;
  };

  // Mapeo de acciones requeridas dinámicas a etiquetas legibles
  const getAccionRequeridaLabel = (accion: string) => {
    const accionLabels: Record<string, string> = {
      'contactar_cliente': 'Contactar Cliente',
      'revisar_documentos': 'Revisar Documentos',
      'aprobar_solicitud': 'Aprobar Solicitud',
      'rechazar_solicitud': 'Rechazar Solicitud',
      'solicitar_informacion': 'Solicitar Información'
    };
    return accionLabels[accion] || accion;
  };

  // Función para auto-completar la acción requerida basada en el tipo
  const handleTipoChange = (tipo: string) => {
    setFormData({ ...formData, tipo });

    // Auto-completar la acción requerida basada en el tipo
    const actionMap: Record<string, string> = {
      'retomar_operacion': 'contactar_cliente',
      'revisar_documentos': 'revisar_documentos'
    };

    // Usar la primera acción disponible como fallback si no hay mapeo específico
    const fallbackAction = notificationConfig.accionesRequeridas[0] || 'contactar_cliente';
    setMetadata({ ...metadata, accion_requerida: actionMap[tipo] || fallbackAction });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={notification ? 'Editar Notificación' : 'Nueva Notificación'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje
          </label>
          <textarea
            value={formData.mensaje}
            onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Notificación
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => handleTipoChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {notificationConfig.tipos.map(type => (
                <option key={type} value={type}>
                  {getTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
                                                   <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {notificationConfig.prioridades.map(priority => (
                  <option key={priority} value={priority}>
                    {getPriorityLabel(priority)}
                  </option>
                ))}
              </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {notificationConfig.estados.map(state => (
                <option key={state} value={state}>
                  {getStateLabel(state)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado Actual (Metadata)
            </label>
            <select
              value={metadata.estado_actual}
              onChange={(e) => setMetadata({ ...metadata, estado_actual: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {notificationConfig.estadosActuales.map(estado => (
                <option key={estado} value={estado}>
                  {getEstadoActualLabel(estado)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Recordatorio
            </label>
            <input
              type="datetime-local"
              value={formData.fecha_recordatorio}
              onChange={(e) => setFormData({ ...formData, fecha_recordatorio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Vencimiento
            </label>
            <input
              type="datetime-local"
              value={formData.fecha_vencimiento}
              onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

                 <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             Acción Requerida (Metadata)
           </label>
           <select
             value={metadata.accion_requerida}
             onChange={(e) => setMetadata({ ...metadata, accion_requerida: e.target.value })}
             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             required
           >
             {notificationConfig.accionesRequeridas.map(accion => (
               <option key={accion} value={accion}>
                 {getAccionRequeridaLabel(accion)}
               </option>
             ))}
           </select>
         </div>

        {/* Vista previa del JSON */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Vista Previa del JSON
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showPreview ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {showPreview && (
            <div className="bg-gray-50 p-3 rounded-md">
              <pre className="text-xs text-gray-700 overflow-auto max-h-40">
                {JSON.stringify({
                  tipo: formData.tipo,
                  titulo: formData.titulo,
                  mensaje: formData.mensaje,
                  prioridad: formData.prioridad,
                  estado: formData.estado,
                  fecha_recordatorio: formData.fecha_recordatorio,
                  fecha_vencimiento: formData.fecha_vencimiento,
                  solicitud_id: solicitudId,
                  metadata: metadata
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (notification ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  solicitudId,
  empresaId
}) => {
  const {
    notifications,
    loading,
    error,
    loadNotifications,
    updateNotification,
    markAsRead,
    deleteNotification,
    createNotification
  } = useNotifications(empresaId);

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (solicitudId && solicitudId > 0) {
      loadNotifications({ solicitud_id: solicitudId });
    }
  }, [solicitudId, loadNotifications]);

  const handleEdit = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedNotification(null);
    setShowCreateForm(true);
  };

  const handleSave = async (data: any) => {
    if (selectedNotification) {
      const success = await updateNotification(selectedNotification.id, data);
      if (success) {
        loadNotifications({ solicitud_id: solicitudId });
      }
      return success;
    } else {
      const success = await createNotification(data);
      if (success) {
        loadNotifications({ solicitud_id: solicitudId });
      }
      return success;
    }
  };

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    loadNotifications({ solicitud_id: solicitudId });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      await deleteNotification(id);
      loadNotifications({ solicitud_id: solicitudId });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPriority = (prioridad: string) => {
    return prioridad.charAt(0).toUpperCase() + prioridad.slice(1);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-blue-100 text-blue-800';
      case 'leida': return 'bg-gray-100 text-gray-800';
      case 'completada': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Notificaciones</h3>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando notificaciones...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Historial de Notificaciones</h3>
            <Button
              size="sm"
              variant="primary"
              onClick={handleCreate}
            >
              Nueva Notificación
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay notificaciones para esta solicitud</p>
            </div>
                     ) : (
             <div className="space-y-3">
               {notifications
                 .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                 .map((notification) => (
                <div
                  key={notification.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{notification.titulo}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.mensaje}</p>
                    </div>
                                         <div className="flex space-x-2 ml-4">
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.prioridad)}`}>
                         {formatPriority(notification.prioridad)}
                       </span>
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.estado)}`}>
                         {notification.estado}
                       </span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                    <div>
                      <span className="font-medium">Recordatorio:</span>
                      <br />
                      {notification.fecha_recordatorio ? formatDate(notification.fecha_recordatorio) : 'No definido'}
                    </div>
                    <div>
                      <span className="font-medium">Vencimiento:</span>
                      <br />
                      {notification.fecha_vencimiento ? formatDate(notification.fecha_vencimiento) : 'No definido'}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      Creada: {formatDate(notification.created_at)}
                    </div>
                    <div className="flex space-x-2">
                      {notification.estado === 'pendiente' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Marcar Leída
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(notification)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(notification.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal para editar notificación */}
      <NotificationForm
        notification={selectedNotification}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        solicitudId={solicitudId}
        empresaId={empresaId}
      />

      {/* Modal para crear notificación */}
      <NotificationForm
        notification={null}
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSave={handleSave}
        solicitudId={solicitudId}
        empresaId={empresaId}
      />
    </>
  );
};
