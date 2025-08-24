// Tipos para esquemas dinámicos
export interface EsquemaCampo {
  key: string;
  type: 'string' | 'integer' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  list_values?:
    | string[] // Compatibilidad: array directo para strings
    | { enum: string[] } // Principal: para arrays con opciones de selección
    | { object_structure: EsquemaCampo[] } // Principal: para objetos con estructura
    | null;
  description?: string;
  default_value?: any;
  order_index?: number; // Orden de aparición del campo (1, 2, 3, etc.)
  conditional_on?: {
    field: string; // Nombre del campo que actúa como trigger
    value: string; // Valor que debe tener para mostrar este campo
  };
}

export interface EsquemaResponse {
  ok: boolean;
  data: EsquemaCampo[];
  error?: string;
}

export interface JsonUpdateResponse {
  ok: boolean;
  data: any;
  error?: string;
}

// Tipos para datos base de entidades
export interface SolicitanteBase {
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string;
  tipo_identificacion: string;
  numero_documento: string;
  fecha_nacimiento: string;
  genero: string;
  correo: string;
  created_by_user_id?: number;
  empresa_id?: number;
}

export interface UbicacionBase {
  solicitante_id: number;
  ciudad_residencia: string;
  departamento_residencia: string;
  empresa_id?: number;
}

export interface ActividadEconomicaBase {
  solicitante_id: number;
  tipo_actividad: string;
  sector_economico: string;
  empresa_id?: number;
}

export interface InformacionFinancieraBase {
  solicitante_id: number;
  total_ingresos_mensuales: number;
  total_egresos_mensuales: number;
  total_activos: number;
  total_pasivos: number;
  empresa_id?: number;
}

export interface ReferenciaBase {
  solicitante_id: number;
  tipo_referencia: string;
  empresa_id?: number;
}

export interface SolicitudBase {
  solicitante_id: number;
  created_by_user_id: number;
  assigned_to_user_id: number;
  estado: string;
  empresa_id?: number;
}

// Tipos para respuestas de creación
export interface RegistroCreado {
  id: number;
  [key: string]: any;
}

// Tipos para configuración de esquemas
export interface EsquemaConfig {
  entidad: string;
  campoJson: string;
  empresaId?: number;
}

export interface EsquemasState {
  [key: string]: {
    esquema: EsquemaCampo[];
    loading: boolean;
    error: string | null;
  };
}
