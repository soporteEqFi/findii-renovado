import { useState, useEffect } from 'react';
import { solicitudService, ObservacionBackend } from '../services/solicitudService';

interface UseObservacionesProps {
  solicitudId: number;
  empresaId?: number;
  observacionesIniciales?: ObservacionBackend[];
}

export const useObservaciones = ({
  solicitudId,
  empresaId = 1,
  observacionesIniciales = []
}: UseObservacionesProps) => {
  const [observaciones, setObservaciones] = useState<ObservacionBackend[]>(observacionesIniciales);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar observaciones del backend cuando cambie el solicitudId
  useEffect(() => {
    // console.log('🔄 useEffect - solicitudId cambiado:', {
    //   solicitudId,
    //   empresaId,
    //   solicitudIdValid: solicitudId && !isNaN(Number(solicitudId)),
    //   solicitudIdType: typeof solicitudId
    // });

    if (solicitudId && !isNaN(Number(solicitudId))) {
      // Solo cargar del backend si no hay observaciones iniciales
      if (!observacionesIniciales || observacionesIniciales.length === 0) {
        // console.log('🚀 No hay observaciones iniciales, cargando del backend...');
        cargarObservaciones();
      } else {
        // console.log('✅ Usando observaciones iniciales proporcionadas:', observacionesIniciales);
        setObservaciones(observacionesIniciales);
      }
    } else {
      console.log('⚠️ No hay solicitudId válido, no se pueden cargar observaciones');
      // console.log('⚠️ solicitudId:', solicitudId, 'tipo:', typeof solicitudId);
    }
  }, [solicitudId, empresaId]);

  // Actualizar observaciones cuando cambien las props
  useEffect(() => {
    // console.log('🔄 useEffect - observacionesIniciales cambiaron:', observacionesIniciales);
    if (observacionesIniciales && observacionesIniciales.length > 0) {
      // console.log('✅ Actualizando observaciones con datos iniciales:', observacionesIniciales);
      setObservaciones(observacionesIniciales);
    }
  }, [observacionesIniciales]);

  const cargarObservaciones = async () => {
    // console.log('📡 Iniciando cargarObservaciones...', { solicitudId, empresaId });
    setLoading(true);
    setError(null);

    try {
      const historial = await solicitudService.obtenerObservaciones(solicitudId, empresaId);
      // console.log('✅ Observaciones cargadas del backend:', historial);
      setObservaciones(historial);
    } catch (error) {
      console.error('❌ Error al cargar observaciones:', error);
      setError('Error al cargar el historial de observaciones');
    } finally {
      setLoading(false);
    }
  };

  const agregarObservacion = async (observacion: string, tipo: string = 'comentario'): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await solicitudService.agregarObservacion(
        solicitudId,
        observacion,
        empresaId,
        tipo
      );

      if (response.ok) {
        // Crear nueva observación local en lugar de recargar del backend
        const nuevaObs: ObservacionBackend = {
          id: `temp-${Date.now()}`, // ID temporal
          tipo: 'comentario',
          fecha: new Date().toISOString(),
          observacion: observacion.trim()
        };

        // Agregar a la lista local
        setObservaciones(prev => [nuevaObs, ...prev]);

        // console.log('✅ Observación agregada localmente:', nuevaObs);
        console.log('✅ Total de observaciones locales:', observaciones.length + 1);

        return true;
      } else {
        setError(response.error || 'Error al agregar la observación');
        return false;
      }
    } catch (error) {
      console.error('Error al agregar observación:', error);
      setError('Error al agregar la observación');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const actualizarObservaciones = (nuevasObservaciones: ObservacionBackend[]) => {
    setObservaciones(nuevasObservaciones);
  };

  const limpiarError = () => {
    setError(null);
  };

  const refrescar = () => {
    cargarObservaciones();
  };

  return {
    observaciones,
    loading,
    error,
    agregarObservacion,
    actualizarObservaciones,
    limpiarError,
    refrescar,
    cargarObservaciones
  };
};
