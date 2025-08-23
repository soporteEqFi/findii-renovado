import { apiPatch, apiGet } from './baseService';
import { FieldDefinition, ConditionalConfig } from '../types/fieldDefinition';
import { API_CONFIG } from '../config/constants';

const getEmpresaId = (): string => {
  return localStorage.getItem('empresa_id') || '1';
};

export const conditionalFieldService = {
  // Actualizar la condición de un campo
  async updateFieldCondition(
    fieldKey: string,
    entity: string,
    jsonColumn: string,
    conditionalConfig: ConditionalConfig | null
  ): Promise<FieldDefinition> {
    try {
      // Primero obtener el esquema para encontrar el ID correcto
      console.log('conditionalFieldService - obteniendo esquema para encontrar ID:', {
        entity,
        jsonColumn,
        fieldKey
      });

      const schemaResponse = await this.getAvailableFields(entity, jsonColumn);

      // El backend devuelve { ok: true, data: [...] }
      const esquema = (schemaResponse as any).data || schemaResponse;

      console.log('conditionalFieldService - esquema obtenido:', {
        schemaResponse,
        esquema,
        isArray: Array.isArray(esquema)
      });

      if (!Array.isArray(esquema)) {
        throw new Error('El esquema no es un array válido');
      }

      const fieldDefinition = esquema.find(field => field.key === fieldKey);

      if (!fieldDefinition || !fieldDefinition.id) {
        throw new Error(`No se encontró la definición del campo ${fieldKey} en el esquema`);
      }

      const empresaId = getEmpresaId();

      console.log('conditionalFieldService - updateFieldCondition:', {
        fieldKey,
        definitionId: fieldDefinition.id,
        empresaId,
        conditionalConfig,
        url: `/json/definitions/${fieldDefinition.id}?empresa_id=${empresaId}`,
        body: { conditional_on: conditionalConfig }
      });

      // Usar apiPatch del baseService que maneja mejor CORS
      const response = await apiPatch<FieldDefinition>(`/json/definitions/${fieldDefinition.id}?empresa_id=${empresaId}`, {
        conditional_on: conditionalConfig
      });

      console.log('conditionalFieldService - response:', response);
      return response;
    } catch (error) {
      console.error('Error updating field condition:', error);

      // Log adicional para ver la respuesta completa del error
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }

      throw error;
    }
  },

    // Obtener todos los campos disponibles para usar como activadores
  async getAvailableFields(entity: string, jsonColumn: string): Promise<any> {
    try {
      const empresaId = getEmpresaId();

      console.log('conditionalFieldService - getAvailableFields:', {
        entity,
        jsonColumn,
        empresaId,
        url: `/json/schema/${entity}/${jsonColumn}?empresa_id=${empresaId}`
      });

      const response = await apiGet<any>(`/json/schema/${entity}/${jsonColumn}?empresa_id=${empresaId}`);
      return response;
    } catch (error) {
      console.error('Error fetching available fields:', error);
      throw error;
    }
  },

    // Validar una condición antes de guardarla
  validateCondition(conditionalConfig: ConditionalConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!conditionalConfig.field) {
      errors.push('El campo activador es requerido');
    }

    if (conditionalConfig.value === undefined || conditionalConfig.value === null || conditionalConfig.value === '') {
      errors.push('El valor esperado es requerido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Evaluar una condición en tiempo real (para preview)
  evaluateCondition(
    conditionalConfig: ConditionalConfig,
    formValues: Record<string, any>
  ): boolean {
    if (!conditionalConfig.field) return true;

    const actualValue = formValues[conditionalConfig.field];
    const expectedValue = conditionalConfig.value;

    // Comparación simple: igual a
    return actualValue === expectedValue;
  }
};
