# Sistema de Notificaciones

## Descripción
Sistema de notificaciones implementado para mostrar el historial de notificaciones de las solicitudes y permitir su gestión.

## Componentes Implementados

### 1. Tipos de Datos (`src/types/notification.ts`)
- `Notification`: Interfaz principal para las notificaciones
- `NotificationMetadata`: Metadatos adicionales de la notificación
- `NotificationResponse`: Respuesta de la API
- `NotificationUpdateData`: Datos para actualizar notificaciones
- `NotificationFilters`: Filtros para consultar notificaciones

### 2. Servicio (`src/services/notificationService.ts`)
Métodos disponibles:
- `getNotifications()`: Obtener todas las notificaciones
- `getPendingNotifications()`: Obtener notificaciones pendientes
- `getNotification()`: Obtener notificación específica
- `updateNotification()`: Actualizar notificación completa
- `patchNotification()`: Actualizar campos específicos
- `markAsRead()`: Marcar como leída
- `deleteNotification()`: Eliminar notificación

### 3. Hook (`src/hooks/useNotifications.ts`)
Hook personalizado que maneja:
- Estado de las notificaciones
- Carga de datos
- Operaciones CRUD
- Manejo de errores

### 4. Componentes UI

#### NotificationHistory (`src/components/NotificationHistory.tsx`)
- Muestra el historial de notificaciones de una solicitud
- Permite editar notificaciones
- Permite marcar como leída
- Permite eliminar notificaciones
- Muestra prioridad y estado con colores

#### NotificationBadge (`src/components/NotificationBadge.tsx`)
- Badge que muestra el número de notificaciones pendientes
- Se muestra en el sidebar
- Solo aparece si hay notificaciones pendientes

## Integración

### En CustomerDetails
El componente `NotificationHistory` se integra automáticamente en la vista de detalles del cliente cuando existe un `id_solicitud`.

```tsx
{/* Historial de Notificaciones */}
{customer.id_solicitud && (
  <div className="mt-8">
    <NotificationHistory
      solicitudId={typeof customer.id_solicitud === 'string' ? parseInt(customer.id_solicitud) : customer.id_solicitud}
      empresaId={parseInt(localStorage.getItem('empresa_id') || '1')}
    />
  </div>
)}
```

### En Sidebar
El `NotificationBadge` se muestra en el sidebar para indicar notificaciones pendientes.

## Campos Editables
Las notificaciones permiten editar los siguientes campos:
1. **Estado**: pendiente, leída, completada
2. **Prioridad**: baja, media, alta, urgente
3. **Fecha Recordatorio**: reprogramar recordatorios
4. **Mensaje**: personalizar el mensaje

## Endpoints de la API
- `GET /notificaciones/?empresa_id=1` - Listar todas las notificaciones
- `GET /notificaciones/?empresa_id=1&solicitud_id=32` - Filtrar por solicitud
- `GET /notificaciones/pendientes?empresa_id=1` - Obtener pendientes
- `GET /notificaciones/{id}?empresa_id=1` - Obtener específica
- `PUT /notificaciones/{id}?empresa_id=1` - Actualizar completa
- `PATCH /notificaciones/{id}?empresa_id=1` - Actualizar campos específicos
- `PATCH /notificaciones/{id}/marcar-leida?empresa_id=1` - Marcar como leída
- `DELETE /notificaciones/{id}?empresa_id=1` - Eliminar

## Características
- ✅ Interfaz simple y funcional
- ✅ Edición de campos básicos
- ✅ Indicadores visuales de prioridad y estado
- ✅ Badge de notificaciones pendientes
- ✅ Integración automática en detalles de solicitud
- ✅ Manejo de errores
- ✅ Loading states
- ✅ Confirmación para eliminación

## Uso
1. El sistema se carga automáticamente cuando se visualiza un cliente con `id_solicitud`
2. Las notificaciones se muestran en orden cronológico
3. Se pueden editar haciendo clic en "Editar"
4. Se pueden marcar como leídas con el botón "Marcar leída"
5. Se pueden eliminar con confirmación
6. El badge en el sidebar muestra el total de pendientes
