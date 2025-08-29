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
 * Obtiene la configuración de columnas desde la API
 * @param empresaId ID de la empresa
 * @returns Configuración de columnas
 */
export const fetchColumnConfig = async (empresaId: number): Promise<string[]> => {
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
      console.warn('No se pudo obtener configuración de columnas, usando columnas por defecto');
      return getDefaultColumns();
    }
  } catch (error) {
    console.error('Error cargando configuración de columnas:', error);
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
    [normalize('Dirección Residencia')]: 'direccion_residencia',
    [normalize('Celular')]: 'numero_celular',
    [normalize('Tipo Crédito')]: 'tipo_credito',
    [normalize('Banco')]: 'banco',
    [normalize('Estado')]: 'estado'
  };
};

/**
 * Obtiene el valor de una columna específica desde los datos del cliente
 */
export const getColumnValue = (customer: any, columnName: string): any => {
  // Debug logging
  console.log(`Getting value for column: ${columnName}`, customer);
  console.log(`Available fields:`, Object.keys(customer));
  
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
      console.log('Tipo Crédito - checking:', customer.tipo_credito, customer.tipo_de_credito);
      return customer.tipo_credito || customer.tipo_de_credito;
    
    case normalize('Banco'):
      console.log('Banco - checking:', customer.banco, customer.banco_nombre);
      return customer.banco || customer.banco_nombre;
    
    case normalize('Estado'):
      return customer.estado || customer.estado_solicitud;
    
    default:
      return customer[fieldName] || customer[columnName] || '';
  }
};
