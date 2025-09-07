import { useState, useEffect } from 'react';
import { solicitanteService, TodosLosRegistrosResponse } from '../services/solicitanteService';

interface UseSolicitanteCompletoReturn {
  datos: TodosLosRegistrosResponse | null;
  datosMapeados: any | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSolicitanteCompleto = (
  solicitanteId: number | null,
  empresaId?: number
): UseSolicitanteCompletoReturn => {
  const [datos, setDatos] = useState<TodosLosRegistrosResponse | null>(null);
  const [datosMapeados, setDatosMapeados] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!solicitanteId || isNaN(solicitanteId) || solicitanteId <= 0) {
      setDatos(null);
      setDatosMapeados(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const response = await solicitanteService.traerTodosLosRegistros(solicitanteId, empresaId);
      setDatos(response);
      // Mapear datos para UI
      const mapeados = solicitanteService.mapearDatosParaUI(response);
      setDatosMapeados(mapeados);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error cargando datos del solicitante:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [solicitanteId, empresaId]);

  const refetch = async () => {
    await fetchData();
  };

  return {
    datos,
    datosMapeados,
    loading,
    error,
    refetch
  };
};
