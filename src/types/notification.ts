// Tipos para el sistema de notificaciones

export interface NotificationMetadata {
  accion_requerida?: string;
  banco?: string;
  ciudad?: string;
  detalles_solicitud?: {
    estado: string;
    fecha_creacion: string;
    usuario_asignado: number;
  };
  dias_restantes?: number;
  estado_actual?: string;
  monto_solicitado?: number;
  solicitante_nombre?: string;
  tipo_credito?: string;
  [key: string]: any; // Para campos adicionales
}

export interface Notification {
  id: number;
  empresa_id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha_recordatorio: string;
  fecha_vencimiento: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  estado: 'pendiente' | 'leida' | 'completada';
  solicitud_id: number;
  usuario_id: number;
  metadata: NotificationMetadata;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  data: Notification[];
  ok: boolean;
}

export interface NotificationUpdateData {
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
  estado?: 'pendiente' | 'leida' | 'completada';
  fecha_recordatorio?: string;
  mensaje?: string;
  metadata?: Partial<NotificationMetadata>;
}

export interface NotificationFilters {
  empresa_id: number;
  solicitud_id?: number;
}
