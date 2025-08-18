import { useState, useEffect } from 'react';
import { camposDinamicosAPI } from '../services/camposDinamicosService';
import { diagnostico } from '../utils/diagnosticoCamposDinamicos';
import { EsquemaCampo } from '../types/esquemas';

/**
 * Hook optimizado para campos dinámicos basado en la guía del backend
 * Combina las mejores prácticas de cache, validación y manejo de errores
 */

interface UseCamposDinamicosReturn {
  esquemaCompleto: any | null;
  esquemaJSON: EsquemaCampo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;

  // Funciones para manejo de datos
  leerDatos: (recordId: number, clave?: string) => Promise<any>;
  guardarDatos: (recordId: number, datos: Record<string, any>, validar?: boolean) => Promise<any>;
  guardarClave: (recordId: number, clave: string, valor: any, validar?: boolean) => Promise<any>;
  eliminarClave: (recordId: number, clave: string) => Promise<any>;

  // Utilidades
  filtrarDatos: (datos: Record<string, any>) => Record<string, any>;
  validarDatos: (datos: Record<string, any>) => Record<string, any>;
}

export const useCamposDinamicos = (
  entidad: string,
  campoJson: string,
  useCompleteSchema: boolean = true
): UseCamposDinamicosReturn => {
  const [esquemaCompleto, setEsquemaCompleto] = useState<any | null>(null);
  const [esquemaJSON, setEsquemaJSON] = useState<EsquemaCampo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEsquemas = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useCompleteSchema) {
        // Cargar esquema completo (campos fijos + dinámicos)
        const esquemaCompletoData = await camposDinamicosAPI.obtenerEsquemaCompleto(entidad);
        setEsquemaCompleto(esquemaCompletoData);
        setEsquemaJSON(esquemaCompletoData.campos_dinamicos || []);
      } else {
        // Cargar solo esquema JSON
        const esquemaJSONData = await camposDinamicosAPI.obtenerEsquemaJSON(entidad, campoJson);
        setEsquemaJSON(esquemaJSONData);
      }
    } catch (err) {
      console.error('Error cargando esquemas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entidad && campoJson) {
      cargarEsquemas();
    }
  }, [entidad, campoJson, useCompleteSchema]);

  // Funciones para manejo de datos
  const leerDatos = async (recordId: number, clave?: string): Promise<any> => {
    try {
      if (clave) {
        return await camposDinamicosAPI.leerClaveJSON(entidad, recordId, campoJson, clave);
      } else {
        return await camposDinamicosAPI.leerCampoJSON(entidad, recordId, campoJson);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error leyendo datos');
      throw err;
    }
  };

  const guardarDatos = async (
    recordId: number,
    datos: Record<string, any>,
    validar: boolean = true
  ): Promise<any> => {
    try {
      return await camposDinamicosAPI.actualizarVariasClavesJSON(
        entidad,
        recordId,
        campoJson,
        datos,
        validar
      );
    } catch (err) {
      console.error('Error guardando datos:', err);

      // Si hay un error 405, ejecutar diagnóstico automáticamente
      if (err instanceof Error && err.message.includes('405')) {
        console.warn('Detectado error 405, ejecutando diagnóstico...');
        setTimeout(() => {
          diagnostico.probarEndpoints(entidad, recordId, campoJson);
        }, 1000);
      }

      setError(err instanceof Error ? err.message : 'Error guardando datos');
      throw err;
    }
  };

  const guardarClave = async (
    recordId: number,
    clave: string,
    valor: any,
    validar: boolean = true
  ): Promise<any> => {
    try {
      return await camposDinamicosAPI.actualizarClaveJSON(
        entidad,
        recordId,
        campoJson,
        clave,
        valor,
        validar
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando clave');
      throw err;
    }
  };

  const eliminarClave = async (recordId: number, clave: string): Promise<any> => {
    try {
      return await camposDinamicosAPI.eliminarClaveJSON(entidad, recordId, campoJson, clave);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando clave');
      throw err;
    }
  };

  // Utilidades
  const filtrarDatos = (datos: Record<string, any>): Record<string, any> => {
    const esquema = useCompleteSchema ? esquemaCompleto?.campos_dinamicos || [] : esquemaJSON;
    return camposDinamicosAPI.filtrarCamposConValor(datos, esquema);
  };

  const validarDatos = (datos: Record<string, any>): Record<string, any> => {
    const esquema = useCompleteSchema ? esquemaCompleto?.campos_dinamicos || [] : esquemaJSON;
    return camposDinamicosAPI.validarTipos(datos, esquema);
  };

  const refetch = () => {
    cargarEsquemas();
  };

  return {
    esquemaCompleto,
    esquemaJSON,
    loading,
    error,
    refetch,
    leerDatos,
    guardarDatos,
    guardarClave,
    eliminarClave,
    filtrarDatos,
    validarDatos
  };
};

/**
 * Hook simplificado para múltiples entidades
 */
interface ConfiguracionEsquema {
  entidad: string;
  campoJson: string;
  alias?: string;
}

interface UseMultiplesCamposDinamicosReturn {
  esquemas: Record<string, {
    esquemaCompleto: any | null;
    esquemaJSON: EsquemaCampo[];
    loading: boolean;
    error: string | null;
  }>;
  loading: boolean;
  error: string | null;
  refetchAll: () => void;
}

export const useMultiplesCamposDinamicos = (
  configuraciones: ConfiguracionEsquema[]
): UseMultiplesCamposDinamicosReturn => {
  const [esquemas, setEsquemas] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTodosLosEsquemas = async () => {
    try {
      setLoading(true);
      setError(null);

      const resultados: Record<string, any> = {};

      // Cargar todos los esquemas en paralelo
      const promesas = configuraciones.map(async (config) => {
        const alias = config.alias || config.entidad;
        try {
          const esquemaCompleto = await camposDinamicosAPI.obtenerEsquemaCompleto(config.entidad);
          resultados[alias] = {
            esquemaCompleto,
            esquemaJSON: esquemaCompleto.campos_dinamicos || [],
            loading: false,
            error: null
          };
        } catch (err) {
          resultados[alias] = {
            esquemaCompleto: null,
            esquemaJSON: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Error desconocido'
          };
        }
      });

      await Promise.all(promesas);
      setEsquemas(resultados);
    } catch (err) {
      console.error('Error cargando múltiples esquemas:', err);
      setError(err instanceof Error ? err.message : 'Error cargando esquemas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (configuraciones.length > 0) {
      cargarTodosLosEsquemas();
    }
  }, [JSON.stringify(configuraciones)]);

  const refetchAll = () => {
    cargarTodosLosEsquemas();
  };

  return {
    esquemas,
    loading,
    error,
    refetchAll
  };
};

export default useCamposDinamicos;
