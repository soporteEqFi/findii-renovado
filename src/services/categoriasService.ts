import { API_CONFIG } from '../config/constants';
import {
  Categoria,
  CategoriaListItem,
  CreateCategoriaRequest,
  UpdateCategoriaRequest
} from '../types/categoria';

class CategoriasService {
  private baseUrl = API_CONFIG.BASE_URL;
  private empresaId = 1; // Por defecto, se puede hacer configurable

  /**
   * Obtiene todas las categorías disponibles
   * GET /configuraciones/categorias?empresa_id=1
   */
  async getCategorias(): Promise<CategoriaListItem[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/configuraciones/categorias?empresa_id=${this.empresaId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      // Manejar la estructura específica del servidor: { data: { categorias: [...], total: 5 }, message: "...", ok: true }
      if (data && data.ok && data.data && Array.isArray(data.data.categorias)) {
        // Convertir el array de strings a objetos CategoriaListItem
        const categoriasList: CategoriaListItem[] = data.data.categorias.map((categoria: string) => ({
          categoria,
          descripcion: `Configuración para ${categoria}`,
          activo: true
        }));
        return categoriasList;
      }

      // Fallback para otros formatos
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          return data;
        } else if (Array.isArray(data.data)) {
          return data.data;
        } else if (Array.isArray(data.categorias)) {
          return data.categorias;
        } else if (Array.isArray(data.results)) {
          return data.results;
        }
      }

