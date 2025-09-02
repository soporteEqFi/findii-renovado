import { buildApiUrl, API_CONFIG } from '../config/constants';

// Tipos para la respuesta del endpoint
export interface SolicitanteCompleto {
  id: number;
  nombres: string;
  primer_apellido: string;
  segundo_apellido?: string;
  tipo_identificacion: string;
  numero_documento: string;
  fecha_nacimiento: Date;
  genero: string;
  correo: string;
  info_extra?: Record<string, any>;
}

export interface UbicacionCompleta {
  id: number;
  solicitante_id: number;
  ciudad_residencia: string;
  departamento_residencia: string;
  detalle_direccion?: Record<string, any>;
}

export interface ActividadEconomicaCompleta {
  id: number;
  solicitante_id: number;
  tipo_actividad: string;
  sector_economico: string;
  codigo_ciiu?: string;
  departamento_empresa?: string;
  ciudad_empresa?: string;
  telefono_empresa?: string;
  correo_oficina?: string;
  nit?: string;
  detalle_actividad?: Record<string, any>;
}

export interface InformacionFinancieraCompleta {
  id: number;
  solicitante_id: number;
  total_ingresos_mensuales: number;
  total_egresos_mensuales: number;
  total_activos: number;
  total_pasivos: number;
  detalle_financiera?: Record<string, any>;
}

export interface ReferenciaCompleta {
  id: number;
  solicitante_id: number;
  tipo_referencia: string;
  detalle_referencia?: Record<string, any>;
}

export interface SolicitudCompleta {
  id: number;
  solicitante_id: number;
  estado: string;
  created_by_user_id: number;
  assigned_to_user_id: number;
  detalle_credito?: Record<string, any>;
  observaciones?: Observacion[]; // Campo para historial de observaciones
}

// Interfaz para observaciones individuales
export interface Observacion {
  observacion: string;
  fecha_creacion: string;
  usuario_id?: number;
  usuario_nombre?: string;
}

export interface ResumenRegistros {
  total_ubicaciones: number;
  tiene_actividad_economica: boolean;
  tiene_informacion_financiera: boolean;
  total_referencias: number;
  total_solicitudes: number;
}

export interface TodosLosRegistrosResponse {
  solicitante: SolicitanteCompleto;
  ubicaciones: UbicacionCompleta[];
  actividad_economica?: ActividadEconomicaCompleta;
  informacion_financiera?: InformacionFinancieraCompleta;
  referencias: ReferenciaCompleta[];
  solicitudes: SolicitudCompleta[];
  resumen: ResumenRegistros;
}

