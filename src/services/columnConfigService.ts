import { API_CONFIG, buildApiUrl } from '../config/constants';

export interface ColumnConfig {
  id: number;
  categoria: string;
  columnas: string[];
  descripcion: string;
  created_at: string;
  updated_at: string;
}

export interface ColumnConfigResponse {
  ok: boolean;
  data: ColumnConfig;
  message: string;
}

/**
 * Detecta automáticamente las columnas disponibles desde los datos procesados de clientes
 * @param customerData Datos de clientes ya procesados por useCustomers
 * @returns Array de nombres de columnas detectadas
 */
export const detectAvailableColumns = (customerData: any[]): string[] => {
  if (!customerData || customerData.length === 0) return getDefaultColumns();

  console.log('🔍 Detectando columnas desde:', customerData.length, 'registros de clientes procesados');
  console.log('📊 Primer registro procesado:', customerData[0]);

  const allFields = new Set<string>();

  // Analizar todos los registros de clientes procesados para encontrar campos con valores
  customerData.forEach(customer => {
    Object.keys(customer).forEach(key => {
      const value = customer[key];
      // Solo incluir campos que tienen valores no vacíos en al menos un registro
      if (value !== null && value !== undefined && value !== '' &&
          (typeof value === 'string' || typeof value === 'number')) {
        const fieldName = formatFieldName(key);
        console.log(`➕ Campo con valor detectado: ${key} -> ${fieldName} = ${value}`);
        allFields.add(fieldName);
      }
    });
  });

  // Filtrar campos no deseados y campos internos
  const filteredFields = Array.from(allFields).filter(field =>
    !['Id', 'Created At', 'Updated At', 'Empresa Id', 'Id Solicitante', 'Solicitante Id', 'Id Solicitud'].includes(field)
  );

  console.log('🎯 Campos detectados después del filtrado:', filteredFields);

  // Priorizar campos importantes al inicio
  const priorityFields = ['Fecha', 'Nombre', 'Número Documento', 'Correo', 'Estado', 'Celular', 'Tipo Crédito', 'Banco'];
  const otherFields = filteredFields.filter(field => !priorityFields.includes(field));

  const finalColumns = [...priorityFields.filter(field => filteredFields.includes(field)), ...otherFields];
  console.log('✅ Columnas finales ordenadas:', finalColumns);

  return finalColumns;
};

/**
 * Formatea el nombre de un campo de la API a un nombre de columna legible
 */
const formatFieldName = (fieldName: string): string => {
  const fieldMappings: Record<string, string> = {
    'created_at': 'Fecha',
    'nombres': 'Nombre',
    'primer_apellido': 'Nombre',
    'segundo_apellido': 'Nombre',
    'numero_documento': 'Número Documento',
    'correo': 'Correo',
    'correo_electronico': 'Correo',
    'celular': 'Celular',
    'numero_celular': 'Celular',
    'telefono': 'Teléfono',
    'ciudad_residencia': 'Ciudad Residencia',
    'ciudad_solicitud': 'Ciudad Solicitud',
    'departamento_residencia': 'Departamento Residencia',
    'direccion_residencia': 'Dirección Residencia',
    'tipo_credito': 'Tipo Crédito',
    'banco_nombre': 'Banco',
    'banco': 'Banco',
    'estado': 'Estado',
    'estado_solicitud': 'Estado',
    'monto_solicitado': 'Monto Solicitado',
    'valor_inmueble': 'Valor Inmueble',
    'plazo_tiempo': 'Plazo',
    'fecha_nacimiento': 'Fecha Nacimiento',
    'genero': 'Género',
    'tipo_identificacion': 'Tipo Documento',
    'nacionalidad': 'Nacionalidad',
    'personas_a_cargo': 'Personas a Cargo',
    'estado_civil': 'Estado Civil',
    'nivel_estudio': 'Nivel Estudio',
    'profesion': 'Profesión',
    'tipo_contrato': 'Tipo Contrato',
    'actividad_economica': 'Actividad Económica',
    'sector_economico': 'Sector Económico',
    'empresa': 'Empresa',
    'cargo': 'Cargo',
    'total_ingresos_mensuales': 'Ingresos Mensuales',
    'total_egresos_mensuales': 'Egresos Mensuales',
    'total_activos': 'Total Activos',
    'total_pasivos': 'Total Pasivos'
  };

  if (fieldMappings[fieldName]) {
    return fieldMappings[fieldName];
  }

  // Convertir snake_case a Title Case
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Obtiene la configuración de columnas desde la API o detecta automáticamente
 * @param empresaId ID de la empresa
 * @param apiData Datos de la API para detección automática (opcional)
 * @returns Configuración de columnas
 */
export const fetchColumnConfig = async (empresaId: number, apiData?: any[]): Promise<string[]> => {
  try {
    const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.COLUMNAS_TABLA)}?empresa_id=${empresaId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Empresa-Id': empresaId.toString()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ColumnConfigResponse = await response.json();

    if (result.ok && result.data?.columnas) {
      return result.data.columnas;
    } else {
      console.warn('No se pudo obtener configuración de columnas desde la API');
      // Si tenemos datos de la API, detectar automáticamente
      if (apiData && apiData.length > 0) {
        console.log('Detectando columnas automáticamente desde los datos de la API');
        return detectAvailableColumns(apiData);
      }
      return getDefaultColumns();
    }
  } catch (error) {
    console.error('Error cargando configuración de columnas:', error);
    // Si tenemos datos de la API, detectar automáticamente
    if (apiData && apiData.length > 0) {
      console.log('Detectando columnas automáticamente debido a error en la API');
      return detectAvailableColumns(apiData);
    }
    return getDefaultColumns();
  }
};

