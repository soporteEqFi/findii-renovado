export type FieldPrimitiveType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'date'
  | 'object'
  | 'array'
  | 'file'; // Nuevo tipo para archivos

export interface ConditionalConfig {
  field: string;
  value: any;
}

export interface FieldDefinition {
  id?: string;
  empresa_id: number | string;
  entity: string; // e.g. 'solicitante', 'actividad_economica', 'informacion_financiera', 'referencias', 'solicitudes', 'ubicacion'
  json_column: string; // e.g. 'info_extra', 'detalle_actividad', 'detalle_financiera', 'detalle_credito', 'detalle_referencia', 'detalle_direccion'
  key: string; // field key inside json_column
  type: FieldPrimitiveType;
  required: boolean;
  isActive?: boolean; // Si el campo está activo o no
  description?: string;
  default_value?: any;
  order_index?: number; // Orden de aparición del campo (1, 2, 3, etc.)
  // list_values holds enum for arrays or object structure for objects
  list_values?:
    | { enum: string[] }  // Para arrays
    | { object_structure: any[] }  // Para objetos
    | { file_config: FileFieldConfig }  // Para campos de archivo
    | any;  // Para compatibilidad con otros tipos
  conditional_on?: ConditionalConfig;
  created_at?: string;
}

// Configuración específica para campos de archivo
export interface FileFieldConfig {
  allowed_types?: string[]; // ['pdf', 'jpg', 'png', 'doc', 'docx']
  max_size_mb?: number; // Tamaño máximo en MB
  multiple?: boolean; // Si permite múltiples archivos
  required_fields?: string[]; // Campos requeridos del archivo (ej: 'nombre', 'descripcion')
  storage_path?: string; // Ruta de almacenamiento personalizada
}

export interface SchemaByEntity {
  [entity: string]: {
    [jsonColumn: string]: FieldDefinition[];
  };
}
