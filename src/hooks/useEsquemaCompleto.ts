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

      // ✅ USAR EL ENDPOINT CORRECTO: /schema/{entidad} que devuelve campos fijos + dinámicos
      const response = await fetch(
        buildApiUrl(`/schema/${entidad}?empresa_id=${empresaId}`),
        {
          headers: {
            'X-User-Id': localStorage.getItem('user_id') || '1',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.ok) {
          // El endpoint /schema/{entidad} devuelve tanto campos fijos como dinámicos
          const esquemaCompleto = result.data;

          // Validar y limpiar campos fijos
          const camposFijosLimpios = validarEsquema(esquemaCompleto.campos_fijos || []);

          // Validar y limpiar campos dinámicos
          const camposDinamicosLimpios = validarEsquema(esquemaCompleto.campos_dinamicos || []);

          // Ordenar campos por order_index si existe
          const ordenarCampos = (campos: EsquemaCampo[]) => {
            return campos.sort((a: EsquemaCampo, b: EsquemaCampo) => {
              const orderA = a.order_index || 999;
              const orderB = b.order_index || 999;
              return orderA - orderB;
            });
          };

          const esquemaFinal: EsquemaCompleto = {
            entidad: esquemaCompleto.entidad || entidad,
            tabla: esquemaCompleto.tabla || entidad,
            json_column: esquemaCompleto.json_column || getJsonColumnName(entidad),
            total_campos: camposFijosLimpios.length + camposDinamicosLimpios.length,
            campos_fijos: ordenarCampos(camposFijosLimpios),
            campos_dinamicos: ordenarCampos(camposDinamicosLimpios)
          };

          console.log(`✅ Esquema completo cargado para ${entidad}:`, {
            campos_fijos: esquemaFinal.campos_fijos.length,
            campos_dinamicos: esquemaFinal.campos_dinamicos.length,
            total: esquemaFinal.total_campos
          });

          setEsquema(esquemaFinal);
        } else {
          throw new Error(result.error || 'Error en la respuesta del servidor');
        }
      } else {
        throw new Error(`Error al cargar esquema: ${response.status} ${response.statusText}`);
      }

    } catch (error) {
      console.error(`❌ Error cargando esquema para ${entidad}:`, error);
      setError(error instanceof Error ? error.message : 'Error desconocido');

      // En caso de error, crear un esquema básico con campos fijos por defecto
      const esquemaBasico: EsquemaCompleto = {
        entidad: entidad,
        tabla: entidad,
        json_column: getJsonColumnName(entidad),
        total_campos: 0,
        campos_fijos: getCamposFijosPorDefecto(entidad),
        campos_dinamicos: []
      };

      setEsquema(esquemaBasico);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para obtener el nombre de la columna JSON según la entidad
  const getJsonColumnName = (entidad: string): string => {
    const jsonColumnMapping: Record<string, string> = {
      'solicitante': 'info_extra',
      'ubicacion': 'detalle_direccion',
      'actividad_economica': 'detalle_actividad',
      'informacion_financiera': 'detalle_financiera',
      'referencia': 'detalle_referencia',
      'solicitud': 'detalle_credito'
    };

    return jsonColumnMapping[entidad] || 'datos_adicionales';
  };

  // Función para obtener campos fijos por defecto en caso de error
  const getCamposFijosPorDefecto = (entidad: string): EsquemaCampo[] => {
    switch (entidad) {
      case 'solicitante':
        return [
          { key: 'nombres', type: 'string', required: true },
          { key: 'primer_apellido', type: 'string', required: true },
          { key: 'segundo_apellido', type: 'string', required: false },
          { key: 'tipo_identificacion', type: 'string', required: true, description: 'Tipo de Identificación' },
          { key: 'numero_documento', type: 'string', required: true },
          { key: 'fecha_nacimiento', type: 'date', required: true },
          { key: 'genero', type: 'string', required: true, description: 'Género' },
          { key: 'correo', type: 'string', required: true },
          { key: 'telefono', type: 'string', required: false },
          { key: 'estado_civil', type: 'string', required: false, description: 'Estado Civil' },
          { key: 'personas_a_cargo', type: 'number', required: false }
        ];
      case 'ubicacion':
        return [
          { key: 'direccion', type: 'string', required: true },
          { key: 'ciudad', type: 'string', required: true },
          { key: 'departamento', type: 'string', required: true },
          { key: 'tipo_direccion', type: 'string', required: true },
          { key: 'barrio', type: 'string', required: false },
          { key: 'estrato', type: 'number', required: false }
        ];
      case 'actividad_economica':
        return [
          { key: 'empresa', type: 'string', required: false },
          { key: 'cargo', type: 'string', required: false },
          { key: 'tipo_contrato', type: 'string', required: false, description: 'Tipo de Contrato' },
          { key: 'salario_base', type: 'number', required: false },
          { key: 'tipo_actividad', type: 'string', required: true, description: 'Tipo de Actividad' },
          { key: 'sector_economico', type: 'string', required: false, description: 'Sector Económico' },
          { key: 'codigo_ciuu', type: 'string', required: false },
          { key: 'departamento_empresa', type: 'string', required: false },
          { key: 'ciudad_empresa', type: 'string', required: false },
          { key: 'telefono_empresa', type: 'string', required: false },
          { key: 'correo_empresa', type: 'string', required: false },
          { key: 'nit_empresa', type: 'string', required: false }
        ];
      case 'informacion_financiera':
        return [
          { key: 'ingresos_mensuales', type: 'number', required: true },
          { key: 'gastos_mensuales', type: 'number', required: true },
          { key: 'otros_ingresos', type: 'number', required: false },
          { key: 'total_ingresos_mensuales', type: 'number', required: false },
          { key: 'total_egresos_mensuales', type: 'number', required: false },
          { key: 'total_activos', type: 'number', required: false },
          { key: 'total_pasivos', type: 'number', required: false }
        ];
      case 'referencia':
        return [
          { key: 'nombre_completo', type: 'string', required: true },
          { key: 'telefono_referencia', type: 'string', required: true },
          { key: 'tipo_referencia', type: 'string', required: true, description: 'Tipo de Referencia' },
          { key: 'parentesco', type: 'string', required: false, description: 'Parentesco' },
          { key: 'ciudad_referencia', type: 'string', required: false }
        ];
      case 'solicitud':
        return [
          { key: 'monto_solicitado', type: 'number', required: true },
          { key: 'plazo_meses', type: 'number', required: true },
          { key: 'tipo_credito_id', type: 'number', required: true },
          { key: 'destino_credito', type: 'string', required: true, description: 'Destino del Crédito' },
          { key: 'cuota_inicial', type: 'number', required: false },
          { key: 'ciudad_solicitud', type: 'string', required: false, description: 'Ciudad de Solicitud' },
          { key: 'banco_nombre', type: 'string', required: false, description: 'Banco' }
        ];
      default:
        return [];
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
