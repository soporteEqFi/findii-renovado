import { useState, useEffect, useCallback } from 'react';
import { unifiedCamposDinamicos } from '../services/unifiedCamposDinamicos';
import { EsquemaCampo } from '../types/esquemas';

/**
 * HOOK UNIFICADO PARA CAMPOS DINÁMICOS
 *
 * ✅ Reemplaza todos los hooks anteriores
 * ✅ Un solo punto de entrada
 * ✅ Sin llamados duplicados
 * ✅ Cache inteligente
 *
 * USAR SOLO ESTE HOOK PARA CAMPOS DINÁMICOS
 */

interface UseUnifiedCamposDinamicosReturn {
  // Estados
  camposDinamicos: EsquemaCampo[];
  loading: boolean;
  error: string | null;

    // Funciones para datos
  leerDatos: (recordId: number) => Promise<Record<string, any>>;
  guardarDatos: (recordId: number, datos: Record<string, any>) => Promise<any>;
  guardarClave: (recordId: number, clave: string, valor: any) => Promise<any>;
  guardarDatosInteligente: (recordId: number, formData: Record<string, any>) => Promise<any>;
  eliminarClave: (recordId: number, clave: string) => Promise<any>;

  // Utilidades
  filtrarDatos: (datos: Record<string, any>) => Record<string, any>;
  validarDatos: (datos: Record<string, any>) => Record<string, any>;

  // Control
  refetch: () => void;
  limpiarCache: () => void;
}

export const useUnifiedCamposDinamicos = (
  entidad: string,
  campoJson: string,
  autoLoad: boolean = true
): UseUnifiedCamposDinamicosReturn => {
  const [camposDinamicos, setCamposDinamicos] = useState<EsquemaCampo[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const cargarEsquema = useCallback(async () => {
    if (!entidad || !campoJson) {
      setError('Entidad y campoJson son requeridos');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 🎯 UNA SOLA LLAMADA para obtener campos dinámicos
      const campos = await unifiedCamposDinamicos.obtenerCamposDinamicos(entidad, campoJson);

      setCamposDinamicos(campos || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error(`Error cargando campos dinámicos ${entidad}/${campoJson}:`, err);
    } finally {
      setLoading(false);
    }
  }, [entidad, campoJson]);

  useEffect(() => {
    if (autoLoad) {
      cargarEsquema();
    }
  }, [cargarEsquema, autoLoad]);

  // 📖 Leer datos
  const leerDatos = useCallback(async (recordId: number): Promise<Record<string, any>> => {
    try {
      return await unifiedCamposDinamicos.leerDatos(entidad, recordId, campoJson);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error leyendo datos';
      setError(errorMessage);
      throw err;
    }
  }, [entidad, campoJson]);

    // 💾 Guardar datos (simple)
  const guardarDatos = useCallback(async (
    recordId: number,
    datos: Record<string, any>
  ): Promise<any> => {
    try {
      return await unifiedCamposDinamicos.guardarDatos(entidad, recordId, campoJson, datos, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardando datos';
      setError(errorMessage);
      throw err;
    }
  }, [entidad, campoJson]);

  // 💾 Guardar una sola clave
  const guardarClave = useCallback(async (
    recordId: number,
    clave: string,
    valor: any
  ): Promise<any> => {
    try {
      return await unifiedCamposDinamicos.guardarClave(entidad, recordId, campoJson, clave, valor, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardando clave';
      setError(errorMessage);
      throw err;
    }
  }, [entidad, campoJson]);

  // 🧠 Guardar datos con validación inteligente
  const guardarDatosInteligente = useCallback(async (
    recordId: number,
    formData: Record<string, any>
  ): Promise<any> => {
    if (!camposDinamicos.length) {
      throw new Error('Esquema no cargado. No se pueden validar los datos.');
    }

    try {
      return await unifiedCamposDinamicos.guardarDatosInteligente(
        entidad,
        recordId,
        campoJson,
        formData,
        camposDinamicos
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardando datos';
      setError(errorMessage);
      throw err;
    }
  }, [entidad, campoJson, camposDinamicos]);

  // 🗑️ Eliminar clave
  const eliminarClave = useCallback(async (
    recordId: number,
    clave: string
  ): Promise<any> => {
    try {
      return await unifiedCamposDinamicos.eliminarClave(entidad, recordId, campoJson, clave);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando clave';
      setError(errorMessage);
      throw err;
    }
  }, [entidad, campoJson]);

  // 🧹 Filtrar datos
  const filtrarDatos = useCallback((datos: Record<string, any>): Record<string, any> => {
    if (!camposDinamicos.length) {
      console.warn('Esquema no cargado. Retornando datos sin filtrar.');
      return datos;
    }
    return unifiedCamposDinamicos.filtrarCamposConValor(datos, camposDinamicos);
  }, [camposDinamicos]);

  // ✅ Validar datos
  const validarDatos = useCallback((datos: Record<string, any>): Record<string, any> => {
    if (!camposDinamicos.length) {
      console.warn('Esquema no cargado. Retornando datos sin validar.');
      return datos;
    }
    return unifiedCamposDinamicos.validarTipos(datos, camposDinamicos);
  }, [camposDinamicos]);

  // 🔄 Refetch
  const refetch = useCallback(() => {
    cargarEsquema();
  }, [cargarEsquema]);

  // 🧹 Limpiar cache
  const limpiarCache = useCallback(() => {
    unifiedCamposDinamicos.limpiarCache();
    refetch();
  }, [refetch]);

    return {
    // Estados
    camposDinamicos,
    loading,
    error,

    // Funciones para datos
    leerDatos,
    guardarDatos,
    guardarClave,
    guardarDatosInteligente,
    eliminarClave,

    // Utilidades
    filtrarDatos,
    validarDatos,

    // Control
    refetch,
    limpiarCache
  };
};

/**
 * 🔄 HOOK MÚLTIPLE SIMPLIFICADO
 * Para cargar múltiples esquemas de forma eficiente
 */
interface ConfiguracionEsquema {
  entidad: string;
  campoJson: string;
  alias?: string;
}

interface UseMultipleUnifiedReturn {
  esquemas: Record<string, {
    camposDinamicos: EsquemaCampo[];
    loading: boolean;
    error: string | null;
  }>;
  loading: boolean;
  error: string | null;
  refetchAll: () => void;
}

export const useMultipleUnified = (
  configuraciones: ConfiguracionEsquema[]
): UseMultipleUnifiedReturn => {
  const [esquemas, setEsquemas] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTodos = useCallback(async () => {
    if (!configuraciones.length) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const resultados: Record<string, any> = {};

      // 🚀 Cargar en paralelo (pero sin duplicados por el cache)
      const promesas = configuraciones.map(async (config) => {
        const alias = config.alias || `${config.entidad}_${config.campoJson}`;
        try {
          const camposDinamicos = await unifiedCamposDinamicos.obtenerCamposDinamicos(config.entidad, config.campoJson);
          resultados[alias] = {
            camposDinamicos: camposDinamicos || [],
            loading: false,
            error: null
          };
        } catch (err) {
          resultados[alias] = {
            camposDinamicos: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Error desconocido'
          };
        }
      });

      await Promise.all(promesas);
      setEsquemas(resultados);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando esquemas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [configuraciones]);

  useEffect(() => {
    cargarTodos();
  }, [cargarTodos]);

  const refetchAll = useCallback(() => {
    unifiedCamposDinamicos.limpiarCache();
    cargarTodos();
  }, [cargarTodos]);

  return {
    esquemas,
    loading,
    error,
    refetchAll
  };
};

export default useUnifiedCamposDinamicos;
