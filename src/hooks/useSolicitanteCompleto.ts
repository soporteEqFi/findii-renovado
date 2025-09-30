import { useState, useEffect } from 'react';
import { solicitanteService, TodosLosRegistrosResponse } from '../services/solicitanteService';

// Función auxiliar para validar que las credenciales estén disponibles
const validarCredenciales = (): boolean => {
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('access_token');
  const empresaId = localStorage.getItem('empresa_id');
  
  return !!(userId && token && empresaId);
};

// Función auxiliar para esperar con delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  const fetchData = async (intentoActual: number = 0) => {
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
      // Validar que las credenciales estén disponibles antes de hacer la petición
      if (!validarCredenciales()) {
        console.warn(`⏳ Credenciales no disponibles aún para solicitante ${solicitanteId}, esperando...`);
        await delay(300); // Esperar 300ms
        
        // Verificar nuevamente después del delay
        if (!validarCredenciales()) {
          throw new Error('Credenciales no disponibles');
        }
      }

      const response = await solicitanteService.traerTodosLosRegistros(solicitanteId, empresaId);
      setDatos(response);

      // Mapear datos para UI
      const mapeados = solicitanteService.mapearDatosParaUI(response);
      setDatosMapeados(mapeados);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // Implementar retry logic con backoff exponencial (máximo 3 intentos)
      if (intentoActual < 3 && (errorMessage.includes('404') || errorMessage.includes('Credenciales no disponibles'))) {
        const delayMs = Math.min(1000 * Math.pow(2, intentoActual), 3000); // 1s, 2s, 3s max
        console.warn(`⚠️ Error cargando solicitante ${solicitanteId}, reintentando en ${delayMs}ms (intento ${intentoActual + 1}/3)`);
        
        await delay(delayMs);
        return fetchData(intentoActual + 1);
      }
      
      setError(errorMessage);
      console.error('❌ Error cargando datos del solicitante:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Pequeño delay inicial para asegurar que el contexto esté listo
    const timer = setTimeout(() => {
      fetchData(0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [solicitanteId, empresaId]);

  const refetch = async () => {
    await fetchData(0);
  };

  return {
    datos,
    datosMapeados,
    loading,
    error,
    refetch
  };
};
