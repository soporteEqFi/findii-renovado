import { CreditType } from '../types/creditTypes';
import { cacheService } from './cacheService';
import { API_CONFIG } from '../config/constants';

const API_URL = API_CONFIG.BASE_URL;

// Variable para rastrear requests en progreso
let pendingRequests: Map<string, Promise<CreditType[]>> = new Map();

// Función auxiliar para convertir una cadena de camelCase a snake_case
const camelToSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Función para convertir todas las claves de un objeto de snake_case a camelCase
const convertKeysToCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    // Convertir snake_case a camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Convertir valores específicos que sabemos que vienen del backend
    let value = obj[key];
    
    // Si es un campo con display_name, convertirlo a displayName
    if (key === 'display_name') {
      acc['displayName'] = value;
    }
    // Si es un campo con field_type, convertirlo a fieldType
    else if (key === 'field_type') {
      acc['fieldType'] = value;
    }
    // Si es un campo con is_required, convertirlo a isRequired
    else if (key === 'is_required') {
      acc['isRequired'] = value;
    }
    // Si es un campo con is_active, convertirlo a isActive
    else if (key === 'is_active') {
      acc['isActive'] = value;
      console.log(`Convirtiendo is_active (${value}) a isActive`);
    }
    // Para el resto, usar la conversión general
    else {
      acc[camelKey] = convertKeysToCamelCase(value);
    }
    
    return acc;
  }, {} as any);
};

// Función para convertir todas las claves de un objeto de camelCase a snake_case
const convertKeysToSnakeCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCase(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnakeCase(key);
    acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
    return acc;
  }, {} as any);
};

// Función de test para verificar la conversión
// const testConversion = () => {
//   const testField = {
//     id: 'test-id',
//     name: 'testName',
//     displayName: 'Test Display Name',
//     fieldType: 'text',
//     order: 1,
//     isRequired: true,
//     validation: { required: true },
//     options: ['option1', 'option2'],
//     defaultValue: 'default'
//   };
  
  // const converted = convertKeysToSnakeCase(testField);
  // console.log('=== TEST CONVERSIÓN ===');
  // console.log('Original:', testField);
  // console.log('Convertido:', converted);
  // console.log('=== FIN TEST ===');
// };

// Ejecutar test una vez al cargar el módulo
// testConversion();

const CREDIT_TYPES_CACHE_KEY = 'credit_types';