export const solicitanteService = {
  // Traer todos los registros de un solicitante específico
  async traerTodosLosRegistros(solicitanteId: number, empresaId: number = 1): Promise<TodosLosRegistrosResponse> {
    try {

      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.TRAER_TODOS_REGISTROS}/${solicitanteId}/traer-todos-registros?empresa_id=${empresaId}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      return result.data;

    } catch (error) {
      console.error('❌ Error en traerTodosLosRegistros:', error);
      throw error;
    }
  },

    // Función auxiliar para mapear los datos a un formato más fácil de usar
  mapearDatosParaUI(datos: TodosLosRegistrosResponse) {
    const solicitante = datos.solicitante;

    return {
      // Información básica del solicitante
      id: solicitante.id,
      nombre_completo: `${solicitante.nombres} ${solicitante.primer_apellido} ${solicitante.segundo_apellido || ''}`.trim(),
      tipo_documento: solicitante.tipo_identificacion,
      numero_documento: solicitante.numero_documento,
      fecha_nacimiento: solicitante.fecha_nacimiento,
      genero: solicitante.genero,
      correo_electronico: solicitante.correo,

      // Información adicional del solicitante
      personas_a_cargo: solicitante.info_extra?.personas_a_cargo,
      telefono: solicitante.info_extra?.telefono,
      nacionalidad: solicitante.info_extra?.nacionalidad,
      estado_civil: solicitante.info_extra?.estado_civil,

      // Información de ubicación (tomar la primera)
      direccion: datos.ubicaciones[0]?.detalle_direccion?.direccion_residencia,
      ciudad: datos.ubicaciones[0]?.ciudad_residencia,
      departamento: datos.ubicaciones[0]?.departamento_residencia,

      // Información de actividad económica
      tipo_actividad: datos.actividad_economica?.tipo_actividad,
      sector_economico: datos.actividad_economica?.sector_economico,
      empresa: datos.actividad_economica?.detalle_actividad?.empresa,
      cargo: datos.actividad_economica?.detalle_actividad?.cargo,
      tipo_contrato: datos.actividad_economica?.detalle_actividad?.tipo_contrato,

      // Información financiera
      ingresos_mensuales: datos.informacion_financiera?.total_ingresos_mensuales,
      gastos_mensuales: datos.informacion_financiera?.total_egresos_mensuales,
      total_activos: datos.informacion_financiera?.total_activos,
      total_pasivos: datos.informacion_financiera?.total_pasivos,

      // Información de crédito (tomar la primera solicitud)
      estado_credito: datos.solicitudes[0]?.estado,
      monto_solicitado: datos.solicitudes[0]?.detalle_credito?.monto_solicitado,
      plazo_meses: datos.solicitudes[0]?.detalle_credito?.plazo_meses,
      tipo_credito: datos.solicitudes[0]?.detalle_credito?.tipo_credito,

      // Campos adicionales de actividad económica
      codigo_ciiu: datos.actividad_economica?.codigo_ciiu,
      departamento_empresa: datos.actividad_economica?.departamento_empresa,
      ciudad_empresa: datos.actividad_economica?.ciudad_empresa,
      telefono_empresa: datos.actividad_economica?.telefono_empresa,
      correo_oficina: datos.actividad_economica?.correo_oficina,
      nit: datos.actividad_economica?.nit,

      // Campos adicionales de detalle de actividad
      direccion_empresa: datos.actividad_economica?.detalle_actividad?.direccion_empresa,
      tiene_negocio_propio: datos.actividad_economica?.detalle_actividad?.tiene_negocio_propio,
      nombre_negocio: datos.actividad_economica?.detalle_actividad?.nombre_negocio,
      direccion_negocio: datos.actividad_economica?.detalle_actividad?.direccion_negocio,
      departamento_negocio: datos.actividad_economica?.detalle_actividad?.departamento_negocio,
      ciudad_negocio: datos.actividad_economica?.detalle_actividad?.ciudad_negocio,
      numero_empleados: datos.actividad_economica?.detalle_actividad?.numero_empleados,

      // Campos adicionales de información financiera
      ingreso_basico_mensual: datos.informacion_financiera?.detalle_financiera?.ingreso_basico_mensual,
      ingreso_variable_mensual: datos.informacion_financiera?.detalle_financiera?.ingreso_variable_mensual,
      otros_ingresos_mensuales: datos.informacion_financiera?.detalle_financiera?.otros_ingresos_mensuales,
      gastos_financieros_mensuales: datos.informacion_financiera?.detalle_financiera?.gastos_financieros_mensuales,
      gastos_personales_mensuales: datos.informacion_financiera?.detalle_financiera?.gastos_personales_mensuales,
      ingresos_fijos_pension: datos.informacion_financiera?.detalle_financiera?.ingresos_fijos_pension,
      ingresos_por_ventas: datos.informacion_financiera?.detalle_financiera?.ingresos_por_ventas,
      ingresos_varios: datos.informacion_financiera?.detalle_financiera?.ingresos_varios,
      honorarios: datos.informacion_financiera?.detalle_financiera?.honorarios,
      arriendos: datos.informacion_financiera?.detalle_financiera?.arriendos,
      ingresos_actividad_independiente: datos.informacion_financiera?.detalle_financiera?.ingresos_actividad_independiente,
      declara_renta: datos.informacion_financiera?.detalle_financiera?.declara_renta,

      // Información de referencias (tomar la primera)
      tipo_referencia: datos.referencias[0]?.tipo_referencia,
      nombre_referencia: datos.referencias[0]?.detalle_referencia?.nombre,
      relacion_referencia: datos.referencias[0]?.detalle_referencia?.relacion,
      direccion_referencia: datos.referencias[0]?.detalle_referencia?.direccion,
      ciudad_referencia: datos.referencias[0]?.detalle_referencia?.ciudad,

      // Datos completos para uso interno
      datos_completos: datos
    };
  }
};
