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
 * Obtiene la configuración de columnas desde la nueva API de configuración de tabla
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

    const result = await response.json();

    if (result.ok && result.data?.columnas) {
      // Filtrar solo las columnas activas y ordenarlas
      const columnasActivas = result.data.columnas
        .filter((col: any) => col.activo)
        .sort((a: any, b: any) => a.orden - b.orden)
        .map((col: any) => col.nombre);

      console.log('✅ Columnas cargadas desde configuración:', columnasActivas);
      return columnasActivas;
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
    [normalize('Total Pasivos')]: 'total_pasivos',
    [normalize('Creado por')]: 'created_by_user_name'
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
    'Personas A Cargo': 'personas_a_cargo',
    'Creado por': 'created_by_user_name'
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
    case normalize('Nombres'):
      return customer.nombre_completo ||
             `${customer.nombres || ''} ${customer.primer_apellido || ''}`.trim() ||
             customer.nombres;

    case normalize('Numero Documento'):
      return customer.numero_documento;

    case normalize('Ciudad Residencia'):
      return customer.ciudad_residencia || customer.ciudad_gestion;

    case normalize('Correo'):
      return customer.correo || customer.correo_electronico;

    case normalize('Celular'):
      return customer.celular || customer.numero_celular || customer.telefono;

    case normalize('Tipo Credito'):
      return customer.tipo_credito || customer.tipo_de_credito;

    case normalize('Tipo Actividad Economica'):
      // Buscar en la estructura anidada de actividad_economica
      if (customer.actividad_economica?.detalle_actividad?.tipo_actividad_economica) {
        return customer.actividad_economica.detalle_actividad.tipo_actividad_economica;
      }
      return customer.tipo_actividad_economica || customer.actividad_economica;

    case normalize('Banco'):
      return customer.banco_nombre || customer.banco;

    case normalize('Ciudad Solicitud'):
      return customer.ciudad_solicitud;

    case normalize('Estado'):
      return customer.estado || customer.estado_solicitud;

    case normalize('Fecha Nacimiento'):
      return customer.fecha_nacimiento;

    case normalize('Genero'):
      return customer.genero;

    case normalize('Tipo Identificacion'):
      return customer.tipo_identificacion || customer.tipo_documento;

    case normalize('Nacionalidad'):
      return customer.nacionalidad;

    case normalize('Personas A Cargo'):
      return customer.personas_a_cargo;

    case normalize('Estado Civil'):
      return customer.estado_civil;

    case normalize('Nivel Estudio'):
      return customer.nivel_estudio;

    case normalize('Profesion'):
      return customer.profesion;

    case normalize('Telefono'):
      return customer.telefono || customer.numero_celular;

    case normalize('Monto Solicitado'):
      return customer.monto_solicitado;

    case normalize('Plazo Tiempo'):
      return customer.plazo_tiempo;

    case normalize('Creado por'):
      return customer.created_by_user_name;

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
