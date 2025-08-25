import { buildApiUrl } from '../config/constants';

// Interfaz para la respuesta de configuraciones
interface ConfiguracionResponse {
  ok: boolean;
  data: string[];
  error?: string;
}

class ConfiguracionesService {
  /**
   * Obtiene las configuraciones disponibles para una categoría específica
   * @param categoria - 'ciudades', 'bancos', etc.
   * @param empresaId - ID de la empresa
   * @returns Array de strings con las opciones disponibles
   */
  async obtenerConfiguracion(categoria: string, empresaId: number = 1): Promise<string[]> {
    try {
      console.log(`🔧 === CONSULTANDO CONFIGURACIÓN ===`);
      console.log(`📋 Categoría: ${categoria}`);
      console.log(`🏢 Empresa ID: ${empresaId}`);
      console.log(`🌐 URL: /configuraciones/${categoria}?empresa_id=${empresaId}`);

      const response = await fetch(
        buildApiUrl(`/configuraciones/${categoria}?empresa_id=${empresaId}`),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': localStorage.getItem('user_id') || '1',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener configuración: ${response.status}`);
      }

      const result: ConfiguracionResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      console.log(`✅ Configuración obtenida para ${categoria}:`, result.data);
      return result.data || [];
    } catch (error) {
      console.error(`❌ Error al obtener configuración ${categoria}:`, error);
      // Retornar valores por defecto en caso de error
      return this.getValoresPorDefecto(categoria);
    }
  }

  /**
   * Obtiene las ciudades disponibles
   */
  async obtenerCiudades(empresaId: number = 1): Promise<string[]> {
    return this.obtenerConfiguracion('ciudades', empresaId);
  }

  /**
   * Obtiene los bancos disponibles
   */
  async obtenerBancos(empresaId: number = 1): Promise<string[]> {
    return this.obtenerConfiguracion('bancos', empresaId);
  }

  /**
   * Valores por defecto en caso de error en la consulta
   */
  private getValoresPorDefecto(categoria: string): string[] {
    switch (categoria) {
      case 'ciudades':
        return ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'];
      case 'bancos':
        return ['Bancolombia', 'Banco de Bogotá', 'BBVA', 'Lulo bank', 'Nu Bank'];
      default:
        return [];
    }
  }
}

export const configuracionesService = new ConfiguracionesService();