export const getCreditTypes = async (cedula: string): Promise<CreditType[]> => {
  // Crear una clave única para este request
  const requestKey = `credit_types_${cedula}`;
  
  // Si ya hay un request en progreso para esta cédula, retornar la promesa existente
  if (pendingRequests.has(requestKey)) {
    console.log('Request en progreso detectado, reutilizando promesa existente');
    return pendingRequests.get(requestKey)!;
  }

  // Intentar obtener los datos del caché
  const cachedData = cacheService.get<CreditType[]>(`${CREDIT_TYPES_CACHE_KEY}_${cedula}`);
  if (cachedData) {
    console.log('Usando datos en caché para tipos de crédito');
    return cachedData;
  }

  // Crear la nueva promesa para el request
  const requestPromise = (async () => {
    try {
      // Si no hay caché, hacer la petición a la API
      console.log('Obteniendo tipos de crédito desde la API');
      const response = await fetch(`${API_URL}/get-all-credit-types/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedula
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al obtener tipos de crédito');
      }
      
      const responseData = await response.json();
      const creditTypesRaw = responseData.data || [];
      
      // console.log('=== DATOS RAW DEL BACKEND ===');
      // console.log('Tipos de crédito raw:', creditTypesRaw);
      
      // Mostrar un ejemplo de campos raw
      // if (creditTypesRaw.length > 0 && creditTypesRaw[0].fields) {
      //   console.log('Ejemplo de campos raw del primer tipo:', creditTypesRaw[0].fields);
      // }
      
      // Convertir los datos de snake_case a camelCase
      const creditTypes = Array.isArray(creditTypesRaw) 
        ? creditTypesRaw.map(creditType => {
            const converted = convertKeysToCamelCase(creditType);
            console.log('Tipo convertido:', converted);
            console.log(`Estado isActive: ${converted.isActive} (tipo: ${typeof converted.isActive})`);
            if (converted.fields) {
              console.log('Campos convertidos:', converted.fields);
            }
            return converted;
          })
        : [];
      
      // console.log('=== DATOS CONVERTIDOS ===');
      // console.log('Tipos de crédito convertidos:', creditTypes);
      
      // Guardar los datos en el caché
      if (Array.isArray(creditTypes)) {
        cacheService.set(`${CREDIT_TYPES_CACHE_KEY}_${cedula}`, creditTypes);
      }
      
      return creditTypes;
    } finally {
      // Limpiar la promesa del mapa cuando termine
      pendingRequests.delete(requestKey);
    }
  })();

  // Guardar la promesa en el mapa
  pendingRequests.set(requestKey, requestPromise);
  
  return requestPromise;
};

// Función para limpiar el caché de tipos de crédito
export const clearCreditTypesCache = (cedula: string): void => {
  cacheService.clear(`${CREDIT_TYPES_CACHE_KEY}_${cedula}`);
  // También limpiar cualquier request pendiente para esta cédula
  const requestKey = `credit_types_${cedula}`;
  pendingRequests.delete(requestKey);
};

// Función para limpiar todos los requests pendientes (útil para debugging)
export const clearAllPendingRequests = (): void => {
  pendingRequests.clear();
  console.log('Todos los requests pendientes han sido limpiados');
};

export const getCreditTypeById = async (id: string): Promise<CreditType> => {
  const response = await fetch(`${API_URL}/credit-types/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al obtener tipo de crédito');
  }
  
  return await response.json();
};

export const createCreditType = async (creditType: CreditType, cedula: string): Promise<CreditType> => {
  // Asegurarse de que cada campo tenga un id
  const creditTypeWithIds = {
    ...creditType,
    id: creditType.id || '',
    fields: creditType.fields.map(field => ({
      ...field,
      id: field.id || '',
    })),
  };
  const snakeCaseCreditType = convertKeysToSnakeCase(creditTypeWithIds);
  
  const response = await fetch(`${API_URL}/add-credit-type/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credit_type: snakeCaseCreditType,
      cedula: cedula
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al crear tipo de crédito');
  }
  
  return await response.json();
};

export const updateCreditType = async (creditType: CreditType): Promise<CreditType> => {
  console.log('=== INICIO updateCreditType ===');
  console.log('CreditType recibido:', creditType);
  console.log('Campos antes del procesamiento:', creditType.fields);
  
  // Asegurarse de que cada campo tenga un id
  const creditTypeWithIds = {
    ...creditType,
    id: creditType.id || '',
    fields: creditType.fields.map(field => ({
      ...field,
      id: field.id || '',
    })),
  };
  
  console.log('CreditType con IDs:', creditTypeWithIds);
  console.log('Campos con IDs:', creditTypeWithIds.fields);
  
  // Convertir todas las propiedades de camelCase a snake_case
  const snakeCaseCreditType = convertKeysToSnakeCase(creditTypeWithIds);
  console.log('=== DATOS ENVIADOS AL BACKEND ===');
  console.log('Payload completo:', JSON.stringify(snakeCaseCreditType, null, 2));
  console.log('Campos en snake_case:', snakeCaseCreditType.fields);
  console.log('=== FIN updateCreditType ===');
  
  const response = await fetch(`${API_URL}/edit-credit-type/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snakeCaseCreditType),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Error al actualizar tipo de crédito');
  }
  
  return await response.json();
};

export const deleteCreditType = async (id: string): Promise<void> => {
  console.log('=== ELIMINANDO TIPO DE CRÉDITO ===');
  console.log('ID a eliminar:', id);
  console.log('URL del endpoint:', `${API_URL}/delete-credit-type/`);
  
  const requestBody = { id };
  console.log('Body de la petición:', requestBody);
  
  try {
    const response = await fetch(`${API_URL}/delete-credit-type/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Status de la respuesta:', response.status);
    console.log('Status text:', response.statusText);
    console.log('Headers de la respuesta:', response.headers);
    
    // Intentar leer el cuerpo de la respuesta
    const responseText = await response.text();
    console.log('Respuesta completa del servidor:', responseText);
    
    if (!response.ok) {
      let errorMessage = `Error al eliminar tipo de crédito: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.log('No se pudo parsear la respuesta como JSON');
      }
      throw new Error(errorMessage);
    }
    
    // Intentar parsear la respuesta como JSON si es exitosa
    let responseData = null;
    try {
      responseData = JSON.parse(responseText);
      console.log('Respuesta exitosa parseada:', responseData);
    } catch (e) {
      console.log('Respuesta exitosa pero no es JSON válido');
    }
    
    console.log('Tipo de crédito eliminado exitosamente');
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
};