/**
 * Columnas por defecto en caso de error o falta de configuración
 */
export const getDefaultColumns = (): string[] => {
  return ['Fecha', 'Nombre', 'Número Documento', 'Correo', 'Estado'];
};

/**
 * Normaliza nombres de columnas: quita tildes, espacios extra y pone minúsculas
 */
const normalize = (s: string): string => {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/\s+/g, ' ') // colapsar espacios
    .trim();
};

/**
 * Mapeo de nombres de columnas a campos de la base de datos
 */
export const getColumnFieldMapping = (): Record<string, string> => {
  // Usamos claves normalizadas para soportar variantes de mayúsculas/tildes
  return {
    [normalize('Fecha')]: 'created_at',
    [normalize('Nombre')]: 'nombre_completo',
    [normalize('Número Documento')]: 'numero_documento',
    [normalize('Correo')]: 'correo_electronico',
    [normalize('Teléfono')]: 'telefono',
    [normalize('Ciudad')]: 'ciudad_gestion',
    [normalize('Ciudad Residencia')]: 'ciudad_gestion',
    [normalize('Ciudad Solicitud')]: 'ciudad_solicitud',
    [normalize('Dirección Residencia')]: 'direccion_residencia',
    [normalize('Celular')]: 'numero_celular',
    [normalize('Tipo Crédito')]: 'tipo_credito',
    [normalize('Banco')]: 'banco',
    [normalize('Estado')]: 'estado',
    [normalize('Monto Solicitado')]: 'monto_solicitado',
    [normalize('Valor Inmueble')]: 'valor_inmueble',
    [normalize('Plazo')]: 'plazo_tiempo',
    [normalize('Fecha Nacimiento')]: 'fecha_nacimiento',
    [normalize('Género')]: 'genero',
    [normalize('Tipo Documento')]: 'tipo_identificacion',
    [normalize('Nacionalidad')]: 'nacionalidad',
    [normalize('Personas a Cargo')]: 'personas_a_cargo',
    [normalize('Estado Civil')]: 'estado_civil',
    [normalize('Nivel Estudio')]: 'nivel_estudio',
    [normalize('Profesión')]: 'profesion',
    [normalize('Tipo Contrato')]: 'tipo_contrato',
    [normalize('Actividad Económica')]: 'actividad_economica',
    [normalize('Sector Económico')]: 'sector_economico',
    [normalize('Empresa')]: 'empresa',
    [normalize('Cargo')]: 'cargo',
    [normalize('Ingresos Mensuales')]: 'total_ingresos_mensuales',
    [normalize('Egresos Mensuales')]: 'total_egresos_mensuales',
    [normalize('Total Activos')]: 'total_activos',
    [normalize('Total Pasivos')]: 'total_pasivos'
  };
};

/**
 * Normaliza un string para comparación (sin acentos, espacios, minúsculas)
 */
const normalizeForComparison = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]/g, '_') // Reemplazar caracteres especiales con _
    .replace(/_+/g, '_') // Múltiples _ a uno solo
    .replace(/^_|_$/g, ''); // Remover _ al inicio y final
};

/**
 * Busca recursivamente un campo en un objeto JSON basado en el nombre de columna
 */
