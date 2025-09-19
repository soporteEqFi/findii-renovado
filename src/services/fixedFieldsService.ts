// Servicio para identificar campos fijos que aparecen en el formulario pero no están en las entidades de BD
export interface FixedField {
  key: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
  required?: boolean;
  list_values?: any;
  default_value?: any;
}

export class FixedFieldsService {
  // Solo campos que realmente son fijos y no están en las entidades de BD
  private static FIXED_FIELDS: FixedField[] = [
    // =======================
    // Sección: Solicitante
    // =======================
    // Campos que aparecen en el formulario pero no están en ninguna entidad específica
    {
      key: 'nombres',
      description: 'Nombres',
      type: 'string',
      required: true
    },
    {
      key: 'primer_apellido',
      description: 'Primer apellido',
      type: 'string',
      required: true
    },
    {
      key: 'segundo_apellido',
      description: 'Segundo apellido',
      type: 'string'
    },
    {
      key: 'tipo_identificacion',
      description: 'Tipo de identificación',
      type: 'array',
      required: true,
      list_values: {
        enum: ['CC', 'CE', 'TI', 'PP', 'NIT']
      }
    },
    {
      key: 'numero_documento',
      description: 'Número de documento',
      type: 'string',
      required: true
    },
    {
      key: 'fecha_nacimiento',
      description: 'Fecha de nacimiento',
      type: 'date',
      required: true
    },
    {
      key: 'genero',
      description: 'Género',
      type: 'array',
      required: true,
      list_values: {
        enum: ['M', 'F', 'O']
      }
    },
    {
      key: 'correo',
      description: 'Correo electrónico',
      type: 'string',
      required: true
    },

    // =======================
    // Sección: Ubicación
    // =======================
    // Estos campos son usados en la sección de Ubicación del formulario
    // y se agregan aquí para permitir reordenarlos desde "Campos Fijos".
    // El orden personalizado se aplicará cuando se renderice la entidad "ubicacion".
    {
      key: 'departamento_residencia',
      description: 'Departamento',
      type: 'string',
      required: true
    },
    {
      key: 'ciudad_residencia',
      description: 'Ciudad',
      type: 'string',
      required: true
    },
    {
      key: 'direccion_residencia',
      description: 'Dirección principal de residencia',
      type: 'string',
      required: true
    },
    {
      key: 'tipo_vivienda',
      description: 'Tipo de vivienda',
      type: 'string',
      required: false
    },
    {
      key: 'preferencia_correspondencia',
      description: 'Preferencia de correspondencia',
      type: 'string',
      required: false
    }
  ];

  // Clave para localStorage
  private static readonly STORAGE_KEY = 'fixed_fields_order';

  /**
   * Obtiene todos los campos fijos con orden personalizado
   */
  static getFixedFields(): FixedField[] {
    const savedOrder = this.getSavedOrder();
    if (savedOrder.length > 0) {
      return this.applyCustomOrder(savedOrder);
    }
    return this.FIXED_FIELDS;
  }

  /**
   * Obtiene un campo fijo específico por su key
   */
  static getFixedField(key: string): FixedField | null {
    return this.FIXED_FIELDS.find(field => field.key === key) || null;
  }

  /**
   * Verifica si un campo es un campo fijo
   */
  static isFixedField(fieldKey: string): boolean {
    return this.FIXED_FIELDS.some(field => field.key === fieldKey);
  }

  /**
   * Guarda el orden personalizado de los campos fijos
   */
  static saveFieldsOrder(orderedKeys: string[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orderedKeys));
    } catch (error) {
      console.error('Error guardando orden de campos fijos:', error);
    }
  }

  /**
   * Obtiene el orden guardado desde localStorage
   */
  private static getSavedOrder(): string[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error cargando orden de campos fijos:', error);
      return [];
    }
  }

  /**
   * Aplica el orden personalizado a los campos
   */
  private static applyCustomOrder(orderedKeys: string[]): FixedField[] {
    const fieldsMap = new Map(this.FIXED_FIELDS.map(field => [field.key, field]));
    const orderedFields: FixedField[] = [];
    
    // Agregar campos en el orden guardado
    orderedKeys.forEach(key => {
      const field = fieldsMap.get(key);
      if (field) {
        orderedFields.push(field);
        fieldsMap.delete(key);
      }
    });
    
    // Agregar campos restantes al final
    fieldsMap.forEach(field => orderedFields.push(field));
    
    return orderedFields;
  }

  /**
   * Reordena los campos fijos
   */
  static reorderFields(newOrder: string[]): void {
    this.saveFieldsOrder(newOrder);
  }

  /**
   * Obtiene estadísticas de campos fijos
   */
  static getFixedFieldsStats() {
    const total = this.FIXED_FIELDS.length;
    const required = this.FIXED_FIELDS.filter(f => f.required).length;
    const byType = {
      string: this.FIXED_FIELDS.filter(f => f.type === 'string').length,
      number: this.FIXED_FIELDS.filter(f => f.type === 'number').length,
      boolean: this.FIXED_FIELDS.filter(f => f.type === 'boolean').length,
      date: this.FIXED_FIELDS.filter(f => f.type === 'date').length,
      array: this.FIXED_FIELDS.filter(f => f.type === 'array').length
    };

    return {
      total,
      required,
      optional: total - required,
      byType
    };
  }

  /**
   * Convierte los campos fijos a formato FieldDefinition para la configuración
   */
  static convertToFieldDefinitions(): any[] {
    return this.FIXED_FIELDS.map((field, index) => ({
      id: `fixed_${field.key}`,
      key: field.key,
      type: field.type,
      description: field.description,
      required: field.required || false,
      entity: 'campos_fijos',
      json_column: 'info_general',
      order_index: index + 1,
      default_value: field.default_value || null,
      list_values: field.list_values || null,
      conditional_on: undefined
    }));
  }
}
