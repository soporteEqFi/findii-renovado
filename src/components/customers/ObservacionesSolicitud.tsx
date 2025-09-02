import React, { useState } from 'react';
import { useObservaciones } from '../../hooks/useObservaciones';
import { ObservacionBackend } from '../../services/solicitudService';

interface ObservacionesSolicitudProps {
  solicitudId: number;
  empresaId?: number;
  observaciones?: any;
  onObservacionAgregada?: (observacion: any) => void;
  readonly?: boolean;
}

export const ObservacionesSolicitud: React.FC<ObservacionesSolicitudProps> = ({
  solicitudId,
  empresaId = 1,
  observaciones,
  onObservacionAgregada,
  readonly = false
}) => {
  const [nuevaObservacion, setNuevaObservacion] = useState('');

  // Estado local para el botón de sincronizar
  const [isSyncing, setIsSyncing] = useState(false);

  console.log('🔍 ObservacionesSolicitud renderizado:', {
    solicitudId,
    empresaId,
    observaciones,
    readonly,
    solicitudIdType: typeof solicitudId,
    solicitudIdValid: solicitudId && !isNaN(Number(solicitudId))
  });

  // Extraer el historial de observaciones del formato del backend
  const historialObservaciones = observaciones?.historial || [];

  console.log('🔍 Historial extraído:', historialObservaciones);

  const {
    observaciones: observacionesLocales,
    loading: isSubmitting,
    error,
    agregarObservacion,
    limpiarError,
    cargarObservaciones
  } = useObservaciones({
    solicitudId,
    empresaId,
    observacionesIniciales: historialObservaciones
  });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await cargarObservaciones();
    } finally {
      setIsSyncing(false);
    }
  };

  console.log('🔍 Estado del hook:', {
    observacionesLocales,
    isSubmitting,
    error
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevaObservacion.trim()) {
      return;
    }

    const success = await agregarObservacion(nuevaObservacion.trim());

    if (success) {
      // Limpiar formulario
      setNuevaObservacion('');

      // Notificar al componente padre
      if (onObservacionAgregada) {
        const nuevaObs = {
          observacion: nuevaObservacion.trim(),
          fecha_creacion: new Date().toISOString(),
          usuario_id: parseInt(localStorage.getItem('user_id') || '1'),
          usuario_nombre: localStorage.getItem('user_name') || 'Usuario'
        };
        onObservacionAgregada(nuevaObs);
      }
    }
  };

  const formatFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📝 Historial de Observaciones
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {observacionesLocales.length} observación{observacionesLocales.length !== 1 ? 'es' : ''}
          </span>
          <button
            onClick={handleSync}
            className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sincronizar con el servidor"
            disabled={isSyncing}
          >
            <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
            <span className="text-xs">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
        </div>
      </div>

      {/* Formulario para nueva observación */}
      {!readonly && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="space-y-3">
            <div>
              <label htmlFor="nuevaObservacion" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Observación
              </label>
              <textarea
                id="nuevaObservacion"
                value={nuevaObservacion}
                onChange={(e) => setNuevaObservacion(e.target.value)}
                placeholder="Escribe una nueva observación..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
                <button
                  type="button"
                  onClick={limpiarError}
                  className="ml-2 text-red-800 hover:text-red-900 underline"
                >
                  Cerrar
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !nuevaObservacion.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Agregando...
                  </span>
                ) : (
                  'Agregar Observación'
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Lista de observaciones */}
      <div className="space-y-4">
        {observacionesLocales.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No hay observaciones registradas</p>
            <p className="text-sm">Agrega la primera observación para comenzar el historial</p>
          </div>
        ) : (
          observacionesLocales.map((obs: ObservacionBackend, index: number) => (
            <div key={obs.id || index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {obs.tipo === 'comentario' ? 'Usuario' : obs.tipo}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatFecha(obs.fecha)}
                  </span>
                </div>
                {obs.tipo && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {obs.tipo}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {obs.observacion}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
