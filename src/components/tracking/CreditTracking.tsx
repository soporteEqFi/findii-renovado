import React, { useState } from 'react';
import { buildApiUrl } from '../../config/constants';
import { useEstados } from '../../hooks/useEstados';

interface Archivo {
  archivo_id: string;
  comentario: string;
  estado: string;
  fecha_modificacion: string;
  modificado: boolean;
  nombre: string;
  ultima_fecha_modificacion: string;
  url: string;
}

interface HistorialItem {
  comentario: string;
  estado: string;
  fecha: string;
  usuario_id: number;
}

interface Etapa {
  archivos: Archivo[];
  comentarios: string;
  estado: string;
  etapa: string;
  fecha_actualizacion: string;
  historial: HistorialItem[];
  requisitos_pendientes?: string[];
  viabilidad?: string;
  desembolsado?: boolean;
  fecha_estimada?: string | null;
}

interface SeguimientoResponse {
  banco: string;
  cambio_por: string;
  estado_global: string;
  etapas: Etapa[];
  fecha_cambio: string;
  fecha_creacion: string;
  id: string;
  id_asesor: number;
  id_producto: number;
  id_radicado: string;
  producto_solicitado: string;
  solicitante_id: number;
}

// API_URL ya no es necesario, usamos buildApiUrl

