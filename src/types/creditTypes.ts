export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  customRule?: string;
}

export interface CreditTypeField {
//   id: string;
  name: string;
  displayName: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  order: number;
  isRequired: boolean;
  validation: FieldValidation;
  options?: string[]; // Para campos tipo select
  defaultValue?: string | number | boolean;
}

export interface CreditType {
//   id: string;
  name: string; // Nombre interno
  displayName: string; // Nombre para mostrar
  description?: string;
  fields: CreditTypeField[];
  isActive: boolean;
} 