const findFieldRecursively = (obj: any, targetField: string, equivalences: Record<string, string> = {}): any => {
  if (!obj || typeof obj !== 'object') return null;

  const normalizedTarget = normalizeForComparison(targetField);

  // Verificar equivalencias primero
  if (equivalences[targetField]) {
    const equivalentField = equivalences[targetField];
    const result = findFieldRecursively(obj, equivalentField);
    if (result !== null) return result;
  }

  // Función recursiva para buscar en el objeto
  const searchInObject = (currentObj: any, path: string = ''): any => {
    if (!currentObj || typeof currentObj !== 'object') return null;

    // Primero buscar coincidencias exactas que no sean IDs
    for (const [key, value] of Object.entries(currentObj)) {
      const normalizedKey = normalizeForComparison(key);
      const currentPath = path ? `${path}.${key}` : key;
      // Coincidencia exacta - priorizar valores string no-ID
      if (normalizedKey === normalizedTarget) {
        if (typeof value === 'string' && value.trim() !== '') {
          return value;
        }
        if (typeof value === 'number' && !key.toLowerCase().includes('id')) {
          return value;
        }
      }
    }

    // Luego buscar coincidencias parciales que no sean IDs
    for (const [key, value] of Object.entries(currentObj)) {
      const normalizedKey = normalizeForComparison(key);
      const currentPath = path ? `${path}.${key}` : key;

      // Coincidencia parcial - evitar campos que contengan 'id'
      if ((normalizedKey.includes(normalizedTarget) || normalizedTarget.includes(normalizedKey)) &&
          !key.toLowerCase().includes('id') &&
          !key.toLowerCase().includes('_id')) {
        if (typeof value === 'string' && value.trim() !== '') {
          return value;
        }
        if (typeof value === 'number') {
          return value;
        }
      }
    }

    // Buscar recursivamente en objetos anidados
    for (const [key, value] of Object.entries(currentObj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const result = searchInObject(value, path ? `${path}.${key}` : key);
        if (result !== null) return result;
      }
    }

    return null;
  };

  return searchInObject(obj);
};

/**
 * Diccionario de equivalencias para mapear nombres de columnas a campos JSON
 */
const getFieldEquivalences = (): Record<string, string> => {
  return {
    'Correo': 'correo',
    'Tipo Actividad Económica': 'tipo_actividad_economica',
    'Monto Solicitado': 'monto_solicitado',
    'Banco': 'banco_nombre',
    'Ciudad Solicitud': 'ciudad_solicitud',
    'Tipo Crédito': 'tipo_credito',
    'Plazo Tiempo': 'plazo_tiempo',
    'Valor Inmueble': 'valor_inmueble',
    'Total Ingresos Mensuales': 'total_ingresos_mensuales',
    'Total Egresos Mensuales': 'total_egresos_mensuales',
    'Nacionalidad': 'nacionalidad',
    'Personas A Cargo': 'personas_a_cargo'
  };
};

/**
 * Obtiene el valor de una columna específica desde los datos del cliente
 */
