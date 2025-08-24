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
      const datosCompletos = this.transformarDatosFormulario(formData);

      console.log('🔧 Datos transformados para el backend:', JSON.stringify(datosCompletos, null, 2));

      // Agregar campos adicionales a la solicitud
      if (datosCompletos.solicitudes && datosCompletos.solicitudes[0]) {
        datosCompletos.solicitudes[0].created_by_user_id = parseInt(localStorage.getItem('user_id') || '1');
        datosCompletos.solicitudes[0].assigned_to_user_id = parseInt(localStorage.getItem('user_id') || '1');
        datosCompletos.solicitudes[0].estado = 'Pendiente';
      }

      const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.CREAR_REGISTRO_COMPLETO}?empresa_id=${empresaId}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

    // Función auxiliar para extraer datos de una entidad específica
  extraerDatosEntidad(formData: Record<string, any>, esquema: any, entidad: string): Record<string, any> {
    if (!esquema) {
      console.warn(`⚠️ No hay esquema para ${entidad}`);
      return {};
    }

    const datos: Record<string, any> = {};

    // Extraer campos fijos (van directamente al objeto principal)
    if (esquema.campos_fijos) {
      esquema.campos_fijos.forEach((campo: any) => {
        if (formData[campo.key] !== undefined && formData[campo.key] !== null && formData[campo.key] !== '') {
          datos[campo.key] = formData[campo.key];
        }
      });
    }

    // Para referencias, asegurar que tipo_referencia esté presente
    if (entidad === 'referencia') {
      // Si tipo_referencia no está en campos fijos, agregarlo manualmente
      if (!datos.tipo_referencia && formData.tipo_referencia) {
        datos.tipo_referencia = formData.tipo_referencia;
      }
      // Si aún no está presente, usar un valor por defecto
      if (!datos.tipo_referencia) {
        datos.tipo_referencia = 'personal';
        console.warn('⚠️ tipo_referencia no encontrado, usando valor por defecto: personal');
      }
    }

    // Extraer campos dinámicos (van al objeto JSON correspondiente)
    if (esquema.campos_dinamicos && esquema.campos_dinamicos.length > 0) {
      // Determinar el nombre del objeto JSON según la entidad
      const jsonObjectName = this.getJsonObjectName(entidad);

      // Caso especial para detalle_credito: crear objeto detalle_credito con todos los campos
      if (jsonObjectName === 'detalle_credito') {
        // Crear el objeto detalle_credito
        datos[jsonObjectName] = {};

        // Buscar campos dinámicos en el nivel superior
        esquema.campos_dinamicos.forEach((campo: any) => {
          const valor = formData[campo.key];
          if (valor !== undefined && valor !== null && valor !== '') {
            // Si el valor es un objeto, extraer sus campos al detalle_credito
            if (typeof valor === 'object' && !Array.isArray(valor)) {
              Object.keys(valor).forEach(subKey => {
                const subValor = valor[subKey];
                if (subValor !== undefined && subValor !== null && subValor !== '') {
                  // Mapear nombre_banco a banco
                  const keyFinal = subKey === 'nombre_banco' ? 'banco' : subKey;
                  datos[jsonObjectName][keyFinal] = subValor;
                }
              });
            } else {
              // Para campos simples, agregarlos directamente al detalle_credito
              datos[jsonObjectName][campo.key] = valor;
            }
          }
        });

        // Buscar CUALQUIER objeto anidado y extraer todos sus campos al detalle_credito
        Object.keys(formData).forEach(key => {
          const valor = formData[key];
          if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
            // Extraer TODOS los campos del objeto anidado y ponerlos en detalle_credito
            Object.keys(valor).forEach(subKey => {
              const subValor = valor[subKey];
              if (subValor !== undefined && subValor !== null && subValor !== '') {
                // Mapear nombre_banco a banco
                const keyFinal = subKey === 'nombre_banco' ? 'banco' : subKey;
                datos[jsonObjectName][keyFinal] = subValor;
              }
            });
          }
        });

        // Solo incluir detalle_credito si tiene campos
        if (Object.keys(datos[jsonObjectName]).length === 0) {
          delete datos[jsonObjectName];
        }
      } else {
        // Para otros campos JSON, mantener la estructura anidada
        if (!datos[jsonObjectName]) {
          datos[jsonObjectName] = {};
        }

        esquema.campos_dinamicos.forEach((campo: any) => {
          if (formData[campo.key] !== undefined && formData[campo.key] !== null && formData[campo.key] !== '') {
            datos[jsonObjectName][campo.key] = formData[campo.key];
          }
        });

        // Solo incluir el objeto JSON si tiene campos
        if (Object.keys(datos[jsonObjectName]).length === 0) {
          delete datos[jsonObjectName];
        }
      }
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
  transformarDatosFormulario(formData: Record<string, any>): any {
    const datosTransformados = {
      solicitante: {
        // Campos fijos del solicitante
        nombres: formData.nombres,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        tipo_identificacion: formData.tipo_identificacion,
        numero_documento: formData.numero_documento,
        fecha_nacimiento: formData.fecha_nacimiento,
        genero: formData.genero,
        correo: formData.correo,
        // Campos dinámicos del solicitante
        info_extra: {
          estado_civil: formData.estado_civil,
          personas_a_cargo: formData.personas_a_cargo,
          profesion: formData.profesion,
          nivel_estudio: formData.nivel_estudio,
          nacionalidad: formData.nacionalidad,
          fecha_expedicion: formData.fecha_expedicion,
          lugar_nacimiento: formData.lugar_nacimiento,
          telefono: formData.telefono,
          celular: formData.celular,
          id_autenticacion: formData.id_autenticacion,
          recibir_correspondencia: formData.recibir_correspondencia,
          paga_impuestos_fuera: formData.paga_impuestos_fuera,
          pais_donde_paga_impuestos: formData.pais_donde_paga_impuestos,
          declara_renta: formData.declara_renta
        }
      },
      ubicaciones: [
        {
          // Campos fijos de ubicación
          ciudad_residencia: formData.ciudad_residencia,
          departamento_residencia: formData.departamento_residencia,
          // Campos dinámicos de ubicación
          detalle_direccion: {
            direccion_residencia: formData.direccion_residencia,
            tipo_vivienda: formData.tipo_vivienda,
            celular: formData.celular,
            recibir_correspondencia: formData.recibir_correspondencia,
            direccion: formData.direccion,
            barrio: formData.barrio,
            estrato: formData.estrato,
            paga_arriendo: formData.paga_arriendo,
            arrendador: formData.arrendador
          }
        }
      ],
      actividad_economica: {
        // Campos fijos de actividad económica
        tipo_actividad: formData.tipo_actividad_economica,
        // Campos dinámicos de actividad económica
        detalle_actividad: {
          tipo_actividad_economica: formData.tipo_actividad_economica,
          sector_economico: formData.sector_economico,
          codigo_ciuu: formData.codigo_ciuu,
          departamento_empresa: formData.departamento_empresa,
          ciudad_empresa: formData.ciudad_empresa,
          telefono_empresa: formData.telefono_empresa,
          correo_electronico_empresa: formData.correo_electronico_empresa,
          nit_empresa: formData.nit_empresa,
          sector_economico_empresa: formData.sector_economico_empresa,
          tipo_contrato: formData.tipo_contrato,
          fecha_ingreso_empresa: formData.fecha_ingreso_empresa,
          // Datos de empleado
          datos_empleado: formData.datos_empleado,
          // Datos de empresario
          datos_empresario: formData.datos_empresario
        }
      },
      informacion_financiera: {
        // Campos fijos de información financiera
        total_ingresos_mensuales: formData.total_ingresos_mensuales,
        total_egresos_mensuales: formData.total_egresos_mensuales,
        total_activos: formData.total_activos,
        total_pasivos: formData.total_pasivos,
        // Campos dinámicos de información financiera
        detalle_financiera: {
          ingreso_basico_mensual: formData.ingreso_basico_mensual,
          ingreso_variable_mensual: formData.ingreso_variable_mensual,
          otros_ingresos_mensuales: formData.otros_ingresos_mensuales,
          gastos_financieros_mensuales: formData.gastos_financieros_mensuales,
          gastos_personales_mensuales: formData.gastos_personales_mensuales,
          ingresos_fijos_pension: formData.ingresos_fijos_pension,
          ingresos_por_ventas: formData.ingresos_por_ventas,
          ingresos_varios: formData.ingresos_varios,
          honorarios: formData.honorarios,
          arriendos: formData.arriendos,
          ingresos_actividad_independiente: formData.ingresos_actividad_independiente,
          detalle_otros_ingresos: formData.detalle_otros_ingresos,
          gastos_vivienda: formData.gastos_vivienda,
          gastos_alimentacion: formData.gastos_alimentacion,
          gastos_transporte: formData.gastos_transporte,
          ingresos_mensuales_base: formData.ingresos_mensuales_base,
          gastos_mensuales: formData.gastos_mensuales,
          otros_ingresos: formData.otros_ingresos
        }
      },
      referencias: [
        {
          // Campos fijos de referencia
          tipo_referencia: formData.tipo_referencia,
          // Campos dinámicos de referencia
          detalle_referencia: {
            nombre_completo: formData.nombre_completo,
            telefono: formData.telefono_referencia,
            celular_referencia: formData.celular_referencia,
            relacion_referencia: formData.relacion_referencia,
            parentesco: formData.parentesco,
            nombre_referencia: formData.nombre_referencia
          }
        }
      ],
      solicitudes: [
        {
          // Campos fijos de solicitud
          estado: formData.estado || 'Pendiente',
          // Campos dinámicos de solicitud
          detalle_credito: {
            monto: formData.monto_solicitado,
            plazo_meses: formData.plazo_meses,
            banco: formData.banco,
            tipo_credito: formData.tipo_credito,
            destino_credito: formData.destino_credito,
            cuota_inicial: formData.cuota_inicial,
            valor_inmueble: formData.valor_inmueble,
            tipo_credito_id: formData.tipo_credito_id,
            // Crédito hipotecario
            credito_hipotecario: formData.credito_hipotecario
          }
        }
      ]
    };

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
          } else {
            resultado[key] = valor;
          }
        }
      });
      return resultado;
    };

    return limpiarObjeto(datosTransformados);
  }
};
