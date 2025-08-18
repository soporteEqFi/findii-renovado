import { buildApiUrl } from '../config/constants';

/**
 * Herramienta de diagnóstico para campos dinámicos
 * Ayuda a identificar problemas de conectividad y configuración
 */
export class DiagnosticoCamposDinamicos {
  private baseUrl: string;
  private empresaId: string;

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

  /**
   * Probar todos los endpoints disponibles para campos dinámicos
   */
  async probarEndpoints(entidad: string = 'solicitante', recordId: number = 1, campoJson: string = 'info_extra'): Promise<void> {
    console.group('🔍 DIAGNÓSTICO CAMPOS DINÁMICOS');
    console.log('Configuración inicial:');
    console.log('- Base URL:', this.baseUrl);
    console.log('- Empresa ID:', this.empresaId);
    console.log('- Headers:', this.getHeaders());
    console.log('- Entidad:', entidad);
    console.log('- Record ID:', recordId);
    console.log('- Campo JSON:', campoJson);
    console.log('');

    // 1. Probar endpoint de esquema completo
    await this.probarEsquemaCompleto(entidad);

    // 2. Probar endpoint de esquema JSON
    await this.probarEsquemaJSON(entidad, campoJson);

    // 3. Probar endpoints de actualización
    await this.probarActualizacion(entidad, recordId, campoJson);

    // 4. Probar endpoints alternativos
    await this.probarEndpointsAlternativos(entidad, recordId, campoJson);

    console.groupEnd();
  }

  private async probarEsquemaCompleto(entidad: string): Promise<void> {
    console.group('📋 Probando esquema completo');

    try {
      const url = `${this.baseUrl}/schema/${entidad}?empresa_id=${this.empresaId}`;
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      console.log('Status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Esquema completo exitoso');
        console.log('Datos recibidos:', data);
      } else {
        console.log('❌ Error en esquema completo');
        const text = await response.text();
        console.log('Respuesta:', text);
      }
    } catch (error) {
      console.log('❌ Error de red en esquema completo:', error);
    }

    console.groupEnd();
  }

  private async probarEsquemaJSON(entidad: string, campoJson: string): Promise<void> {
    console.group('📄 Probando esquema JSON');

    try {
      const url = `${this.baseUrl}/json/schema/${entidad}/${campoJson}?empresa_id=${this.empresaId}`;
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      console.log('Status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Esquema JSON exitoso');
        console.log('Datos recibidos:', data);
      } else {
        console.log('❌ Error en esquema JSON');
        const text = await response.text();
        console.log('Respuesta:', text);
      }
    } catch (error) {
      console.log('❌ Error de red en esquema JSON:', error);
    }

    console.groupEnd();
  }

  private async probarActualizacion(entidad: string, recordId: number, campoJson: string): Promise<void> {
    console.group('💾 Probando actualización de datos');

    const datosTest = { test_field: 'test_value', timestamp: new Date().toISOString() };
    const metodosHTTP = ['PATCH', 'PUT', 'POST'];

    for (const metodo of metodosHTTP) {
      try {
        const url = `${this.baseUrl}/json/${entidad}/${recordId}/${campoJson}?empresa_id=${this.empresaId}&validate=true`;
        console.log(`Probando ${metodo} en:`, url);

        const response = await fetch(url, {
          method: metodo,
          headers: this.getHeaders(),
          body: JSON.stringify({ value: datosTest })
        });

        console.log(`${metodo} Status:`, response.status, response.statusText);

        if (response.status === 405) {
          console.log(`❌ ${metodo} no permitido`);
        } else if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${metodo} exitoso`);
          console.log('Datos recibidos:', data);
          break; // Si uno funciona, no probar los demás
        } else {
          console.log(`❌ Error con ${metodo}`);
          const text = await response.text();
          console.log('Respuesta:', text);
        }
      } catch (error) {
        console.log(`❌ Error de red con ${metodo}:`, error);
      }
    }

    console.groupEnd();
  }

  private async probarEndpointsAlternativos(entidad: string, recordId: number, campoJson: string): Promise<void> {
    console.group('🔄 Probando endpoints alternativos');

    // Lista de endpoints alternativos comunes
    const endpointsAlternativos = [
      '/json',
      '/update-json',
      '/api/json',
      `/api/json/${entidad}/${recordId}/${campoJson}`,
      `/api/${entidad}/${recordId}/json`,
      `/${entidad}/${recordId}/${campoJson}`,
      `/update/${entidad}/${recordId}/${campoJson}`
    ];

    const datosTest = { test_field: 'test_value', timestamp: new Date().toISOString() };

    for (const endpoint of endpointsAlternativos) {
      try {
        const url = `${this.baseUrl}${endpoint}?empresa_id=${this.empresaId}`;
        console.log('Probando endpoint alternativo:', url);

        const response = await fetch(url, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            entidad,
            recordId,
            campoJson,
            datos: datosTest
          })
        });

        console.log(`Status:`, response.status, response.statusText);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Endpoint alternativo exitoso: ${endpoint}`);
          console.log('Datos recibidos:', data);
        } else if (response.status !== 404 && response.status !== 405) {
          console.log(`⚠️ Endpoint responde pero con error: ${endpoint}`);
          const text = await response.text();
          console.log('Respuesta:', text);
        }
      } catch (error) {
        // No mostrar errores de red para endpoints alternativos
      }
    }

    console.groupEnd();
  }

  /**
   * Verificar configuración del sistema
   */
  verificarConfiguracion(): void {
    console.group('⚙️ VERIFICANDO CONFIGURACIÓN');

    console.log('Base URL configurada:', this.baseUrl);
    console.log('Empresa ID:', this.empresaId);
    console.log('Token de acceso:', localStorage.getItem('access_token') ? 'Presente' : 'Faltante');
    console.log('Usuario ID:', localStorage.getItem('user_id') || 'No configurado');

    // Verificar si la URL base es válida
    try {
      new URL(this.baseUrl);
      console.log('✅ URL base válida');
    } catch {
      console.log('❌ URL base inválida');
    }

    // Verificar empresa ID
    if (this.empresaId && !isNaN(parseInt(this.empresaId))) {
      console.log('✅ Empresa ID válido');
    } else {
      console.log('❌ Empresa ID inválido o faltante');
    }

    console.groupEnd();
  }

  /**
   * Ejecutar diagnóstico completo
   */
  async ejecutarDiagnosticoCompleto(entidad?: string, recordId?: number, campoJson?: string): Promise<void> {
    console.clear();
    console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO DE CAMPOS DINÁMICOS');
    console.log('='.repeat(60));

    this.verificarConfiguracion();

    if (entidad && recordId && campoJson) {
      await this.probarEndpoints(entidad, recordId, campoJson);
    } else {
      console.log('ℹ️ Para probar endpoints específicos, proporciona: entidad, recordId y campoJson');
    }

    console.log('='.repeat(60));
    console.log('🏁 DIAGNÓSTICO COMPLETADO');
  }
}

// Instancia global para uso en consola del navegador
export const diagnostico = new DiagnosticoCamposDinamicos();

// Función helper para uso rápido
export const diagnosticarCamposDinamicos = (entidad?: string, recordId?: number, campoJson?: string) => {
  return diagnostico.ejecutarDiagnosticoCompleto(entidad, recordId, campoJson);
};

export default diagnostico;
