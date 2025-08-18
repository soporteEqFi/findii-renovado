import { useState, useEffect } from 'react';
import { buildApiUrl } from '../config/constants';
import { EsquemaCampo } from '../types/esquemas';

// Interfaz para el esquema completo
export interface EsquemaCompleto {
  entidad: string;
  tabla: string;
  json_column: string;
  total_campos: number;
  campos_fijos: EsquemaCampo[];
  campos_dinamicos: EsquemaCampo[];
}

// Interfaz para la respuesta del esquema completo
interface EsquemaCompletoResponse {
  ok: boolean;
  data: EsquemaCompleto;
  error?: string;
}

interface UseEsquemaCompletoReturn {
  esquema: EsquemaCompleto | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Función para validar y limpiar esquemas problemáticos
const validarEsquema = (esquema: EsquemaCampo[]): EsquemaCampo[] => {
  return esquema.map(campo => {
    // Verificar si list_values está correctamente estructurado
    if (campo.list_values) {
      try {
        // Si es string, intentar parsear como JSON
        if (typeof campo.list_values === 'string') {
          campo.list_values = JSON.parse(campo.list_values);
        }

        // Validar estructura según tipo (solo dos formatos permitidos)
        if (campo.type === 'array') {
          // Para arrays, solo formato con enum
          if (typeof campo.list_values === 'object' && campo.list_values !== null) {
            if (!('enum' in campo.list_values)) {
              console.warn(`Campo ${campo.key}: array debe tener list_values con enum`, campo.list_values);
              campo.list_values = null;
            }
          }
        } else if (campo.type === 'object') {
          // Para objetos, solo formato con object_structure
          if (typeof campo.list_values === 'object' && campo.list_values !== null) {
            if (!('object_structure' in campo.list_values)) {
              console.warn(`Campo ${campo.key}: object debe tener list_values con object_structure`, campo.list_values);
              campo.list_values = null;
            }
          }
        } else if (campo.type === 'string') {
          // Para strings, mantener compatibilidad con formatos anteriores
          if (typeof campo.list_values === 'object' && campo.list_values !== null) {
            if (!('enum' in campo.list_values) && !Array.isArray(campo.list_values)) {
              console.warn(`Campo ${campo.key}: string sin opciones válidas`, campo.list_values);
              campo.list_values = null;
            }
          }
        }
      } catch (e) {
        console.error(`Error parsing list_values for ${campo.key}:`, e);
        campo.list_values = null;
      }
    }

    return campo;
  });
};

// Cache para esquemas completos con TTL
const esquemaCompletoCache = new Map<string, { data: EsquemaCompleto; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useEsquemaCompleto = (entidad: string, empresaId: number = 1): UseEsquemaCompletoReturn => {
  const [esquema, setEsquema] = useState<EsquemaCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEsquemaCompleto = async () => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `${entidad}_completo_${empresaId}`;
      const cached = esquemaCompletoCache.get(cacheKey);

      // Verificar cache
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        setEsquema(cached.data);
        setLoading(false);
        return;
      }

      // Consultar endpoint de esquema completo
      const response = await fetch(
        buildApiUrl(`/schema/${entidad}?empresa_id=${empresaId}`)
      );

      if (!response.ok) {
        throw new Error(`Error al cargar esquema completo: ${response.statusText}`);
      }

      const result: EsquemaCompletoResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      const schema = result.data;

      // Validar y limpiar campos dinámicos
      const camposDinamicosLimpios = validarEsquema(schema.campos_dinamicos || []);

      // Ordenar campos por order_index si existe
      const ordenarCampos = (campos: EsquemaCampo[]) => {
        return campos.sort((a: EsquemaCampo, b: EsquemaCampo) => {
          const orderA = a.order_index || 999;
          const orderB = b.order_index || 999;
          return orderA - orderB;
        });
      };

      const esquemaCompleto: EsquemaCompleto = {
        entidad: schema.entidad,
        tabla: schema.tabla,
        json_column: schema.json_column,
        total_campos: schema.total_campos,
        campos_fijos: ordenarCampos(schema.campos_fijos || []),
        campos_dinamicos: ordenarCampos(camposDinamicosLimpios)
      };

      setEsquema(esquemaCompleto);

      // Guardar en cache
      esquemaCompletoCache.set(cacheKey, {
        data: esquemaCompleto,
        timestamp: Date.now()
      });

    } catch (err) {
      console.error('Error cargando esquema completo:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    cargarEsquemaCompleto();
  };

  useEffect(() => {
    cargarEsquemaCompleto();
  }, [entidad, empresaId]);

  return { esquema, loading, error, refetch };
};
