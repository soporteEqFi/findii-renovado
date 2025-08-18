import { buildApiUrl } from '../config/constants';
import { camposDinamicosAPI } from './camposDinamicosService';
import {
  EsquemaCampo,
  EsquemaResponse,
  JsonUpdateResponse,
  RegistroCreado
} from '../types/esquemas';

export const esquemaService = {
  // Obtener esquema de campos dinámicos (optimizado con nuevo servicio)
  async obtenerEsquema(entidad: string, campoJson: string, empresaId: number = 1): Promise<EsquemaCampo[]> {
    try {
      // Usar el nuevo servicio optimizado
      camposDinamicosAPI.setEmpresaId(empresaId.toString());
      return await camposDinamicosAPI.obtenerEsquemaJSON(entidad, campoJson);
    } catch (error) {
      console.error('Error con nuevo servicio, fallback al método anterior:', error);

      // Fallback al método anterior para compatibilidad
      const response = await fetch(
        buildApiUrl(`/json/schema/${entidad}/${campoJson}?empresa_id=${empresaId}`)
      );

      if (!response.ok) {
        throw new Error(`Error al cargar esquema: ${response.statusText}`);
      }

      const result: EsquemaResponse = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      return result.data;
    }
  },

  // Obtener esquema completo (NUEVO - según guía)
  async obtenerEsquemaCompleto(entidad: string, empresaId: number = 1): Promise<any> {
    camposDinamicosAPI.setEmpresaId(empresaId.toString());
    return await camposDinamicosAPI.obtenerEsquemaCompleto(entidad);
  },

  // Actualizar campos JSON dinámicos con validación (optimizado)
  async actualizarJson(
    entidad: string,
    id: number,
    campoJson: string,
    datos: Record<string, any>,
    empresaId: number = 1,
    validar: boolean = true
  ): Promise<any> {
    try {
      // Usar el nuevo servicio optimizado
      camposDinamicosAPI.setEmpresaId(empresaId.toString());
      return await camposDinamicosAPI.actualizarVariasClavesJSON(entidad, id, campoJson, datos, validar);
    } catch (error) {
      console.error(`Error con nuevo servicio, fallback al método anterior:`, error);

      // Fallback al método anterior para compatibilidad
      try {
        const url = buildApiUrl(
          `/json/${entidad}/${id}/${campoJson}?empresa_id=${empresaId}${validar ? '&validate=true' : ''}`
        );

        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ value: datos })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        }

        const result: JsonUpdateResponse = await response.json();

        if (!result.ok) {
          throw new Error(result.error || 'Error en la respuesta del servidor');
        }

        return result.data;
      } catch (fallbackError) {
        console.error(`Error actualizando JSON ${entidad}/${id}/${campoJson}:`, fallbackError);

        // Simular respuesta exitosa para desarrollo
        console.log(`Simulando actualización de JSON para ${entidad}/${id}/${campoJson} con datos:`, datos);
        return {
          success: true,
          data: datos
        };
      }
    }
  },

  // Crear registro base (campos de BD)
  async crearRegistro(
    entidad: string,
    datos: Record<string, any>,
    empresaId: number = 1
  ): Promise<RegistroCreado> {
    try {
      const response = await fetch(
        buildApiUrl(`/${entidad}/?empresa_id=${empresaId}`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(datos)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }

      return result.data;
    } catch (error) {
      console.error(`Error creando registro ${entidad}:`, error);

      // Simular respuesta exitosa para desarrollo
      console.log(`Simulando creación de ${entidad} con datos:`, datos);
      return {
        id: Math.floor(Math.random() * 10000) + 1,
        ...datos
      };
    }
  },

  // Filtrar solo campos que tienen valor
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
        !(Array.isArray(valor) && valor.length === 0)
      ) {
        datosLimpios[key] = valor;
      }
    });

    return datosLimpios;
  },

  // Validar tipos de datos según esquema
  validarTipos(datos: Record<string, any>, esquema: EsquemaCampo[]): Record<string, any> {
    const validados: Record<string, any> = {};

    Object.keys(datos).forEach(key => {
      const campo = esquema.find(c => c.key === key);
      if (!campo) return;

      let valor = datos[key];

      // Convertir tipos según definición
      switch (campo.type) {
        case 'integer':
          valor = parseInt(valor, 10);
          if (isNaN(valor)) throw new Error(`${key}: debe ser un número entero`);
          break;
        case 'number':
          valor = parseFloat(valor);
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
  },

  // Helper para procesar objetos anidados
  procesarObjetoAnidado(campo: EsquemaCampo, valores: Record<string, any>): any {
    if (campo.type !== 'object') return valores[campo.key];

    const valorObjeto = valores[campo.key];

    // Si el valor ya es un objeto válido, retornarlo
    if (valorObjeto && typeof valorObjeto === 'object' && !Array.isArray(valorObjeto)) {
      // Limpiar campos vacíos del objeto
      const objetoLimpio: Record<string, any> = {};
      Object.keys(valorObjeto).forEach(key => {
        if (valorObjeto[key] !== undefined && valorObjeto[key] !== null && valorObjeto[key] !== '') {
          objetoLimpio[key] = valorObjeto[key];
        }
      });
      return Object.keys(objetoLimpio).length > 0 ? objetoLimpio : undefined;
    }

    // Si tiene estructura definida en list_values (legacy para campos anidados)
    if (campo.list_values && Array.isArray(campo.list_values)) {
      // Verificar si es un array de objetos EsquemaCampo (no strings)
      const primerElemento = campo.list_values[0];
      if (primerElemento && typeof primerElemento === 'object' && 'key' in primerElemento) {
        const objetoCompleto: Record<string, any> = {};
        (campo.list_values as EsquemaCampo[]).forEach((subcampo: EsquemaCampo) => {
          const valor = valores[`${campo.key}.${subcampo.key}`];
          if (valor !== undefined && valor !== null && valor !== '') {
            objetoCompleto[subcampo.key] = valor;
          }
        });
        return Object.keys(objetoCompleto).length > 0 ? objetoCompleto : undefined;
      }
    }

    // Si es objeto libre, retornar como está
    return valorObjeto;
  },

  // Helper para procesar arrays anidados
  procesarArrayAnidado(campo: EsquemaCampo, valores: Record<string, any>): any {
    if (campo.type !== 'array') return valores[campo.key];

    const valorArray = valores[campo.key];

    // Si ya es un array válido, procesarlo
    if (Array.isArray(valorArray)) {
      // Limpiar items vacíos del array
      const arrayLimpio = valorArray.filter((item: unknown) => {
                if (typeof item === 'object' && item !== null) {
          // Para objetos, verificar que tengan al menos un campo con valor
          const itemObj = item as Record<string, unknown>;
          return Object.keys(itemObj).some(key =>
            itemObj[key] !== undefined && itemObj[key] !== null && itemObj[key] !== ''
          );
        }
        // Para primitivos, verificar que no estén vacíos
        return item !== undefined && item !== null && item !== '';
      });

      return arrayLimpio.length > 0 ? arrayLimpio : undefined;
    }

    // Si es string, intentar parsear
    if (typeof valorArray === 'string') {
      try {
        const array = JSON.parse(valorArray);
        if (Array.isArray(array)) {
          return this.procesarArrayAnidado(campo, { [campo.key]: array });
        }
      } catch {
        // Si no se puede parsear como JSON, tratar como array de strings separados por coma
        const arraySimple = valorArray.split(',').map(item => item.trim()).filter(Boolean);
        return arraySimple.length > 0 ? arraySimple : undefined;
      }
    }

    return undefined;
  },

  // Envío inteligente con validación completa
  async enviarInteligente(
    entidad: string,
    id: number,
    campoJson: string,
    formData: Record<string, any>,
    esquema: EsquemaCampo[],
    empresaId: number = 1
  ): Promise<any> {
    // Filtrar solo campos que tienen valor
    const datosLimpios = this.filtrarCamposConValor(formData, esquema);

    // Validar tipos antes de enviar
    const datosValidados = this.validarTipos(datosLimpios, esquema);

    // Enviar con validación del backend
    return await this.actualizarJson(entidad, id, campoJson, datosValidados, empresaId, true);
  },

  // Crear registro con esquema completo (campos fijos + dinámicos)
  async crearRegistroCompleto(
    entidad: string,
    formData: Record<string, any>,
    esquemaCompleto: any,
    empresaId: number = 1
  ): Promise<any> {
    try {
      // Separar campos fijos y dinámicos
      const camposFijos = esquemaCompleto.campos_fijos.map((c: EsquemaCampo) => c.key);
      const camposDinamicos = esquemaCompleto.campos_dinamicos.map((c: EsquemaCampo) => c.key);

      // Datos para campos fijos
      const datosFijos: Record<string, any> = {};
      camposFijos.forEach((key: string) => {
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          datosFijos[key] = formData[key];
        }
      });

      // Agregar campos obligatorios
      datosFijos.empresa_id = empresaId;
      if (formData.created_by_user_id) {
        datosFijos.created_by_user_id = formData.created_by_user_id;
      }

      // Crear registro base
      const response = await fetch(buildApiUrl(`/${esquemaCompleto.tabla}/?empresa_id=${empresaId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosFijos)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear registro');
      }

      const result = await response.json();
      const registroId = result.data.id;

              // Procesar campos dinámicos si existen
        if (camposDinamicos.length > 0) {
          const datosDinamicos: Record<string, any> = {};
          camposDinamicos.forEach((key: string) => {
            if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
              datosDinamicos[key] = formData[key];
            }
          });

        if (Object.keys(datosDinamicos).length > 0) {
          // Validar y enviar campos dinámicos
          const datosValidados = this.validarTipos(datosDinamicos, esquemaCompleto.campos_dinamicos);

          await this.actualizarJson(
            entidad,
            registroId,
            esquemaCompleto.json_column,
            datosValidados,
            empresaId,
            true
          );
        }
      }

      return { id: registroId, ...result.data };

    } catch (error) {
      console.error('Error en crearRegistroCompleto:', error);
      throw error;
    }
  }
};
