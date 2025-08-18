import { buildApiUrl } from '../config/constants';
import { EsquemaCampo } from '../types/esquemas';

/**
 * SERVICIO UNIFICADO PARA CAMPOS DINÁMICOS
 *
 * Este servicio centraliza TODAS las operaciones de campos dinámicos
 * para evitar múltiples llamados y confusión entre servicios.
 *
 * IMPORTANTE: Usar SOLO este servicio para campos dinámicos.
 */

interface ApiResponse {
  ok: boolean;
  data?: any;
  error?: string;
}

// Removido EsquemaCompleto - no existe ruta /schema/{entidad}
// Solo trabajamos con campos dinámicos individuales

class UnifiedCamposDinamicosService {
  private baseUrl: string;
  private empresaId: string;

  // Cache simple y eficiente
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutos (reducido para evitar problemas)

  constructor() {
    this.baseUrl = buildApiUrl('').replace(/\/$/, '');
    this.empresaId = localStorage.getItem('empresa_id') || '1';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Empresa-Id': this.empresaId,
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
    };
  }

  private buildUrl(endpoint: string): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('empresa_id', this.empresaId);
    return url.toString();
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.data as T;
    }
    this.cache.delete(key); // Limpiar cache expirado
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

    /**
   * 📋 OBTENER CAMPOS DINÁMICOS SOLAMENTE
   * NOTA: Solo existe esta ruta para campos dinámicos, no hay /schema/{entidad}
   */
  async obtenerCamposDinamicos(entidad: string, campoJson: string): Promise<EsquemaCampo[]> {
    const cacheKey = `campos_dinamicos_${entidad}_${campoJson}_${this.empresaId}`;

    // Verificar cache
    const cached = this.getCached<EsquemaCampo[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // RUTA CORRECTA según guía: GET /json/schema/{entity}/{json_field}
    const url = this.buildUrl(`/json/schema/${entidad}/${campoJson}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      const campos: EsquemaCampo[] = result.data || [];

      // Guardar en cache
      this.setCache(cacheKey, campos);

      return campos;
    } catch (error) {
      console.error(`Error obteniendo campos dinámicos ${entidad}/${campoJson}:`, error);
      throw error;
    }
  }



    /**
   * 📖 LEER DATOS JSON
   * RUTA: GET /json/{entity}/{record_id}/{json_field}?empresa_id={id}
   */
  async leerDatos(entidad: string, recordId: number, campoJson: string): Promise<Record<string, any>> {
    const url = this.buildUrl(`/json/${entidad}/${recordId}/${campoJson}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      return result.data || {};
    } catch (error) {
      console.error(`Error leyendo datos ${entidad}/${recordId}/${campoJson}:`, error);
      throw error;
    }
  }

    /**
   * 💾 GUARDAR DATOS JSON
   * RUTA: PATCH /json/{entity}/{record_id}/{json_field}?empresa_id={id}&validate={true/false}
   * BODY: { "value": datos } para múltiples campos
   */
  async guardarDatos(
    entidad: string,
    recordId: number,
    campoJson: string,
    datos: Record<string, any>,
    validar: boolean = true
  ): Promise<any> {
    const url = this.buildUrl(`/json/${entidad}/${recordId}/${campoJson}`);
    const urlWithValidate = new URL(url);
    urlWithValidate.searchParams.set('validate', validar.toString());

    try {
      const response = await fetch(urlWithValidate.toString(), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ value: datos })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      return result.data;
    } catch (error) {
      console.error(`Error guardando datos ${entidad}/${recordId}/${campoJson}:`, error);
      throw error;
    }
  }

  /**
   * 💾 GUARDAR UNA SOLA CLAVE
   * RUTA: PATCH /json/{entity}/{record_id}/{json_field}?empresa_id={id}&validate={true/false}
   * BODY: { "path": "clave", "value": valor } para una sola clave
   */
  async guardarClave(
    entidad: string,
    recordId: number,
    campoJson: string,
    clave: string,
    valor: any,
    validar: boolean = true
  ): Promise<any> {
    const url = this.buildUrl(`/json/${entidad}/${recordId}/${campoJson}`);
    const urlWithValidate = new URL(url);
    urlWithValidate.searchParams.set('validate', validar.toString());

    try {
      const response = await fetch(urlWithValidate.toString(), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ path: clave, value: valor })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      return result.data;
    } catch (error) {
      console.error(`Error guardando clave ${entidad}/${recordId}/${campoJson}/${clave}:`, error);
      throw error;
    }
  }

    /**
   * 🗑️ ELIMINAR CLAVE ESPECÍFICA
   * RUTA: DELETE /json/{entity}/{record_id}/{json_field}?empresa_id={id}&path={key}
   */
  async eliminarClave(
    entidad: string,
    recordId: number,
    campoJson: string,
    clave: string
  ): Promise<any> {
    const url = this.buildUrl(`/json/${entidad}/${recordId}/${campoJson}`);
    const urlWithPath = new URL(url);
    urlWithPath.searchParams.set('path', clave);

    try {
      const response = await fetch(urlWithPath.toString(), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      return result.data;
    } catch (error) {
      console.error(`Error eliminando clave ${entidad}/${recordId}/${campoJson}/${clave}:`, error);
      throw error;
    }
  }

  /**
   * 🧹 UTILIDADES
   */

  // Filtrar solo campos con valor
  filtrarCamposConValor(datos: Record<string, any>, esquema: EsquemaCampo[]): Record<string, any> {
    const camposPermitidos = esquema.map(c => c.key);
    const datosLimpios: Record<string, any> = {};

    Object.keys(datos).forEach(key => {
      const valor = datos[key];
      if (
        camposPermitidos.includes(key) &&
        valor !== null &&
        valor !== undefined &&
        valor !== '' &&
        !(Array.isArray(valor) && valor.length === 0) &&
        !(typeof valor === 'object' && valor !== null && Object.keys(valor).length === 0)
      ) {
        datosLimpios[key] = valor;
      }
    });

    return datosLimpios;
  }

  // Validar tipos según esquema
  validarTipos(datos: Record<string, any>, esquema: EsquemaCampo[]): Record<string, any> {
    const validados: Record<string, any> = {};

    Object.keys(datos).forEach(key => {
      const campo = esquema.find(c => c.key === key);
      if (!campo) return;

      let valor = datos[key];

      switch (campo.type) {
        case 'integer':
          valor = parseInt(String(valor), 10);
          if (isNaN(valor)) throw new Error(`${key}: debe ser un número entero`);
          break;
        case 'number':
          valor = parseFloat(String(valor));
          if (isNaN(valor)) throw new Error(`${key}: debe ser un número`);
          break;
        case 'boolean':
          valor = Boolean(valor);
          break;
      }

      validados[key] = valor;
    });

    return validados;
  }

  // Guardar datos con validación completa
  async guardarDatosInteligente(
    entidad: string,
    recordId: number,
    campoJson: string,
    formData: Record<string, any>,
    esquema: EsquemaCampo[]
  ): Promise<any> {
    // Filtrar y validar
    const datosLimpios = this.filtrarCamposConValor(formData, esquema);
    const datosValidados = this.validarTipos(datosLimpios, esquema);

    // Guardar con validación usando PATCH con { "value": datos }
    return await this.guardarDatos(entidad, recordId, campoJson, datosValidados, true);
  }

  // Configurar empresa ID
  setEmpresaId(empresaId: string): void {
    this.empresaId = empresaId;
    localStorage.setItem('empresa_id', empresaId);
    this.cache.clear(); // Limpiar cache al cambiar empresa
  }

  // Limpiar cache manualmente
  limpiarCache(): void {
    this.cache.clear();
  }
}

// ✅ INSTANCIA ÚNICA GLOBAL
export const unifiedCamposDinamicos = new UnifiedCamposDinamicosService();

// Export por defecto
export default unifiedCamposDinamicos;
