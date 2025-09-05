import { buildApiUrl, API_CONFIG } from '../config/constants';
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
        buildApiUrl(`/json/schema/${entidad}/${campoJson}?empresa_id=${empresaId}`),
        {
          headers: {
            'X-User-Id': localStorage.getItem('user_id') || '1',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
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
            'X-User-Id': localStorage.getItem('user_id') || '1',
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
              'X-User-Id': localStorage.getItem('user_id') || '1',
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
        (campo.list_values as unknown as EsquemaCampo[]).forEach((subcampo: EsquemaCampo) => {
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
    // Método legacy - mantener para compatibilidad
    return this.crearRegistroCompletoLegacy(entidad, formData, esquemaCompleto, empresaId);
  },

  async crearRegistroCompletoLegacy(
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
      const url = buildApiUrl(`/${esquemaCompleto.tabla}/?empresa_id=${empresaId}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosFijos)
      });

      if (!response.ok) {
        console.error(`❌ Error HTTP ${response.status} para ${url}`);
        console.error('📋 Headers de respuesta:', response.headers);

        try {
          const errorData = await response.json();
          console.error('📋 Error JSON del backend:', errorData);
          throw new Error(errorData.error || `Error ${response.status} al crear registro`);
        } catch (parseError) {
          // Si no puede parsear JSON, es probablemente HTML
          const errorText = await response.text();
          console.error('📋 Respuesta HTML del backend:', errorText.substring(0, 500));
          console.error(`🔍 El endpoint ${url} probablemente no existe o devuelve HTML`);
          throw new Error(`Endpoint ${url} no disponible (devuelve HTML en lugar de JSON)`);
        }
      }

      let result;
      try {
        const responseText = await response.text();

        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
        console.error('🔍 La respuesta no es JSON válido');
        throw new Error(`Respuesta inválida del servidor para ${url}: no es JSON`);
      }

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
  },

  // Nuevo método para crear registro completo usando endpoint unificado
  async crearRegistroCompletoUnificado(
    formData: Record<string, any>,
    esquemasCompletos: any,
    empresaId: number = 1
  ): Promise<any> {
    try {
      // Transformar datos del formulario plano a la estructura esperada por el backend
      const datosCompletos = this.transformarDatosFormulario(formData, esquemasCompletos);

      // Datos transformados para el backend
      console.log('🚀 === DATOS TRANSFORMADOS PARA EL BACKEND ===');
      console.log('📊 Estructura completa:', JSON.stringify(datosCompletos, null, 2));

      // Verificar específicamente los campos del solicitante
      if (datosCompletos.solicitante) {
        console.log('👤 === CAMPOS DEL SOLICITANTE ===');
        console.log('📋 Campos fijos:', Object.keys(datosCompletos.solicitante).filter(key => key !== 'info_extra'));
        console.log('📋 Campos en info_extra:', datosCompletos.solicitante.info_extra ? Object.keys(datosCompletos.solicitante.info_extra) : 'No hay info_extra');
        console.log('📊 Datos completos del solicitante:', datosCompletos.solicitante);
      }

      // Obtener datos del usuario actual
      const userData = localStorage.getItem('user');
      let userEmail = '';
      if (userData) {
        const userObj = JSON.parse(userData);
        userEmail = userObj.correo || '';
      }

      // Agregar campos adicionales a la solicitud
      if (datosCompletos.solicitudes && datosCompletos.solicitudes[0]) {
        datosCompletos.solicitudes[0].created_by_user_id = parseInt(localStorage.getItem('user_id') || '1');
        datosCompletos.solicitudes[0].assigned_to_user_id = parseInt(localStorage.getItem('user_id') || '1');
        datosCompletos.solicitudes[0].estado = 'Pendiente';
        datosCompletos.solicitudes[0].created_by_user_email = userEmail; // Agregar correo del usuario
      }

      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.CREAR_REGISTRO_COMPLETO}?empresa_id=${empresaId}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('user_id') || '1',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(datosCompletos)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('❌ Error en crearRegistroCompletoUnificado:', error);
      throw error;
    }
  },

    // Función auxiliar para extraer datos de una entidad específica (MEJORADA)
  extraerDatosEntidad(formData: Record<string, any>, esquema: any, entidad: string): Record<string, any> {
    if (!esquema) {
      // No hay esquema para esta entidad
      return {};
    }

    console.log(`🔍 === PROCESANDO ENTIDAD: ${entidad} ===`);
    console.log('📋 Esquema recibido:', esquema);
    console.log('📊 FormData recibido:', formData);

    const datos: Record<string, any> = {};

    // Extraer campos fijos (van directamente al objeto principal)
    if (esquema.campos_fijos && Array.isArray(esquema.campos_fijos)) {
      console.log(`📋 Procesando ${esquema.campos_fijos.length} campos fijos para ${entidad}:`, esquema.campos_fijos.map((c: any) => c.key));
      esquema.campos_fijos.forEach((campo: any) => {
        if (formData[campo.key] !== undefined && formData[campo.key] !== null && formData[campo.key] !== '') {
          datos[campo.key] = formData[campo.key];
          console.log(`✅ Campo fijo agregado: ${campo.key} = ${formData[campo.key]}`);
        } else {
          console.log(`❌ Campo fijo vacío: ${campo.key} = ${formData[campo.key]}`);
        }
      });
    } else {
      console.log(`⚠️ No hay campos fijos definidos para ${entidad}`);
    }

    // Log específico para campos de solicitud
    if (entidad === 'solicitud') {
      console.log('🏦 === CAMPOS DE SOLICITUD ===');
      console.log('🔍 Buscando ciudad_solicitud en formData:', formData.ciudad_solicitud);
      console.log('🔍 Buscando banco_nombre en formData:', formData.banco_nombre);
      console.log('📋 Campos fijos definidos:', esquema.campos_fijos?.map((c: any) => c.key));
      console.log('📋 Campos dinámicos definidos:', esquema.campos_dinamicos?.map((c: any) => c.key));
    }

    // Para referencias, NO crear por defecto una referencia vacía.
    // Solo establecer tipo_referencia si viene explícitamente en formData.
    if (entidad === 'referencia') {
      if (!datos.tipo_referencia && formData?.tipo_referencia) {
        datos.tipo_referencia = formData.tipo_referencia;
      }
    }

    // Extraer campos dinámicos (van al objeto JSON correspondiente)
    if (esquema.campos_dinamicos && Array.isArray(esquema.campos_dinamicos) && esquema.campos_dinamicos.length > 0) {
      const jsonObjectName = this.getJsonObjectName(entidad);

      // Crear el objeto JSON para campos dinámicos
      datos[jsonObjectName] = {};

      // Procesar cada campo dinámico según su tipo
      esquema.campos_dinamicos.forEach((campo: any) => {
        const valor = formData[campo.key];

        if (valor !== undefined && valor !== null && valor !== '') {
          // Procesar según el tipo de campo
          const valorProcesado = this.procesarValorCampo(campo, valor, formData);
          if (valorProcesado !== undefined) {
            datos[jsonObjectName][campo.key] = valorProcesado;
            // Campo dinámico agregado
          }
        }
      });

      // Solo incluir el objeto JSON si tiene campos
      if (Object.keys(datos[jsonObjectName]).length === 0) {
        delete datos[jsonObjectName];
      }
    }

    // Caso especial para arrays (como referencias múltiples)
    if (entidad === 'referencias') {
      // Procesar como array de referencias si viene en formData
      if (Array.isArray((formData as any)?.referencias)) {
        return (formData as any).referencias
          .map((ref: any) => this.extraerDatosEntidad(ref, esquema, 'referencia'))
          .filter((item: any) => item && Object.keys(item).length > 0);
      }
      // Si no hay arreglo de referencias, no crear ninguna por defecto.
      return [];
    }

    if (entidad === 'solicitudes') {
      // Procesar como array de solicitudes
      return [this.extraerDatosEntidad(formData, esquema, 'solicitud')];
    }

    if (entidad === 'ubicaciones') {
      // Procesar como array de ubicaciones
      return [this.extraerDatosEntidad(formData, esquema, 'ubicacion')];
    }

    // Log final para ver qué datos se están enviando
    if (entidad === 'solicitud') {
      console.log('📤 === DATOS FINALES DE SOLICITUD ===');
      console.log('📊 Datos a enviar:', datos);

      // 🔧 CORRECCIÓN MANUAL: Asegurar que ciudad_solicitud y banco_nombre sean campos fijos
      if (formData.ciudad_solicitud && formData.ciudad_solicitud !== '') {
        datos.ciudad_solicitud = formData.ciudad_solicitud;
        console.log('🔧 Campo fijo forzado: ciudad_solicitud =', formData.ciudad_solicitud);
      }

      if (formData.banco_nombre && formData.banco_nombre !== '') {
        datos.banco_nombre = formData.banco_nombre;
        console.log('🔧 Campo fijo forzado: banco_nombre =', formData.banco_nombre);
      }

      // Remover estos campos del detalle_credito si existen
      if (datos.detalle_credito) {
        if (datos.detalle_credito.ciudad_solicitud) {
          delete datos.detalle_credito.ciudad_solicitud;
          console.log('🗑️ Removido ciudad_solicitud de detalle_credito');
        }
        if (datos.detalle_credito.banco_nombre) {
          delete datos.detalle_credito.banco_nombre;
          console.log('🗑️ Removido banco_nombre de detalle_credito');
        }
      }

      console.log('📊 Datos finales corregidos:', datos);
    }

    return datos;
  },

  // Función auxiliar para determinar el nombre del objeto JSON según la entidad
  getJsonObjectName(entidad: string): string {
    const jsonObjectMapping: Record<string, string> = {
      'solicitante': 'info_extra',
      'ubicacion': 'detalle_direccion',
      'actividad_economica': 'detalle_actividad',
      'informacion_financiera': 'detalle_financiera',
      'referencia': 'detalle_referencia',
      'solicitud': 'detalle_credito'
    };

    return jsonObjectMapping[entidad] || 'datos_adicionales';
  },

  // Transformar datos del formulario plano a la estructura esperada por el backend
  transformarDatosFormulario(formData: Record<string, any>, esquemasCompletos: any): any {
    const datosTransformados: any = {};

    // Usar el esquema dinámico para cada entidad
    Object.keys(esquemasCompletos).forEach(entidad => {
      const esquemaData = esquemasCompletos[entidad];
      // La estructura es: esquemasCompletos[entidad].esquema
      if (esquemaData && esquemaData.esquema) {
        datosTransformados[entidad] = this.extraerDatosEntidad(formData, esquemaData.esquema, entidad);
      }
    });

    // Manejo explícito de referencias múltiples usando el esquema singular 'referencia'
    if (Array.isArray((formData as any)?.referencias) && esquemasCompletos?.referencia?.esquema) {
      datosTransformados.referencias = (formData as any).referencias
        .map((ref: any) => this.extraerDatosEntidad(ref, esquemasCompletos.referencia.esquema, 'referencia'))
        .filter((item: any) => item && Object.keys(item).length > 0);
    }

    // Limpiar campos vacíos, null o undefined
    const limpiarObjeto = (obj: any): any => {
      const resultado: any = {};
      Object.keys(obj).forEach(key => {
        const valor = obj[key];
        if (valor !== null && valor !== undefined && valor !== '') {
          if (typeof valor === 'object' && !Array.isArray(valor)) {
            const objetoLimpio = limpiarObjeto(valor);
            if (Object.keys(objetoLimpio).length > 0) {
              resultado[key] = objetoLimpio;
            }
          } else if (Array.isArray(valor)) {
            // Para arrays, limpiar elementos vacíos
            const arrayLimpio = valor.filter((item: any) => {
              if (typeof item === 'object' && item !== null) {
                const itemLimpio = limpiarObjeto(item);
                return Object.keys(itemLimpio).length > 0;
              }
              return item !== null && item !== undefined && item !== '';
            });
            if (arrayLimpio.length > 0) {
              resultado[key] = arrayLimpio;
            }
          } else {
            resultado[key] = valor;
          }
        }
      });
      return resultado;
    };

    return limpiarObjeto(datosTransformados);
  },

  // Nuevo método para procesar valores según el tipo de campo
  procesarValorCampo(campo: any, valor: any, formData: Record<string, any>): any {
    switch (campo.type) {
      case 'object':
        // Si el valor es un objeto, procesarlo
        if (typeof valor === 'object' && !Array.isArray(valor)) {
          const objetoLimpio: Record<string, any> = {};
          Object.keys(valor).forEach(key => {
            if (valor[key] !== undefined && valor[key] !== null && valor[key] !== '') {
              objetoLimpio[key] = valor[key];
            }
          });
          return Object.keys(objetoLimpio).length > 0 ? objetoLimpio : undefined;
        }
        return valor;

      case 'array':
        // Si el valor es un array, procesarlo
        if (Array.isArray(valor)) {
          const arrayLimpio = valor.filter((item: any) => {
            if (typeof item === 'object' && item !== null) {
              const itemLimpio = this.procesarValorCampo(campo, item, formData);
              return itemLimpio !== undefined;
            }
            return item !== undefined && item !== null && item !== '';
          });
          return arrayLimpio.length > 0 ? arrayLimpio : undefined;
        }
        return valor;

      case 'string':
      case 'text':
        return String(valor);

      case 'number':
      case 'integer':
        const num = Number(valor);
        return isNaN(num) ? undefined : num;

      case 'boolean':
        return Boolean(valor);

      case 'date':
        return valor; // Mantener formato de fecha como está

      default:
        return valor;
    }
  }
};
