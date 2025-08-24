export type FieldPrimitiveType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

export interface FieldObjectStructureItem {
  key: string;
  type: FieldPrimitiveType;
  required?: boolean;
}

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
  description?: string;
  default_value?: any;
  order_index?: number; // Orden de aparición del campo (1, 2, 3, etc.)
  // list_values holds enum for arrays or object structure for objects
    list_values?:
    | { enum: string[] }  // Para arrays
    | { object_structure: any[] }  // Para objetos
    | any;  // Para compatibilidad con otros tipos
  conditional_on?: ConditionalConfig;
  created_at?: string;
}

export interface SchemaByEntity {
  [entity: string]: {
    [jsonColumn: string]: FieldDefinition[];
  };
}
