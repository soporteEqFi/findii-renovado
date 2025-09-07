import { API_CONFIG } from '../config/constants';

export interface EstadosResponse {
  ok: boolean;
  data: {
    estados: string[];
    total: number;
  };
  message: string;
}

class EstadosService {
  private baseUrl = API_CONFIG.BASE_URL;

  /**
   * Obtiene los estados disponibles para las solicitudes
   * @param empresaId ID de la empresa
   * @returns Promise con la lista de estados disponibles
   */
  async getEstadosDisponibles(empresaId: number): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ESTADOS_DISPONIBLES}?empresa_id=${empresaId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener estados: ${response.status}`);
      }

      const data: EstadosResponse = await response.json();

      if (!data.ok) {
        throw new Error(data.message || 'Error al obtener estados');
      }

      return data.data.estados;
    } catch (error) {
      console.error('Error al obtener estados disponibles:', error);
      // Retornar estados por defecto en caso de error
      return [
        'Pendiente',
        'En estudio',
        'Pendiente información adicional',
        'Aprobado',
        'Desembolsado',
        'Pagado',
        'Negado',
        'Desistido'
      ];
    }
  }
}

export const estadosService = new EstadosService();
