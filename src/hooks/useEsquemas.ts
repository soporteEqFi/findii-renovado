import { useState, useEffect } from 'react';
import { useEsquema } from './useEsquema';
import { EsquemaConfig, EsquemasState, EsquemaCampo } from '../types/esquemas';

interface UseEsquemasReturn {
  esquemas: EsquemasState;
  loading: boolean;
  error: string | null;
  refetchAll: () => void;
  refetchEsquema: (key: string) => void;
}

export const useEsquemas = (configs: EsquemaConfig[]): UseEsquemasReturn => {
  const [esquemas, setEsquemas] = useState<EsquemasState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Crear hooks individuales para cada esquema
  const hooks = configs.map(config => {
    const key = `${config.entidad}_${config.campoJson}`;
    return {
      key,
      hook: useEsquema(config.entidad, config.campoJson, config.empresaId || 1)
    };
  });

  useEffect(() => {
    const nuevosEsquemas: EsquemasState = {};
    let hayLoading = false;
    let hayError = false;
    let primerError = '';

    hooks.forEach(({ key, hook }) => {
      nuevosEsquemas[key] = {
        esquema: hook.esquema as EsquemaCampo[],
        loading: hook.loading,
        error: hook.error
      };

      if (hook.loading) hayLoading = true;
      if (hook.error && !hayError) {
        hayError = true;
        primerError = hook.error;
      }
    });

    setEsquemas(nuevosEsquemas);
    setLoading(hayLoading);
    setError(hayError ? primerError : null);
  }, [hooks]);

  const refetchAll = () => {
    hooks.forEach(({ hook }) => hook.refetch());
  };

  const refetchEsquema = (key: string) => {
    const hook = hooks.find(h => h.key === key);
    if (hook) {
      hook.hook.refetch();
    }
  };

  return {
    esquemas,
    loading,
    error,
    refetchAll,
    refetchEsquema
  };
};
