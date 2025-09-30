import { useState, useEffect } from 'react';
import { estadosService } from '../services/estadosService';

// Función auxiliar para validar que las credenciales estén disponibles
const validarCredenciales = (): boolean => {
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('access_token');
  const empresaId = localStorage.getItem('empresa_id');
  
  return !!(userId && token && empresaId);
};

// Función auxiliar para esperar con delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useEstados = (empresaId: number) => {
  const [estados, setEstados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstados = async (intentoActual: number = 0) => {
      try {
        setLoading(true);
        setError(null);
        
        // Validar que las credenciales estén disponibles antes de hacer la petición
        if (!validarCredenciales()) {
          console.warn('⏳ Credenciales no disponibles aún para estados, esperando...');
          await delay(300); // Esperar 300ms
          
          // Verificar nuevamente después del delay
          if (!validarCredenciales()) {
            throw new Error('Credenciales no disponibles');
          }
        }
        
        const estadosDisponibles = await estadosService.getEstadosDisponibles(empresaId);
        setEstados(estadosDisponibles);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar estados';
        
        // Implementar retry logic con backoff exponencial (máximo 3 intentos)
        if (intentoActual < 3 && (errorMsg.includes('404') || errorMsg.includes('Credenciales no disponibles'))) {
          const delayMs = Math.min(1000 * Math.pow(2, intentoActual), 3000); // 1s, 2s, 3s max
          console.warn(`⚠️ Error cargando estados, reintentando en ${delayMs}ms (intento ${intentoActual + 1}/3)`);
          
          await delay(delayMs);
          return fetchEstados(intentoActual + 1);
        }
        
        setError(errorMsg);
        console.error('Error al cargar estados:', err);
      } finally {
        setLoading(false);
      }
    };

    if (empresaId) {
      // Pequeño delay inicial para asegurar que el contexto esté listo
      const timer = setTimeout(() => {
        fetchEstados(0);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [empresaId]);

  const refetchEstados = async () => {
    try {
      setLoading(true);
      setError(null);
      const estadosDisponibles = await estadosService.getEstadosDisponibles(empresaId);
      setEstados(estadosDisponibles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al recargar estados');
      console.error('Error al recargar estados:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    estados,
    loading,
    error,
    refetchEstados
  };
};
