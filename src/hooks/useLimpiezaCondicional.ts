import { useCallback } from 'react';
import { EsquemaCompleto } from './useEsquemaCompleto';

/**
 * Hook para manejar la limpieza automática de campos condicionales
 * cuando cambia un campo activador (como tipo_actividad, tipo_credito, etc.)
 */
export const useLimpiezaCondicional = () => {

  /**
   * Limpia campos condicionales basándose en el esquema dinámico
   * @param esquemaCompleto - El esquema completo que contiene campos fijos y dinámicos
   * @param campoActivador - El nombre del campo que actúa como activador
   * @param nuevoValor - El nuevo valor del campo activador
   * @param datosActuales - Los datos actuales del formulario
   * @param onChange - Función para actualizar los datos
   */
  const limpiarCamposCondicionales = useCallback((
    esquemaCompleto: EsquemaCompleto,
    campoActivador: string,
    nuevoValor: any,
    datosActuales: any,
    onChange: (key: string, value: any) => void
  ) => {
    if (!esquemaCompleto?.campos_dinamicos) return;

    // Obtener todos los campos dinámicos que dependen del campo activador
    const camposCondicionales = esquemaCompleto.campos_dinamicos.filter(campo =>
      campo.conditional_on?.field === campoActivador
    );

        // Limpiar campos que no coinciden con el nuevo valor
        camposCondicionales.forEach(campo => {
          if (campo.conditional_on?.value !== nuevoValor) {
            // Limpiar el campo individual
            onChange(campo.key, '');
          }
        });

    // Limpiar objetos anidados que no coincidan con el nuevo tipo
    if (campoActivador === 'tipo_actividad' && datosActuales?.actividad_economica?.detalle_actividad) {
      const detalleActividad = datosActuales.actividad_economica.detalle_actividad;
      const tipoNormalizado = String(nuevoValor || '').toLowerCase();

      // Patrones de objetos que podrían existir
      const patronesObjetos = [
        `datos_${tipoNormalizado}`,
        `info_${tipoNormalizado}`,
        `detalle_${tipoNormalizado}`,
        `${tipoNormalizado}_data`,
        `${tipoNormalizado}_info`
      ];

      // Limpiar objetos que no coincidan con el nuevo tipo
      Object.keys(detalleActividad).forEach(key => {
        if (typeof detalleActividad[key] === 'object' && detalleActividad[key] !== null) {
          const esObjetoDelNuevoTipo = patronesObjetos.some(patron => key.includes(patron));
          if (!esObjetoDelNuevoTipo && key.startsWith('datos_')) {
            delete detalleActividad[key];
          }
        }
      });
    }

  }, []);

  /**
   * Limpia campos condicionales de forma genérica para cualquier campo activador
   * @param esquemas - Objeto con todos los esquemas disponibles
   * @param entidad - La entidad a la que pertenece el campo (ej: 'actividad_economica')
   * @param campoActivador - El nombre del campo que actúa como activador
   * @param nuevoValor - El nuevo valor del campo activador
   * @param datosActuales - Los datos actuales del formulario
   * @param onChange - Función para actualizar los datos
   */
  const limpiarCamposCondicionalesGenerico = useCallback((
    esquemas: any,
    entidad: string,
    campoActivador: string,
    nuevoValor: any,
    datosActuales: any,
    onChange: (key: string, value: any) => void
  ) => {
    const esquemaCompleto = esquemas?.[entidad]?.esquema;
    if (!esquemaCompleto) {
      return;
    }

    limpiarCamposCondicionales(esquemaCompleto, campoActivador, nuevoValor, datosActuales, onChange);
  }, [limpiarCamposCondicionales]);

  return {
    limpiarCamposCondicionales,
    limpiarCamposCondicionalesGenerico
  };
};
