import { useEsquemaCompleto, EsquemaCompleto } from './useEsquemaCompleto';

// Configuración para esquemas completos
export interface EsquemaCompletoConfig {
  entidad: string;
  empresaId?: number;
}

// Estado de múltiples esquemas
export interface EsquemasCompletosState {
  [key: string]: {
    esquema: EsquemaCompleto | null;
    loading: boolean;
    error: string | null;
  };
}

interface UseEsquemasCompletosReturn {
  esquemas: EsquemasCompletosState;
  loading: boolean;
  error: string | null;
  refetchAll: () => void;
  refetchEsquema: (entidad: string) => void;
}

export const useEsquemasCompletos = (configs: EsquemaCompletoConfig[]): UseEsquemasCompletosReturn => {
  // Crear hooks para cada esquema
  const hooks = configs.map(config => ({
    entidad: config.entidad,
    hook: useEsquemaCompleto(config.entidad, config.empresaId)
  }));

  // Agregar esquemas al estado
  const esquemas: EsquemasCompletosState = {};
  hooks.forEach(({ entidad, hook }) => {
    esquemas[entidad] = {
      esquema: hook.esquema,
      loading: hook.loading,
      error: hook.error
    };
  });

  // Estado general de loading
  const loading = hooks.some(h => h.hook.loading);

  // Error general (primer error encontrado)
  const error = hooks.find(h => h.hook.error)?.hook.error || null;

  // Función para refetch de todos
  const refetchAll = () => {
    hooks.forEach(h => h.hook.refetch());
  };

  // Función para refetch de un esquema específico
  const refetchEsquema = (entidad: string) => {
    const hook = hooks.find(h => h.entidad === entidad);
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
