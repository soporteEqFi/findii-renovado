import { API_CONFIG } from '../config/constants';

// Función para obtener headers con autenticación (sin Content-Type para FormData)
const getFormDataHeaders = (): HeadersInit => {
  const headers: HeadersInit = {};
  
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // No incluir Content-Type para FormData - el navegador lo establece automáticamente
  return headers;
};

// Función para subir documentos
export const uploadDocument = async (file: File, solicitanteId: number): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTOS}/`;
  
  console.log('🌐 === INICIANDO SUBIDA DE DOCUMENTO INDIVIDUAL ===');
  console.log('📍 URL de destino:', url);
  console.log('📄 Archivo a subir:', {
    nombre: file.name,
    tamaño: `${(file.size / 1024).toFixed(2)} KB`,
    tipo: file.type
  });
  console.log('🆔 Solicitante ID:', solicitanteId);
  
  // Crear FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('solicitante_id', solicitanteId.toString());
  
  console.log('📦 FormData creado con:');
  console.log('  - file:', file.name);
  console.log('  - solicitante_id:', solicitanteId.toString());
  
  // Log de headers
  const headers = getFormDataHeaders();
  console.log('📋 Headers de la petición:', headers);
  
  console.log('🚀 Enviando petición POST...');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: formData,
  });

  console.log('📡 Respuesta recibida:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error en la respuesta del servidor:', errorText);
    throw new Error(`Error al subir documento: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Documento subido exitosamente:', result);
  return result;
};

// Función para obtener documentos de un solicitante
export const getDocuments = async (solicitanteId: number): Promise<any[]> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTOS}/?solicitante_id=${solicitanteId}`;
  
  console.log('📥 === OBTENIENDO DOCUMENTOS DEL SOLICITANTE ===');
  console.log('📍 URL de consulta:', url);
  console.log('🆔 Solicitante ID:', solicitanteId);
  console.log('🔗 Endpoint completo construido:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTOS}/?solicitante_id=${solicitanteId}`);
  
  const headers = getFormDataHeaders();
  console.log('📋 Headers de la petición:', headers);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
  });

  console.log('📡 Respuesta recibida:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error al obtener documentos:', errorText);
    throw new Error(`Error al obtener documentos: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Documentos obtenidos exitosamente:', result);
  return result;
};

// Función para eliminar un documento
export const deleteDocument = async (documentId: number): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTOS}/${documentId}`;
  
  console.log('🗑️ === ELIMINANDO DOCUMENTO ===');
  console.log('📍 URL de eliminación:', url);
  console.log('🆔 Document ID:', documentId);
  
  const headers = getFormDataHeaders();
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error al eliminar documento:', errorText);
    throw new Error(`Error al eliminar documento: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Documento eliminado exitosamente:', result);
  return result;
};

// Función para subir múltiples documentos
export const uploadMultipleDocuments = async (files: File[], solicitanteId: number): Promise<any[]> => {
  const uploadPromises = files.map(file => uploadDocument(file, solicitanteId));
  return Promise.all(uploadPromises);
};

export const documentService = {
  uploadDocument,
  uploadMultipleDocuments,
  getDocuments,
  deleteDocument,
};
