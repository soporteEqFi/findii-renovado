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
    // ✅ CORRECTO SEGÚN GUÍA: GET /json/schema/{entity}/{json_field} para VER campos configurados
    const url = buildApiUrl(`/json/schema/${entity}/${jsonColumn}`);

    const res = await fetch(`${url}?empresa_id=${encodeURIComponent(empresaId)}`, {
      method: 'GET', // ✅ Explícitamente GET
      headers: authHeaders(empresaId)
    });


    if (!res.ok) throw new Error(`Error cargando definiciones: ${res.status} ${res.statusText}`);
    const json = await res.json();
    return (json.data || []) as FieldDefinition[];
  },

    // Upsert (crear/actualizar en lote) definiciones para una entidad/columna
  async upsert(entity: string, jsonColumn: string, items: FieldDefinition[]): Promise<void> {
    const empresaId = getEmpresaId();

    // ✅ CORRECTO SEGÚN GUÍA: POST /json/definitions/{entity}/{json_field} para CONFIGURAR campos
    const url = buildApiUrl(`/json/definitions/${entity}/${jsonColumn}`);
    const fullUrl = `${url}?empresa_id=${encodeURIComponent(empresaId)}`;

    // ✅ FORMATO SEGÚN GUÍA: { "definitions": [...] }
    // Eliminar campos que la API no reconoce (como isActive, arrayOptions)
    const bodyItems = items.map(({ key, type, required, description, default_value, order_index, list_values }) => ({
      key,
      type,
      required: required ?? false,
      description,
      default_value,
      order_index,
      list_values
    }));


    const requestBody = {
      definitions: bodyItems // ✅ Formato según guía
    };

    console.log('📤 EXACTAMENTE LO QUE SE ENVÍA A LA API:');
    console.log('URL:', fullUrl);
    console.log('MÉTODO:', 'POST');
    console.log('HEADERS:', authHeaders(empresaId));
    console.log('BODY (JSON):', JSON.stringify(requestBody, null, 2));

    // Intento con la URL correcta según guía
    const res = await fetch(fullUrl, {
      method: 'POST', // ✅ POST para crear/actualizar definiciones
      headers: authHeaders(empresaId),
      body: JSON.stringify({
        definitions: bodyItems // ✅ Formato según guía
      })
    });


    if (!res.ok) {
      const error = await res.text().catch(() => 'Error desconocido');
      throw new Error(`Error guardando definiciones: ${res.status} - ${error}`);
    }

    },



  // Actualizar un campo individual (para order_index, description, etc.)
  async updateField(
    fieldId: string,
    updates: Partial<FieldDefinition>
  ): Promise<FieldDefinition> {
    const empresaId = getEmpresaId();

    // ✅ CORRECTO SEGÚN GUÍA: PATCH /json/definitions/{definition_id} para actualizar campo individual
    const url = buildApiUrl(`/json/definitions/${fieldId}`);
    const fullUrl = `${url}?empresa_id=${encodeURIComponent(empresaId)}`;

    // Limpiar campos vacíos antes de enviar y excluir 'key' ya que está en la URL
    const cleanedUpdates: Partial<FieldDefinition> = {};
    Object.entries(updates).forEach(([key, value]) => {
      // Excluir 'key' ya que está identificado por definition_id en la URL
      if (key === 'key') {
        return;
      }

      // Si el valor es string vacío, convertirlo a null
      if (value === '') {
        cleanedUpdates[key as keyof FieldDefinition] = null;
      }
      // Si el valor es null o undefined, no incluirlo
      else if (value !== null && value !== undefined) {
        cleanedUpdates[key as keyof FieldDefinition] = value;
      }
    });

    console.log('📤 EXACTAMENTE LO QUE SE ENVÍA A LA API:');
    console.log('URL:', fullUrl);
    console.log('MÉTODO:', 'PATCH');
    console.log('HEADERS:', authHeaders(empresaId));
    console.log('BODY (JSON):', JSON.stringify(cleanedUpdates, null, 2));

    const res = await fetch(fullUrl, {
      method: 'PATCH',
      headers: authHeaders(empresaId),
      body: JSON.stringify(cleanedUpdates)
    });

    if (!res.ok) {
      const error = await res.text().catch(() => 'Error desconocido');
      throw new Error(`Error actualizando campo: ${res.status} - ${error}`);
    }

    const result = await res.json();
    return result.data || result;
  },

  // Eliminar definiciones. Si se pasa key, elimina solo esa; si no, todas las de la columna
  async delete(entity: string, jsonColumn: string, key?: string): Promise<void> {
    const empresaId = getEmpresaId();

    // ✅ CORRECTO SEGÚN GUÍA: DELETE /json/definitions/{entity}/{json_field}[/{key}] para ELIMINAR definiciones
    let url: string;
    if (key) {
      // Eliminar campo específico: DELETE /json/definitions/{entity}/{json_field}/{key}
      url = buildApiUrl(`/json/definitions/${entity}/${jsonColumn}/${key}`);
    } else {
      // Eliminar todas las definiciones: DELETE /json/definitions/{entity}/{json_field}
      url = buildApiUrl(`/json/definitions/${entity}/${jsonColumn}`);
    }

    const params = new URLSearchParams({ empresa_id: empresaId });
    const fullUrl = `${url}?${params.toString()}`;

    console.log(`🗑️ Eliminando definiciones con DELETE: ${fullUrl}`);
    if (key) {
      console.log(`🔑 Eliminando campo específico: ${key}`);
    } else {
      console.log(`🗂️ Eliminando todas las definiciones de ${entity}/${jsonColumn}`);
    }

    const res = await fetch(fullUrl, {
      method: 'DELETE',
      headers: authHeaders(empresaId)
    });

    console.log(`📡 Respuesta eliminación: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const error = await res.text().catch(() => 'Error desconocido');
      throw new Error(`Error eliminando definición(es): ${res.status} - ${error}`);
    }

    console.log(`✅ Definiciones eliminadas exitosamente`);
  },
};
