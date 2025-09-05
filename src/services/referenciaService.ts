import { API_CONFIG, buildApiUrl } from '../config/constants';

export interface ReferenciaDetalle {
  [key: string]: any;
}

export interface ReferenciaDTO {
  id?: number; // referencia_id en backend
  solicitante_id?: number;
  tipo_referencia?: string;
  detalle_referencia?: ReferenciaDetalle;
}

export interface ApiOk<T = any> {
  ok: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const defaultHeaders = (empresaId: string | number, userId?: string | number): HeadersInit => ({
  'Content-Type': 'application/json',
  'X-Empresa-Id': String(empresaId),
  ...(userId ? { 'X-User-Id': String(userId) } : {}),
  // Authorization is handled globally in other services via localStorage when needed
});

export const referenciaService = {
  async getReferenciasPorSolicitante(
    solicitanteId: number,
    empresaId: number | string = localStorage.getItem('empresa_id') || '1',
    userId?: number | string
  ): Promise<ApiOk<{ tipo_referencia?: any[]; detalle_referencia?: { referencias?: any[] } }>> {
    const base = API_CONFIG.ENDPOINTS.REFERENCIAS_POR_SOLICITANTE;
    const url = buildApiUrl(`${base}?solicitante_id=${encodeURIComponent(String(solicitanteId))}`);
    console.debug('[referenciaService.get] URL:', url, 'empresaId:', empresaId, 'userId:', userId);
    const resp = await fetch(url, {
      method: 'GET',
      headers: defaultHeaders(empresaId, userId || localStorage.getItem('user_id') || localStorage.getItem('cedula') || undefined),
    });
    console.debug('[referenciaService.get] status:', resp.status);
    if (resp.status === 404) {
      return { ok: false, error: 'No hay referencias para este solicitante' };
    }
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Error obteniendo referencias: ${resp.status} ${errorText}`);
    }
    const json = await resp.json();
    console.debug('[referenciaService.get] response:', json);
    return json;
  },
  async addReferencia(
    solicitanteId: number,
    referencia: Omit<ReferenciaDTO, 'id' | 'solicitante_id'>,
    empresaId: number | string = localStorage.getItem('empresa_id') || '1',
    userId?: number | string
  ): Promise<ApiOk<{ id: number }>> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REFERENCIAS_ADD);
    // El backend espera un objeto plano "referencia" sin anidar detalle_referencia
    const { id, solicitante_id, detalle_referencia, ...rest } = (referencia || {}) as any;
    const flatDetalle = (detalle_referencia && typeof detalle_referencia === 'object') ? detalle_referencia : {};
    // Excluir posibles ids residuales
    const { referencia_id, id_referencia, ...restNoIds } = rest || {};
    const referenciaPayload = { ...restNoIds, ...flatDetalle };
    const body = {
      solicitante_id: solicitanteId,
      referencia: referenciaPayload,
    };
    console.debug('[referenciaService.add] URL:', url);
    console.debug('[referenciaService.add] body:', body);
    const resp = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders(empresaId, userId || localStorage.getItem('user_id') || localStorage.getItem('cedula') || undefined),
      body: JSON.stringify(body),
    });
    console.debug('[referenciaService.add] status:', resp.status);
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Error agregando referencia: ${resp.status} ${errorText}`);
    }
    const json = await resp.json();
    console.debug('[referenciaService.add] response:', json);
    return json;
  },

  async updateReferencia(
    solicitanteId: number,
    referenciaId: number,
    updates: Partial<ReferenciaDTO>,
    empresaId: number | string = localStorage.getItem('empresa_id') || '1',
    userId?: number | string
  ): Promise<ApiOk> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REFERENCIAS_UPDATE);
    // API espera: { solicitante_id, referencia_id, updates: {...} } con campos planos
    const { id, solicitante_id, detalle_referencia, ...restUpdates } = (updates || {}) as any;
    const flatDetalle = (detalle_referencia && typeof detalle_referencia === 'object') ? detalle_referencia : {};
    const { referencia_id, id_referencia, id_tipo_referencia, ...restNoIds } = restUpdates || {};
    const effectiveId = referenciaId === 0 ? 1 : referenciaId;
    const updatesPayload = { referencia_id: effectiveId, ...restNoIds, ...flatDetalle };
    const body: any = {
      solicitante_id: solicitanteId,
      referencia_id: effectiveId,
      updates: updatesPayload,
    };
    console.debug('[referenciaService.update] URL:', url);
    console.debug('[referenciaService.update] body:', body);
    const resp = await fetch(url, {
      method: 'PATCH',
      headers: defaultHeaders(empresaId, userId || localStorage.getItem('user_id') || localStorage.getItem('cedula') || undefined),
      body: JSON.stringify(body),
    });
    console.debug('[referenciaService.update] status:', resp.status);
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Error actualizando referencia: ${resp.status} ${errorText}`);
    }
    const json = await resp.json();
    console.debug('[referenciaService.update] response:', json);
    return json;
  },

  async deleteReferencia(
    solicitanteId: number,
    referenciaId: number,
    empresaId: number | string = localStorage.getItem('empresa_id') || '1',
    userId?: number | string
  ): Promise<ApiOk> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REFERENCIAS_DELETE);
    // API espera: { solicitante_id, referencia_id }
    const effectiveId = referenciaId === 0 ? 1 : referenciaId;
    const body: any = {
      solicitante_id: solicitanteId,
      referencia_id: effectiveId,
    };
    console.debug('[referenciaService.delete] URL:', url);
    console.debug('[referenciaService.delete] body:', body);
    const resp = await fetch(url, {
      method: 'DELETE',
      headers: defaultHeaders(empresaId, userId || localStorage.getItem('user_id') || localStorage.getItem('cedula') || undefined),
      body: JSON.stringify(body),
    });
    console.debug('[referenciaService.delete] status:', resp.status);
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Error eliminando referencia: ${resp.status} ${errorText}`);
    }
    const json = await resp.json();
    console.debug('[referenciaService.delete] response:', json);
    return json;
  },
};
