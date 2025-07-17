export interface Customer {
  id?: number;
  id_solicitante?: number;
  solicitante_id?: number;
  
  // Campos con nombres alternativos
  nombre?: string;
  nombre_completo: string;
  correo?: string;
  correo_electronico: string;
  direccion?: string;
  direccion_residencia: string;
  tipo_de_contrato?: string;
  tipo_contrato: string;

  // Información Personal
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento: string;
  numero_celular: string;
  estado_civil: string;
  personas_a_cargo: string;
  nivel_estudio: string;
  profesion: string;

  // Información de Ubicación
  tipo_vivienda: string;
  barrio: string;
  departamento: string;
  estrato: number | string;
  ciudad_gestion: string;

  // Información Financiera
  banco: string;
  tipo_credito: string;
  valor_inmueble: number | string;
  cuota_inicial: number | string;
  porcentaje_financiar: number | string;
  total_egresos: number | string;
  total_activos: number | string;
  total_pasivos: number | string;
  plazo_meses: number | string;
  ingresos: number | string;

  // Información Laboral
  actividad_economica: string;
  empresa_labora: string;
  fecha_vinculacion: string;
  direccion_empresa: string;
  telefono_empresa: string;
  cargo_actual: string;

  // Información Adicional
  segundo_titular: string;
  observacion: string;

  // Meta Información
  created_at?: string;
  archivos?: string;
  asesor_usuario?: string;
  estado?: string;
  informacion_producto?: string;
}