      // Si no es un array, devolver array vacío
      console.warn('Formato de respuesta inesperado, devolviendo array vacío');
      return [];
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      throw error;
    }
  }

  /**
   * Obtiene una categoría específica
   * GET /configuraciones/{categoria}?empresa_id=1
   */
  async getCategoria(categoria: string): Promise<Categoria> {
    try {
      const response = await fetch(
        `${this.baseUrl}/configuraciones/${categoria}?empresa_id=${this.empresaId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Respuesta para categoría ${categoria}:`, data);

      // Manejar diferentes formatos de respuesta
      if (data && data.ok && data.data) {
        // Si la respuesta tiene la estructura { ok: true, data: {...} }
        return {
          categoria,
          configuracion: data.data.configuracion || data.data,
          descripcion: data.data.descripcion || `Configuración para ${categoria}`,
          activo: data.data.activo !== undefined ? data.data.activo : true,
          empresa_id: this.empresaId,
          ...data.data
        };
      } else if (data && typeof data === 'object') {
        // Si la respuesta es directamente el objeto de configuración
        // Filtrar campos del sistema para evitar que aparezcan en el editor
        const systemFields = ['total', 'id', 'created_at', 'updated_at', 'empresa_id'];
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([key]) => !systemFields.includes(key))
        );

        return {
          categoria,
          configuracion: cleanData.configuracion || cleanData,
          descripcion: (cleanData.descripcion as string) || `Configuración para ${categoria}`,
          activo: (cleanData.activo as boolean) !== undefined ? (cleanData.activo as boolean) : true,
          empresa_id: this.empresaId,
          ...cleanData
        };
      }

      // Si no se puede parsear, crear una estructura básica
      return {
        categoria,
        configuracion: data || [],
        descripcion: `Configuración para ${categoria}`,
        activo: true,
        empresa_id: this.empresaId
      };
    } catch (error) {
      console.error(`Error obteniendo categoría ${categoria}:`, error);
      throw error;
    }
  }

  /**
   * Crea una nueva categoría
   * POST /configuraciones/{categoria}?empresa_id=1
   */
  async createCategoria(
    categoria: string,
    data: CreateCategoriaRequest
  ): Promise<Categoria> {
    try {
      // La API espera la estructura completa con configuracion y descripcion
      const payload = {
        configuracion: data.configuracion,
        descripcion: data.descripcion
      };

      console.log('📤 Enviando payload para crear categoría:', payload);

      const response = await fetch(
        `${this.baseUrl}/configuraciones/${categoria}?empresa_id=${this.empresaId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error creando categoría ${categoria}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza una categoría existente o crea nueva si no existe
   * PUT /configuraciones/{categoria}?empresa_id=1
   */
  async updateCategoria(
    categoria: string,
    data: UpdateCategoriaRequest
  ): Promise<Categoria> {
    try {
      // La API espera la estructura completa con configuracion y descripcion
      const payload = {
        configuracion: data.configuracion,
        descripcion: data.descripcion
      };

      console.log('📤 Enviando payload para actualizar categoría:', payload);

      const response = await fetch(
        `${this.baseUrl}/configuraciones/${categoria}?empresa_id=${this.empresaId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error actualizando categoría ${categoria}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una categoría (marca como inactiva)
   * DELETE /configuraciones/{categoria}?empresa_id=1
   */
  async deleteCategoria(categoria: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/configuraciones/${categoria}?empresa_id=${this.empresaId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error eliminando categoría ${categoria}:`, error);
      throw error;
    }
  }

  /**
   * Valida si una categoría existe
   */
  async categoriaExists(categoria: string): Promise<boolean> {
    try {
      await this.getCategoria(categoria);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida el formato de configuración antes de enviar
   */
  validateConfiguracion(configuracion: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!configuracion) {
      errors.push('La configuración no puede estar vacía');
    }

    if (Array.isArray(configuracion)) {
      if (configuracion.length === 0) {
        errors.push('La configuración no puede ser un array vacío');
      }
    } else if (typeof configuracion === 'object' && configuracion !== null) {
      if (Object.keys(configuracion).length === 0) {
        errors.push('La configuración no puede ser un objeto vacío');
      }
    } else {
      errors.push('La configuración debe ser un array o un objeto');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convierte configuración a formato de array simple si es posible
   */
  convertToSimpleArray(configuracion: any): string[] {
    if (Array.isArray(configuracion)) {
      // Si ya es un array de strings, devolverlo tal como está
      if (configuracion.every(item => typeof item === 'string')) {
        return configuracion;
      }
      // Si es un array de objetos, extraer valores relevantes
      if (configuracion.every(item => typeof item === 'object' && item !== null)) {
        return configuracion.map(item => {
          // Si el objeto tiene una propiedad 'value', usarla
          if (item.value !== undefined) {
            return String(item.value);
          }
          // Si el objeto tiene una propiedad 'name', usarla
          if (item.name !== undefined) {
            return String(item.name);
          }
          // Si el objeto tiene una propiedad 'label', usarla
          if (item.label !== undefined) {
            return String(item.label);
          }
          // Si el objeto tiene una propiedad 'categoria', usarla (para casos como el servidor)
          if (item.categoria !== undefined) {
            return String(item.categoria);
          }
          // Si el objeto tiene una propiedad 'configuracion' (array de valores), extraer esos valores
          if (item.configuracion && Array.isArray(item.configuracion)) {
            return item.configuracion.join(', ');
          }
          // Si no, convertir el primer valor del objeto que no sea del sistema
          const systemFields = ['total', 'id', 'created_at', 'updated_at', 'empresa_id', 'descripcion'];
          const values = Object.entries(item)
            .filter(([key]) => !systemFields.includes(key))
            .map(([, value]) => value);
          return values.length > 0 ? String(values[0]) : '';
        });
      }
      // Para otros tipos de array, convertir cada elemento
      return configuracion.map(item => String(item));
    }

    if (typeof configuracion === 'object' && configuracion !== null) {
      // Si es un objeto con configuración, extraer los valores relevantes
      if (configuracion.configuracion && Array.isArray(configuracion.configuracion)) {
        return configuracion.configuracion.map((item: any) => String(item));
      }
      // Si no, convertir valores que no sean del sistema
      const systemFields = ['total', 'id', 'created_at', 'updated_at', 'empresa_id', 'descripcion'];
      return Object.entries(configuracion)
        .filter(([key]) => !systemFields.includes(key))
        .map(([, value]) => String(value));
    }

    return [String(configuracion)];
  }

}

export const categoriasService = new CategoriasService();
