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

        // Validar estructura según tipo
        if (campo.type === 'array') {
          if (typeof campo.list_values === 'object' && campo.list_values !== null) {
            if (!('enum' in campo.list_values)) {
              console.warn(`Campo ${campo.key}: array debe tener list_values con enum`, campo.list_values);
              campo.list_values = null;
            }
          }
        } else if (campo.type === 'object') {
          if (typeof campo.list_values === 'object' && campo.list_values !== null) {
            if (!('object_structure' in campo.list_values)) {
              console.warn(`Campo ${campo.key}: object debe tener list_values con object_structure`, campo.list_values);
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

export const useEsquemaCompleto = (entidad: string, empresaId: number = 1): UseEsquemaCompletoReturn => {
  const [esquema, setEsquema] = useState<EsquemaCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEsquemaCompleto = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔧 Intentando cargar esquema desde backend para ${entidad}`);

      // Intentar cargar desde el backend usando el endpoint correcto
      // Según la documentación: GET /json/schema/{entidad}/{json_field}
      let jsonColumn = 'info_extra';
      if (entidad === 'solicitud') {
        jsonColumn = 'detalle_credito';
      } else if (entidad === 'ubicacion') {
        jsonColumn = 'detalle_direccion';
      } else if (entidad === 'actividad_economica') {
        jsonColumn = 'detalle_actividad';
      } else if (entidad === 'informacion_financiera') {
        jsonColumn = 'detalle_financiera';
      } else if (entidad === 'referencia') {
        jsonColumn = 'detalle_referencia';
      }

      const response = await fetch(
        buildApiUrl(`/json/schema/${entidad}/${jsonColumn}?empresa_id=${empresaId}`)
      );

      console.log(`📡 Respuesta del backend: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const result = await response.json();

        if (result.ok) {
          // El endpoint /json/schema/{entidad}/{json_field} devuelve solo campos dinámicos
          const camposDinamicos = result.data || [];

          // Validar y limpiar campos dinámicos
          const camposDinamicosLimpios = validarEsquema(camposDinamicos);

          // Ordenar campos por order_index si existe
          const ordenarCampos = (campos: EsquemaCampo[]) => {
            return campos.sort((a: EsquemaCampo, b: EsquemaCampo) => {
              const orderA = a.order_index || 999;
              const orderB = b.order_index || 999;
              return orderA - orderB;
            });
          };

          const esquemaCompleto: EsquemaCompleto = {
            entidad: entidad,
            tabla: entidad,
            json_column: jsonColumn,
            total_campos: camposDinamicosLimpios.length,
            campos_fijos: [], // Los campos fijos se manejan por separado
            campos_dinamicos: ordenarCampos(camposDinamicosLimpios)
          };

          setEsquema(esquemaCompleto);
          console.log(`✅ Esquema cargado exitosamente para ${entidad}:`, camposDinamicosLimpios);
        } else {
          throw new Error(result.error || 'Error en la respuesta del servidor');
        }
      } else {
        throw new Error(`Error al cargar esquema: ${response.status} ${response.statusText}`);
      }

    } catch (error) {
      console.error(`❌ Error cargando esquema para ${entidad}:`, error);
      setError(error instanceof Error ? error.message : 'Error desconocido');

      // ✅ FALLBACK MÍNIMO: Solo campos básicos sin duplicaciones
      console.log(`🔧 Usando fallback mínimo para ${entidad}`);

      const camposFijos: EsquemaCampo[] = [];
      const camposDinamicos: EsquemaCampo[] = [];

      // Determinar el nombre de la columna JSON según la entidad
      let jsonColumn = 'info_extra';
      if (entidad === 'solicitud') {
        jsonColumn = 'detalle_credito';
      } else if (entidad === 'ubicacion') {
        jsonColumn = 'detalle_direccion';
      } else if (entidad === 'actividad_economica') {
        jsonColumn = 'detalle_actividad';
      } else if (entidad === 'informacion_financiera') {
        jsonColumn = 'detalle_financiera';
      } else if (entidad === 'referencia') {
        jsonColumn = 'detalle_referencia';
      }

      const esquemaCompleto: EsquemaCompleto = {
        entidad: entidad,
        tabla: entidad,
        json_column: jsonColumn,
        total_campos: camposFijos.length + camposDinamicos.length,
        campos_fijos: camposFijos,
        campos_dinamicos: camposDinamicos
      };

      setEsquema(esquemaCompleto);
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
