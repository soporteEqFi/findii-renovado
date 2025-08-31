import { API_BASE_URL } from '../config/constants';

export interface EstadisticasGenerales {
  total_solicitantes: number;
  total_solicitudes: number;
  solicitudes_por_estado: Record<string, number>;
  solicitudes_por_banco: Record<string, number>;
  solicitudes_por_ciudad: Record<string, number>;
  total_documentos: number;
}

export interface EstadisticasRendimiento {
  periodo_dias: number;
  solicitudes_por_dia: Record<string, number>;
  solicitudes_completadas: number;
  solicitudes_pendientes: number;
  productividad_usuarios: Record<string, number>;
}

export interface EstadisticasFinancieras {
  rangos_ingresos: Record<string, number>;
  tipos_actividad_economica: Record<string, number>;
  referencias_promedio: number;
  documentos_promedio: number;
  total_referencias: number;
  total_documentos: number;
}

export interface EstadisticasCompletas {
  generales: EstadisticasGenerales;
  rendimiento: EstadisticasRendimiento;
  financieras: EstadisticasFinancieras;
}

export interface EstadisticasResponse<T> {
  ok: boolean;
  data: {
    tipo: string;
    empresa_id: number;
    usuario_rol: string;
    periodo_dias?: number;
    estadisticas: T;
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const getEmpresaId = (): string => {
  return localStorage.getItem('empresa_id') || '1';
};

export const getEstadisticasGenerales = async (): Promise<EstadisticasResponse<EstadisticasGenerales>> => {
  const empresaId = getEmpresaId();
  const response = await fetch(`${API_BASE_URL}/estadisticas/generales?empresa_id=${empresaId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas generales');
  }

  return response.json();
};

export const getEstadisticasRendimiento = async (dias: number = 30): Promise<EstadisticasResponse<EstadisticasRendimiento>> => {
  const empresaId = getEmpresaId();
  const response = await fetch(`${API_BASE_URL}/estadisticas/rendimiento?empresa_id=${empresaId}&dias=${dias}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas de rendimiento');
  }

  return response.json();
};

export const getEstadisticasFinancieras = async (): Promise<EstadisticasResponse<EstadisticasFinancieras>> => {
  const empresaId = getEmpresaId();
  const response = await fetch(`${API_BASE_URL}/estadisticas/financieras?empresa_id=${empresaId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas financieras');
  }

  return response.json();
};

export const getEstadisticasCompletas = async (dias: number = 30): Promise<EstadisticasResponse<EstadisticasCompletas>> => {
  const empresaId = getEmpresaId();
  const response = await fetch(`${API_BASE_URL}/estadisticas/completas?empresa_id=${empresaId}&dias=${dias}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas completas');
  }

  return response.json();
};
