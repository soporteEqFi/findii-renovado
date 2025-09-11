// Tipos para el sistema de categorías de configuración

export interface CategoriaConfig {
  configuracion: string[] | Record<string, any> | any[];
  descripcion: string;
}

export interface Categoria {
  id?: number;
  categoria: string;
  configuracion: string[] | Record<string, any> | any[];
  descripcion: string;
  activo: boolean;
  empresa_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaListItem {
  categoria: string;
  descripcion: string;
  activo: boolean;
}

export interface CreateCategoriaRequest {
  configuracion: string[] | Record<string, any> | any[];
  descripcion: string;
}

export interface UpdateCategoriaRequest {
  configuracion: string[] | Record<string, any> | any[];
  descripcion: string;
}

// Tipos para diferentes formatos de configuración
export interface SimpleArrayConfig {
  configuracion: string[];
  descripcion: string;
}

export interface ObjectArrayConfig {
  configuracion: Record<string, any>[];
  descripcion: string;
}

export interface ComplexConfig {
  configuracion: any;
  descripcion: string;
}

// Tipo para detectar el formato de configuración
export type ConfigFormat = 'simple_array' | 'complex' | 'unknown';

// Función helper para detectar el formato de configuración
export const detectConfigFormat = (configuracion: any): ConfigFormat => {
  if (Array.isArray(configuracion)) {
    if (configuracion.length === 0) return 'simple_array';

    // Verificar si todos los elementos son strings
    if (configuracion.every(item => typeof item === 'string')) {
      return 'simple_array';
    }

    // Si es un array pero no todos son strings, es complejo
    return 'complex';
  }

  if (typeof configuracion === 'object' && configuracion !== null && !Array.isArray(configuracion)) {
    return 'complex';
  }

  return 'simple_array'; // Por defecto, tratar como array simple
};