export const CreditTracking: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [seguimiento, setSeguimiento] = useState<SeguimientoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isAdmin] = useState(false); // Estado para controlar el rol

  // Hook para obtener estados dinámicos
  const empresaId = parseInt(localStorage.getItem('empresa_id') || '1', 10);
  const { estados, loading: loadingEstados } = useEstados(empresaId);

  const handleSearch = async () => {
    if (!trackingId.trim()) {
      setError('Por favor ingrese un número de radicado');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const empresaId = localStorage.getItem('empresa_id') || '1';
      const response = await fetch(buildApiUrl(`/api/seguimiento/radicado/${trackingId}?empresa_id=${empresaId}`));
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al buscar el radicado');
      }
      const data = await response.json();
      setSeguimiento(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al buscar el radicado');
      setSeguimiento(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Por favor seleccione al menos un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('id_radicado', trackingId);
    Array.from(selectedFiles).forEach(file => {
      formData.append('archivos', file);
    });

    setLoading(true);
    try {
      const empresaId = localStorage.getItem('empresa_id') || '1';
      const response = await fetch(buildApiUrl(`/api/seguimiento/actualizar-documentos?empresa_id=${empresaId}`), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir los archivos');
      }

      // Actualizar el seguimiento después de subir los archivos
      await handleSearch();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al subir los archivos');
    } finally {
      setLoading(false);
      setSelectedFiles(null);
    }
  };

  const handleEstadoChange = async (etapaIndex: number, nuevoEstado: string) => {
    if (!seguimiento || !isAdmin) return;

    // Mapear el estado visual al estado que se envía al backend
    const estadoBackend = mapEstadoToBackend(nuevoEstado);

    const etapasActualizadas = [...seguimiento.etapas];
    etapasActualizadas[etapaIndex] = {
      ...etapasActualizadas[etapaIndex],
      estado: estadoBackend,
      fecha_actualizacion: new Date().toISOString(),
    };

    try {
      const empresaId = localStorage.getItem('empresa_id') || '1';
      const response = await fetch(buildApiUrl(`/api/seguimiento/actualizar-estado?empresa_id=${empresaId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_radicado: seguimiento.id_radicado,
          etapas: etapasActualizadas,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      await handleSearch();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar el estado');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (estado: string | undefined) => {
    if (!estado) return 'bg-gray-100 text-gray-800';

    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en estudio':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente información adicional':
        return 'bg-orange-100 text-orange-800';
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'desembolsado':
        return 'bg-purple-100 text-purple-800';
      case 'pagado':
        return 'bg-emerald-100 text-emerald-800';
      case 'negado':
        return 'bg-red-100 text-red-800';
      case 'desistido':
        return 'bg-gray-100 text-gray-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      case 'en revisión':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Función para mapear el estado visual al estado que se envía al backend
  const mapEstadoToBackend = (estadoVisual: string): string => {
    switch (estadoVisual.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'en estudio':
        return 'En estudio';
      case 'pendiente información adicional':
        return 'Pendiente información adicional';
      case 'aprobado':
        return 'Aprobado';
      case 'desembolsado':
        return 'Desembolsado';
      case 'pagado':
        return 'Pagado';
      case 'negado':
        return 'Negado';
      case 'desistido':
        return 'Desistido';
      case 'rechazado':
        return 'Negado';
      default:
        return estadoVisual;
    }
  };

  const getEtapaIcon = (etapa: string) => {
    switch (etapa.toLowerCase()) {
      case 'documentos':
        return '📄';
      case 'banco':
        return '🏦';
      case 'desembolso':
        return '💰';
      default:
        return '📋';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Seguimiento de Crédito
      </h1>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Buscador */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Ingrese el número de radicado"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || loadingEstados}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Buscando...' : loadingEstados ? 'Cargando estados...' : 'Buscar'}
        </button>
      </div>

      {/* Resultados */}
      {seguimiento && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Radicado: {seguimiento.id_radicado}
                </h2>
                <p className="text-gray-600">
                  Banco: {seguimiento.banco} | Producto: {seguimiento.producto_solicitado}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(seguimiento.estado_global)}`}>
                  {seguimiento.estado_global}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  Actualizado: {formatDate(seguimiento.fecha_cambio)}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline de etapas */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Proceso del Crédito
            </h3>
            <div className="space-y-6">
              {seguimiento.etapas.map((etapa, index) => (
                <div key={index} className="relative">
                  {index !== seguimiento.etapas.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100">
                      <span className="text-xl" role="img" aria-label={etapa.etapa}>
                        {getEtapaIcon(etapa.etapa)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-medium text-gray-900 capitalize">
                          {etapa.etapa}
                        </h4>
                        {isAdmin ? (
                          <select
                            value={etapa.estado}
                            onChange={(e) => handleEstadoChange(index, e.target.value)}
                            className={`px-2 py-1 rounded text-sm font-medium ${getStatusClass(etapa.estado)}`}
                          >
                            {(estados.length > 0 ? estados : [
                              'Pendiente',
                              'En estudio',
                              'Pendiente información adicional',
                              'Aprobado',
                              'Desembolsado',
                              'Pagado',
                              'Negado',
                              'Desistido'
                            ]).map((estado) => (
                              <option key={estado} value={estado.toLowerCase()}>
                                {estado}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusClass(etapa.estado)}`}>
                            {etapa.estado}
                          </span>
                        )}
                      </div>

                      {etapa.comentarios && (
                        <p className="text-gray-600 mt-2">{etapa.comentarios}</p>
                      )}

                      {etapa.etapa === 'documentos' && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Subir documentos:</h5>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => setSelectedFiles(e.target.files)}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
                          />
                          {selectedFiles && selectedFiles.length > 0 && (
                            <button
                              onClick={handleFileUpload}
                              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Subir archivos
                            </button>
                          )}
                        </div>
                      )}

                      {etapa.archivos && etapa.archivos.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {etapa.archivos.map((archivo, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="text-gray-900">{archivo.nombre}</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(archivo.estado)}`}>
                                  {archivo.estado}
                                </span>
                              </div>
                              {archivo.url && (
                                <a
                                  href={archivo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  Ver archivo
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {etapa.historial && etapa.historial.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Historial:</p>
                          <div className="space-y-2 mt-1">
                            {etapa.historial.map((hist, idx) => (
                              <div key={idx} className="text-sm">
                                <span className={`font-medium ${getStatusClass(hist.estado)}`}>
                                  {hist.estado}
                                </span>
                                <span className="text-gray-600"> - {hist.comentario}</span>
                                <br />
                                <span className="text-gray-500">{formatDate(hist.fecha)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-gray-500 mt-2">
                        Actualizado: {formatDate(etapa.fecha_actualizacion)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};