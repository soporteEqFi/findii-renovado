import { useState, useEffect } from 'react';
import { buildApiUrl } from '../config/constants';
import { EsquemaCampo } from '../types/esquemas';

// Función auxiliar para validar que las credenciales estén disponibles
const validarCredenciales = (): boolean => {
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('access_token');
  const empresaId = localStorage.getItem('empresa_id');
  
  return !!(userId && token && empresaId);
};

// Función auxiliar para esperar con delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Hook específico para obtener el esquema completo de detalle_credito
// que incluye los campos condicionales basados en tipo_credito
export interface EsquemaDetalleCreditoCompleto {
  entidad: string;
  json_field: string;
  campos_dinamicos: EsquemaCampo[];
  campos_condicionales: Record<string, EsquemaCampo[]>; // Por tipo de crédito
}

interface UseEsquemaDetalleCreditoReturn {
  esquema: EsquemaDetalleCreditoCompleto | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useEsquemaDetalleCreditoCompleto = (empresaId?: number): UseEsquemaDetalleCreditoReturn => {
  const [esquema, setEsquema] = useState<EsquemaDetalleCreditoCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEsquemaDetalle = async (intentoActual: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Validar que las credenciales estén disponibles antes de hacer la petición
      if (!validarCredenciales()) {
        console.warn('⏳ Credenciales no disponibles aún para detalle_credito, esperando...');
        await delay(300); // Esperar 300ms
        
        // Verificar nuevamente después del delay
        if (!validarCredenciales()) {
          throw new Error('Credenciales no disponibles');
        }
      }

      // Usar el endpoint específico para obtener el schema de detalle_credito
      const empresaIdToUse = empresaId || parseInt(localStorage.getItem('empresa_id') || '1', 10);
      const response = await fetch(
        buildApiUrl(`/json/schema/solicitudes/detalle_credito?empresa_id=${empresaIdToUse}`),
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
          const schemaData = result.data;

          // Organizar campos por tipo de crédito
          const camposCondicionales: Record<string, EsquemaCampo[]> = {};
          const camposDinamicos: EsquemaCampo[] = [];

          // Procesar todos los campos
          if (schemaData.campos_dinamicos) {
            schemaData.campos_dinamicos.forEach((campo: EsquemaCampo) => {
              // Si el campo tiene conditional_on con tipo_credito, organizarlo por tipo
              if (campo.conditional_on && campo.conditional_on.field === 'tipo_credito') {
                const tipoCredito = campo.conditional_on.value;
                if (!camposCondicionales[tipoCredito]) {
                  camposCondicionales[tipoCredito] = [];
                }
                camposCondicionales[tipoCredito].push(campo);
              } else {
                // Campo general (no condicional)
                camposDinamicos.push(campo);
              }
            });
          }

          // Ordenar campos por order_index
          const ordenarCampos = (campos: EsquemaCampo[]) => {
            return campos.sort((a, b) => (a.order_index || 999) - (b.order_index || 999));
          };

          // Ordenar campos condicionales por tipo
          Object.keys(camposCondicionales).forEach(tipo => {
            camposCondicionales[tipo] = ordenarCampos(camposCondicionales[tipo]);
          });

          const esquemaFinal: EsquemaDetalleCreditoCompleto = {
            entidad: 'solicitudes',
            json_field: 'detalle_credito',
            campos_dinamicos: ordenarCampos(camposDinamicos),
            campos_condicionales: camposCondicionales
          };

          console.log('✅ Esquema detalle crédito cargado:', {
            campos_dinamicos: esquemaFinal.campos_dinamicos.length,
            tipos_credito: Object.keys(esquemaFinal.campos_condicionales),
            campos_por_tipo: Object.entries(esquemaFinal.campos_condicionales).map(([tipo, campos]) =>
              ({ tipo, cantidad: campos.length })
            )
          });

          setEsquema(esquemaFinal);
        } else {
          throw new Error(result.error || 'Error en la respuesta del servidor');
        }
      } else {
        throw new Error(`Error al cargar esquema detalle crédito: ${response.status}`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      
      // Implementar retry logic con backoff exponencial (máximo 3 intentos)
      if (intentoActual < 3 && (errorMsg.includes('404') || errorMsg.includes('Credenciales no disponibles'))) {
        const delayMs = Math.min(1000 * Math.pow(2, intentoActual), 3000); // 1s, 2s, 3s max
        console.warn(`⚠️ Error cargando esquema detalle_credito, reintentando en ${delayMs}ms (intento ${intentoActual + 1}/3)`);
        
        await delay(delayMs);
        return cargarEsquemaDetalle(intentoActual + 1);
      }
      
      console.error('❌ Error cargando esquema detalle crédito:', error);
      setError(errorMsg);

      // Esquema básico en caso de error
      setEsquema({
        entidad: 'solicitudes',
        json_field: 'detalle_credito',
        campos_dinamicos: [],
        campos_condicionales: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    cargarEsquemaDetalle();
  };

  useEffect(() => {
    // Pequeño delay inicial para asegurar que el contexto esté listo
    const timer = setTimeout(() => {
      cargarEsquemaDetalle(0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [empresaId]);

  return { esquema, loading, error, refetch };
};