export const getColumnValue = (customer: any, columnName: string): any => {
  const fieldMapping = getColumnFieldMapping();
  const n = normalize(columnName);
  const fieldName = fieldMapping[n] || n.replace(/\s+/g, '_');

  // Casos especiales para campos que pueden tener múltiples fuentes
  switch (n) {
    case normalize('Nombre'):
      return customer.nombre_completo ||
             `${customer.nombres || ''} ${customer.primer_apellido || ''}`.trim() ||
             customer.nombres;

    case normalize('Ciudad'):
      return customer.ciudad_gestion ||
             customer.ciudad_residencia ||
             customer.ciudad_solicitud ||
             customer.ciudad;

    case normalize('Ciudad Residencia'):
      return customer.ciudad_gestion || customer.ciudad_residencia;

    case normalize('Ciudad Solicitud'):
      return customer.ciudad_solicitud;

    case normalize('Dirección Residencia'):
      return customer.direccion_residencia;

    case normalize('Correo'):
      return customer.correo_electronico ||
             customer.correo;

    case normalize('Teléfono'):
      return customer.telefono ||
             customer.info_extra?.telefono;

    case normalize('Celular'):
      return customer.numero_celular || customer.celular || customer.telefono;

    case normalize('Tipo Crédito'):
      return customer.tipo_credito || customer.tipo_de_credito;

    case normalize('Banco'):
      return customer.banco || customer.banco_nombre;

    case normalize('Estado'):
      return customer.estado || customer.estado_solicitud;

    case normalize('Monto Solicitado'):
      return customer.monto_solicitado;

    case normalize('Valor Inmueble'):
      return customer.valor_inmueble;

    case normalize('Plazo'):
      return customer.plazo_tiempo;

    case normalize('Fecha Nacimiento'):
      return customer.fecha_nacimiento;

    case normalize('Género'):
      return customer.genero;

    case normalize('Tipo Documento'):
      return customer.tipo_identificacion || customer.tipo_documento;

    case normalize('Nacionalidad'):
      return customer.nacionalidad;

    case normalize('Personas a Cargo'):
      return customer.personas_a_cargo;

    case normalize('Estado Civil'):
      return customer.estado_civil;

    case normalize('Nivel Estudio'):
      return customer.nivel_estudio;

    case normalize('Profesión'):
      return customer.profesion;

    case normalize('Tipo Contrato'):
      return customer.tipo_contrato || customer.tipo_de_contrato;

    case normalize('Actividad Económica'):
    case normalize('Tipo Actividad Económica'):
      // Usar búsqueda recursiva específica para actividad económica
      const actividadValue = findFieldRecursively(customer, 'tipo_actividad_economica', getFieldEquivalences());
      if (actividadValue && typeof actividadValue === 'string' && actividadValue.trim() !== '') {
        return actividadValue;
      }

      // Fallback a fuentes alternativas
      const sources = [
        customer.actividad_economica,
        customer.sector_economico,
        customer.empresa,
        customer.empresa_labora,
        customer.cargo,
        customer.profesion
      ];

      for (const source of sources) {
        if (source && typeof source === 'string' && source.trim() !== '') {
          return source;
        }
        if (source && typeof source === 'object') {
          const objValue = source.sector_economico || source.nombre || source.descripcion || source.tipo_actividad;
          if (objValue && typeof objValue === 'string' && objValue.trim() !== '') {
            return objValue;
          }
        }
      }

      console.log('❌ No se encontró actividad económica');
      return '';

    case normalize('Sector Económico'):
      return customer.sector_economico;

    case normalize('Empresa'):
      return customer.empresa || customer.empresa_labora;

    case normalize('Cargo'):
      return customer.cargo || customer.cargo_actual;

    case normalize('Ingresos Mensuales'):
      return customer.total_ingresos_mensuales || customer.ingresos;

    case normalize('Egresos Mensuales'):
      return customer.total_egresos_mensuales || customer.egresos;

    case normalize('Total Activos'):
      return customer.total_activos;

    case normalize('Total Pasivos'):
      return customer.total_pasivos;

    default:
      // Usar búsqueda recursiva con equivalencias
      const equivalences = getFieldEquivalences();
      const foundValue = findFieldRecursively(customer, columnName, equivalences);

      if (foundValue !== null && foundValue !== undefined && foundValue !== '') {
        return foundValue;
      }

      // Fallback a métodos anteriores
      console.log(`🔄 Fallback: buscando valor para columna: ${columnName}`);

      let directValue = customer[fieldName] || customer[columnName];

      if (directValue && typeof directValue === 'object') {
        if (directValue.nombre) directValue = directValue.nombre;
        else if (directValue.descripcion) directValue = directValue.descripcion;
        else if (directValue.valor) directValue = directValue.valor;
        else if (directValue.texto) directValue = directValue.texto;
        else directValue = JSON.stringify(directValue);
      }

      if (directValue !== undefined && directValue !== null && directValue !== '') {
        return directValue;
      }

      const snakeCaseField = columnName.toLowerCase().replace(/\s+/g, '_');
      let snakeCaseValue = customer[snakeCaseField];

      if (snakeCaseValue && typeof snakeCaseValue === 'object') {
        if (snakeCaseValue.nombre) snakeCaseValue = snakeCaseValue.nombre;
        else if (snakeCaseValue.descripcion) snakeCaseValue = snakeCaseValue.descripcion;
        else if (snakeCaseValue.valor) snakeCaseValue = snakeCaseValue.valor;
        else if (snakeCaseValue.texto) snakeCaseValue = snakeCaseValue.texto;
        else snakeCaseValue = JSON.stringify(snakeCaseValue);
      }

      if (snakeCaseValue !== undefined && snakeCaseValue !== null && snakeCaseValue !== '') {
        return snakeCaseValue;
      }

      console.log(`❌ No se encontró valor para: ${columnName}`);
      return '';
  }
};
