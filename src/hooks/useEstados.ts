import { useState, useEffect } from 'react';
import { estadosService } from '../services/estadosService';

export const useEstados = (empresaId: number) => {
  const [estados, setEstados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setLoading(true);
        setError(null);
    const estadosDisponibles = await estadosService.getEstadosDisponibles(empresaId);
    setEstados(estadosDisponibles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estados');
        console.error('Error al cargar estados:', err);
      } finally {
        setLoading(false);
      }
    };

    if (empresaId) {
      fetchEstados();
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
