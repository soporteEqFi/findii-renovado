import { FieldDefinition, SchemaByEntity } from '../types/fieldDefinition';
import { buildApiUrl, API_CONFIG } from '../config/constants';

const authHeaders = (empresaId?: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  ...(empresaId ? { 'X-Empresa-Id': empresaId } : {}),
});

const getEmpresaId = (): string => {
  return localStorage.getItem('empresa_id') || '1';
};

export const fieldConfigService = {
  // Listar definiciones agrupadas por entidad/columna
  async listGrouped(): Promise<SchemaByEntity> {
    const empresaId = getEmpresaId();
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_ESQUEMA);
    const res = await fetch(`${url}?empresa_id=${encodeURIComponent(empresaId)}`, { 
      headers: authHeaders(empresaId) 
    });
    if (!res.ok) throw new Error('Error cargando esquema agrupado');
    const json = await res.json();
    return json.data as SchemaByEntity;
  },

  // Listar definiciones por entidad y columna JSON
  async listBy(entity: string, jsonColumn: string): Promise<FieldDefinition[]> {
    const empresaId = getEmpresaId();
    const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.GET_ESQUEMA}/${entity}/${jsonColumn}`);
    const res = await fetch(`${url}?empresa_id=${encodeURIComponent(empresaId)}`, { 
      headers: authHeaders(empresaId) 
    });
    if (!res.ok) throw new Error('Error cargando definiciones');
    const json = await res.json();
    return (json.data || []) as FieldDefinition[];
  },

  // Upsert (crear/actualizar en lote) definiciones para una entidad/columna
  async upsert(entity: string, jsonColumn: string, items: FieldDefinition[]): Promise<void> {
    const empresaId = getEmpresaId();
    const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.GET_ESQUEMA}/${entity}/${jsonColumn}`);
    const fullUrl = `${url}?empresa_id=${encodeURIComponent(empresaId)}`;
    
    const bodyItems = items.map(({ key, type, required, description, default_value, list_values }) => ({
      key, type, required, description, default_value, list_values
    }));

    // Intento con la URL construida
    let res = await fetch(fullUrl, {
      method: 'POST',
      headers: authHeaders(empresaId),
      body: JSON.stringify({ items: bodyItems })
    });

    // Si falla, intentar con la URL base del API
    if (!res.ok) {
      const altUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ESQUEMA}/${entity}/${jsonColumn}?empresa_id=${encodeURIComponent(empresaId)}`;
      res = await fetch(altUrl, {
        method: 'POST',
        headers: authHeaders(empresaId),
        body: JSON.stringify({ items: bodyItems })
      });
    }

    if (!res.ok) {
      const error = await res.text().catch(() => 'Error desconocido');
      throw new Error(`Error guardando definiciones: ${res.status} - ${error}`);
    }
  },

  // Eliminar definiciones. Si se pasa key, elimina solo esa; si no, todas las de la columna
  async delete(entity: string, jsonColumn: string, key?: string): Promise<void> {
    const empresaId = getEmpresaId();
    const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.GET_ESQUEMA}/${entity}/${jsonColumn}`);
    const params = new URLSearchParams({ empresa_id: empresaId });
    if (key) params.set('key', key);
    
    const fullUrl = `${url}?${params.toString()}`;
    const res = await fetch(fullUrl, { 
      method: 'DELETE', 
      headers: authHeaders(empresaId) 
    });
    
    if (!res.ok) {
      const error = await res.text().catch(() => 'Error desconocido');
      throw new Error(`Error eliminando definición(es): ${res.status} - ${error}`);
    }
  },
};
