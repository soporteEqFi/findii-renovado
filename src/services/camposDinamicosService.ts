import { buildApiUrl } from '../config/constants';
import { EsquemaCampo } from '../types/esquemas';

// Interfaces basadas en la guía
interface CamposDinamicosResponse {
  ok: boolean;
  data?: any;
  error?: string;
}

interface EsquemaCompletoResponse {
  ok: boolean;
  data: {
    entidad: string;
    tabla: string;
    json_column: string;
    campos_fijos: EsquemaCampo[];
    campos_dinamicos: EsquemaCampo[];
  };
  error?: string;
}

/**
 * Servicio optimizado para campos dinámicos JSON según la guía del backend
 * Este servicio implementa todas las mejores prácticas de la guía:
 * - Headers obligatorios con empresa_id
 * - Validación automática
 * - Cache inteligente
 * - Manejo de errores robusto
 */
class CamposDinamicosService {
  private baseUrl: string;
  private empresaId: string;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos según la guía

  constructor() {
    this.baseUrl = buildApiUrl('').replace(/\/$/, ''); // Remover slash final
    this.empresaId = localStorage.getItem('empresa_id') || '1';
  }

  /**
   * Headers obligatorios según la guía
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Empresa-Id': this.empresaId,
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
    };
  }

  /**
   * Construir URL con empresa_id como query param (según guía)
   */
  private buildUrl(endpoint: string): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('empresa_id', this.empresaId);
    return url.toString();
  }

  /**
   * Verificar y usar cache según la guía
   */
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Guardar en cache según la guía
   */
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 1. OBTENER ESQUEMAS - Implementación según guía
   */

    /**
   * Obtener esquema completo por entidad (⭐ Recomendado según guía)
   * GET /schema/{entidad}?empresa_id={id}
   */
  async obtenerEsquemaCompleto(entidad: string): Promise<EsquemaCompletoResponse['data']> {
    const cacheKey = `esquema_completo_${entidad}_${this.empresaId}`;

    // Verificar cache
    const cached = this.getCached<EsquemaCompletoResponse['data']>(cacheKey);
    if (cached) {
      // console.log(`📦 Cache hit para esquema completo: ${entidad}`);
      return cached;
    }

    try {
      // ✅ RUTA SEGÚN GUÍA: /schema/{entidad}?empresa_id={id}
      const url = this.buildUrl(`/schema/${entidad}`);

      const response = await fetch(url, {
        method: 'GET', // ✅ CORRECTO: GET para obtener esquema completo
        headers: this.getHeaders()
      });


      if (!response.ok) {
        throw new Error(`Error al cargar esquema completo: ${response.status} ${response.statusText}`);
      }

      const result: EsquemaCompletoResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }


      // Guardar en cache
      this.setCache(cacheKey, result.data);

      return result.data;
    } catch (error) {
      console.error(`❌ Error obteniendo esquema completo ${entidad}:`, error);
      throw error;
    }
  }

      /**
   * Obtener esquema solo de campos JSON
   * GET /json/schema/{entidad}/{json_field}?empresa_id={id}
   */
  async obtenerEsquemaJSON(entidad: string, campoJson: string): Promise<EsquemaCampo[]> {
    const cacheKey = `esquema_json_${entidad}_${campoJson}_${this.empresaId}`;

    // Verificar cache
    const cached = this.getCached<EsquemaCampo[]>(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit para esquema JSON: ${entidad}/${campoJson}`);
      return cached;
    }

    try {
      // ✅ RUTA SEGÚN GUÍA: /json/schema/{entidad}/{json_field}?empresa_id={id}
      const url = this.buildUrl(`/json/schema/${entidad}/${campoJson}`);

      const response = await fetch(url, {
        method: 'GET', // ✅ CORRECTO: GET para obtener esquema
        headers: this.getHeaders()
      });


      if (!response.ok) {
        throw new Error(`Error al cargar esquema JSON: ${response.status} ${response.statusText}`);
      }

      const result: CamposDinamicosResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      const esquema = result.data || [];

      // Guardar en cache
      this.setCache(cacheKey, esquema);

      return esquema;
    } catch (error) {
      console.error(`❌ Error obteniendo esquema JSON ${entidad}/${campoJson}:`, error);
      throw error;
    }
  }

  /**
   * 2. LEER DATOS JSON - Implementación según guía
   */

  /**
   * Leer campo JSON completo
   * GET /json/{entidad}/{record_id}/{json_field}?empresa_id={id}
   */
  async leerCampoJSON(entidad: string, recordId: number, campoJson: string): Promise<Record<string, any>> {
    try {
      // ✅ RUTA SEGÚN GUÍA: /json/{entidad}/{record_id}/{json_field}?empresa_id={id}
      const url = this.buildUrl(`/json/${entidad}/${recordId}/${campoJson}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });


      if (!response.ok) {
        throw new Error(`Error al leer campo JSON: ${response.status} ${response.statusText}`);
      }

      const result: CamposDinamicosResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      return result.data || {};
    } catch (error) {
      console.error(`❌ Error leyendo campo JSON ${entidad}/${recordId}/${campoJson}:`, error);
      throw error;
    }
  }

  /**
   * Leer clave específica del JSON
   * GET /json/{entidad}/{record_id}/{json_field}?empresa_id={id}&path={clave}
   */
  async leerClaveJSON(entidad: string, recordId: number, campoJson: string, clave: string): Promise<any> {
    try {
      const url = this.buildUrl(`/json/${entidad}/${recordId}/${campoJson}`);
      const urlWithPath = new URL(url);
      urlWithPath.searchParams.set('path', clave);

      const response = await fetch(urlWithPath.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error al leer clave JSON: ${response.statusText}`);
      }

      const result: CamposDinamicosResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      return result.data;
    } catch (error) {
      console.error(`Error leyendo clave JSON ${entidad}/${recordId}/${campoJson}/${clave}:`, error);
      throw error;
    }
  }

  /**
   * 3. ACTUALIZAR DATOS JSON - Implementación según guía
   */

  /**
   * Actualizar una clave específica
   * PATCH /json/{entidad}/{record_id}/{json_field}?empresa_id={id}&validate={bool}
   */
  async actualizarClaveJSON(
    entidad: string,
    recordId: number,
    campoJson: string,
    clave: string,
    valor: any,
    validar: boolean = true
  ): Promise<any> {
    try {
      // ✅ RUTA SEGÚN GUÍA: /json/{entidad}/{record_id}/{json_field}?empresa_id={id}&validate={bool}
      const url = this.buildUrl(`/json/${entidad}/${recordId}/${campoJson}`);
      const urlWithValidate = new URL(url);
      urlWithValidate.searchParams.set('validate', validar.toString());

      const response = await fetch(urlWithValidate.toString(), {
        method: 'PATCH',
        headers: this.getHeaders(),
        // ✅ FORMATO SEGÚN GUÍA: { "path": "clave", "value": valor } para una clave específica
        body: JSON.stringify({
          path: clave,
          value: valor
        })
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar clave JSON: ${response.status} ${response.statusText}`);
      }

      const result: CamposDinamicosResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }
      return result.data;
    } catch (error) {
      console.error(`❌ Error actualizando clave JSON ${entidad}/${recordId}/${campoJson}/${clave}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar múltiples campos (Merge)
   * PATCH /json/{entidad}/{record_id}/{json_field}?empresa_id={id}&validate={bool}
   */
  async actualizarVariasClavesJSON(
    entidad: string,
    recordId: number,
    campoJson: string,
    datos: Record<string, any>,
    validar: boolean = true
  ): Promise<any> {
    // Lista de métodos HTTP a probar en orden de preferencia
    // PATCH es el correcto según la guía
    const metodosHTTP = ['PATCH', 'PUT', 'POST'];

    for (const metodo of metodosHTTP) {
      try {
                console.log(`💾 Intentando ACTUALIZAR DATOS con método ${metodo}...`);

        const url = this.buildUrl(`/json/${entidad}/${recordId}/${campoJson}`);
        const urlWithValidate = new URL(url);
        urlWithValidate.searchParams.set('validate', validar.toString());

        const response = await fetch(urlWithValidate.toString(), {
          method: metodo,
          headers: this.getHeaders(),
          // ✅ FORMATO SEGÚN GUÍA: { "value": { datos } } para múltiples campos
          body: JSON.stringify({
            value: datos
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error con ${metodo}:`, errorText);
          throw new Error(`Error al actualizar campos JSON con ${metodo}: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result: CamposDinamicosResponse = await response.json();

        if (!result.ok) {
          throw new Error(result.error || 'Error en la respuesta del servidor');
        }

        return result.data;
      } catch (error) {
        console.error(`Error con método ${metodo}:`, error);

        // Si es el último método, lanzar el error
        if (metodo === metodosHTTP[metodosHTTP.length - 1]) {
          console.error(`Todos los métodos HTTP fallaron para ${entidad}/${recordId}/${campoJson}`);
          throw error;
        }
      }
    }

    throw new Error('No se pudo actualizar usando ningún método HTTP');
  }

  /**
   * 4. ELIMINAR DATOS JSON - Implementación según guía
   */

  /**
   * Eliminar una clave
   * DELETE /json/{entidad}/{record_id}/{json_field}?empresa_id={id}&path={clave}
   */
  async eliminarClaveJSON(
    entidad: string,
    recordId: number,
    campoJson: string,
    clave: string
  ): Promise<any> {
    try {
      // ✅ RUTA SEGÚN GUÍA: /json/{entidad}/{record_id}/{json_field}?empresa_id={id}&path={clave}
      const url = this.buildUrl(`/json/${entidad}/${recordId}/${campoJson}`);
      const urlWithPath = new URL(url);
      urlWithPath.searchParams.set('path', clave);

      const response = await fetch(urlWithPath.toString(), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar clave JSON: ${response.status} ${response.statusText}`);
      }

      const result: CamposDinamicosResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      return result.data;
    } catch (error) {
      console.error(`❌ Error eliminando clave JSON ${entidad}/${recordId}/${campoJson}/${clave}:`, error);
      throw error;
    }
  }

  /**
   * 5. UTILIDADES SEGÚN LA GUÍA
   */

  /**
   * Filtrar solo campos que tienen valor (según guía)
   */
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

  /**
   * Validar tipos según esquema (según guía)
   */
  validarTipos(datos: Record<string, any>, esquema: EsquemaCampo[]): Record<string, any> {
    const validados: Record<string, any> = {};

    Object.keys(datos).forEach(key => {
      const campo = esquema.find(c => c.key === key);
      if (!campo) return;

      let valor = datos[key];

      // Convertir tipos según definición
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
        case 'object':
          if (typeof valor === 'string') {
            try {
              valor = JSON.parse(valor);
            } catch {
              throw new Error(`${key}: JSON inválido`);
            }
          }
          break;
        case 'array':
          if (typeof valor === 'string') {
            try {
              valor = JSON.parse(valor);
            } catch {
              valor = valor.split(',').map((item: string) => item.trim()).filter(Boolean);
            }
          }
          break;
      }

      validados[key] = valor;
    });

    return validados;
  }

  /**
   * Envío inteligente con validación completa (según guía)
   */
  async enviarInteligente(
    entidad: string,
    recordId: number,
    campoJson: string,
    formData: Record<string, any>,
    esquema: EsquemaCampo[]
  ): Promise<any> {
    try {
      // Filtrar solo campos que tienen valor
      const datosLimpios = this.filtrarCamposConValor(formData, esquema);

      // Validar tipos antes de enviar
      const datosValidados = this.validarTipos(datosLimpios, esquema);

      // Enviar con validación del backend (siempre true en producción según guía)
      return await this.actualizarVariasClavesJSON(entidad, recordId, campoJson, datosValidados, true);
    } catch (error) {
      console.error('Error en envío inteligente, intentando método de compatibilidad:', error);

      // Fallback: usar el endpoint UPDATE_JSON existente
      try {
        const url = buildApiUrl(`${campoJson === 'info_extra' ? '/json' : '/update-json'}`);
        const empresaId = this.empresaId;

        const fallbackData = {
          entidad,
          recordId,
          campoJson,
          datos: formData,
          empresaId: parseInt(empresaId)
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
            'X-Empresa-Id': empresaId
          },
          body: JSON.stringify(fallbackData)
        });

        if (!response.ok) {
          throw new Error(`Fallback también falló: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (fallbackError) {
        console.error('Fallback también falló:', fallbackError);
        throw new Error(`No se pudo actualizar los datos. Error principal: ${error instanceof Error ? error.message : 'desconocido'}. Error fallback: ${fallbackError instanceof Error ? fallbackError.message : 'desconocido'}`);
      }
    }
  }

  /**
   * Actualizar empresa ID (para multi-tenant)
   */
  setEmpresaId(empresaId: string): void {
    this.empresaId = empresaId;
    localStorage.setItem('empresa_id', empresaId);
    // Limpiar cache al cambiar empresa
    this.cache.clear();
  }

  /**
   * Limpiar cache manualmente
   */
  limpiarCache(): void {
    this.cache.clear();
  }
}

// Instancia global singleton según la guía
export const camposDinamicosAPI = new CamposDinamicosService();

// Export del servicio para compatibilidad
export { CamposDinamicosService };
export default camposDinamicosAPI;
