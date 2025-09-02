export interface Customer {
  // Identificadores
  id?: number | string;
  id_solicitante?: number | string;
  solicitante_id?: number | string;
  id_solicitud?: number | string; // ID de la solicitud para actualizar estado

  // Información Básica
  nombre?: string;
  nombre_completo: string;
  correo?: string;
  correo_electronico: string;

  // Información de Contacto
  direccion?: string;
  direccion_residencia: string;
  numero_celular: string;
  correo_personal?: string;
  correo_corporativo?: string;

  // Documentación
  tipo_documento: string;
  numero_documento: string;

  // Información Personal
  fecha_nacimiento: Date;
  estado_civil: string;
  personas_a_cargo: string;
  nivel_estudio: string;
  profesion: string;

  // Ubicación
  tipo_vivienda: string;
  barrio: string;
  departamento: string;
  estrato: number | string;
  ciudad_gestion: string;

  // Información Financiera
  banco: string;
  tipo_credito: string;
  tipo_de_credito?: string;
  valor_inmueble: number | string;
  cuota_inicial: number | string;
  porcentaje_financiar: number | string;
  total_egresos: number | string;
  egresos?: number | string;
  total_activos: number | string;
  total_pasivos: number | string;
  plazo_meses: number | string;
  ingresos: number | string;

  // Información Laboral
  tipo_contrato: string;
  tipo_de_contrato?: string;
  actividad_economica: string;
  empresa_labora: string;
  fecha_vinculacion: string;
  direccion_empresa: string;
  telefono_empresa: string;
  cargo_actual: string;

  // Información Adicional
  segundo_titular: string;
  info_segundo_titular?: string;
  observacion: string;

  // Metadatos
  created_at?: string;
  archivos?: string;
  asesor_usuario?: string;
  estado?: string;
  informacion_producto?: string;
}