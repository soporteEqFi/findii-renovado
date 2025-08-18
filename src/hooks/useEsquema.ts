import { useState, useEffect } from 'react';
import { buildApiUrl, API_CONFIG } from '../config/constants';
import { EsquemaCampo, EsquemaResponse } from '../types/esquemas';
import { esquemasTemporales } from '../config/esquemasTemporales';

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

        // Validar estructura según tipo
        if (campo.type === 'array') {
          // Para arrays, debe tener item_structure
          if (!campo.list_values.item_structure) {
            console.warn(`Campo ${campo.key}: array sin item_structure`, campo.list_values);
            campo.list_values = null; // Tratar como array libre
          }
        } else if (campo.type === 'object') {
          // Para objetos, debe ser array de definiciones
          if (!Array.isArray(campo.list_values)) {
            console.warn(`Campo ${campo.key}: object sin array structure`, campo.list_values);
            campo.list_values = null; // Tratar como objeto libre
          }
        } else if (campo.type === 'string') {
          // Para strings, debe ser array simple
          if (!Array.isArray(campo.list_values)) {
            console.warn(`Campo ${campo.key}: string sin array options`, campo.list_values);
            campo.list_values = null; // Tratar como input libre
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

interface UseEsquemaReturn {
  esquema: EsquemaCampo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache para esquemas con TTL
const esquemaCache = new Map<string, { data: EsquemaCampo[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useEsquema = (entidad: string, campoJson: string, empresaId: number = 1): UseEsquemaReturn => {
  const [esquema, setEsquema] = useState<EsquemaCampo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEsquema = async () => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `${entidad}_${campoJson}_${empresaId}`;
      const cached = esquemaCache.get(cacheKey);

      // Verificar cache
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        setEsquema(cached.data);
        setLoading(false);
        return;
      }

      // Consultar endpoint
      const response = await fetch(
        buildApiUrl(`/json/schema/${entidad}/${campoJson}?empresa_id=${empresaId}`)
      );

      if (!response.ok) {
        throw new Error(`Error al cargar esquema: ${response.statusText}`);
      }

      const result: EsquemaResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      // Validar y limpiar esquema antes de guardarlo
      const esquemaLimpio = validarEsquema(result.data || []);

      // Ordenar por order_index si existe
      const esquemaOrdenado = esquemaLimpio.sort((a: EsquemaCampo, b: EsquemaCampo) => {
        const orderA = a.order_index || 999;
        const orderB = b.order_index || 999;
        return orderA - orderB;
      });

      setEsquema(esquemaOrdenado);

      // Guardar en cache
      esquemaCache.set(cacheKey, {
        data: esquemaOrdenado,
        timestamp: Date.now()
      });

    } catch (err) {
      console.error('Error cargando esquema:', err);

      // Usar esquemas temporales como fallback
      const esquemaKey = `${entidad}_${campoJson}`;
      const esquemaTemporal = esquemasTemporales[esquemaKey];

      if (esquemaTemporal) {
        console.log(`Usando esquema temporal para ${esquemaKey}`);
        setEsquema(esquemaTemporal);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    cargarEsquema();
  };

  useEffect(() => {
    cargarEsquema();
  }, [entidad, campoJson, empresaId]);

  return { esquema, loading, error, refetch };
};
