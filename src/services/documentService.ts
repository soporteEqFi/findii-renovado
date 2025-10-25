import { API_CONFIG } from '../config/constants';
import { Document } from '../types';

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


  // Crear FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('solicitante_id', solicitanteId.toString());

  const headers = getFormDataHeaders();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData,
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta del servidor:', errorText);
      console.error('❌ URL que falló:', url);
      console.error('❌ Status:', response.status);
      throw new Error(`Error al subir documento: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error en fetch:', error);
    console.error('❌ URL que causó el error:', url);
    throw error;
  }
};

// Función para obtener documentos de un solicitante
export const getDocuments = async (solicitanteId: number): Promise<Document[]> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTOS}/?solicitante_id=${solicitanteId}`;

  // console.log('📥 === OBTENIENDO DOCUMENTOS DEL SOLICITANTE ===');
  // console.log('📍 URL de consulta:', url);
  // console.log('🆔 Solicitante ID:', solicitanteId);
  // console.log('🔗 Endpoint completo construido:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTOS}/?solicitante_id=${solicitanteId}`);
  // console.log('🔗 API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
  // console.log('🔗 API_CONFIG.ENDPOINTS.DOCUMENTOS:', API_CONFIG.ENDPOINTS.DOCUMENTOS);

  const headers = getFormDataHeaders();
  // console.log('📋 Headers de la petición:', headers);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    // console.log('📡 Respuesta recibida:', {
    //   status: response.status,
    //   statusText: response.statusText,
    //   ok: response.ok,
    //   headers: Object.fromEntries(response.headers.entries())
    // });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error al obtener documentos:', errorText);
      console.error('❌ URL que falló:', url);
      console.error('❌ Status:', response.status);
      throw new Error(`Error al obtener documentos: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Procesar la respuesta y normalizar posibles nombres de campos
    let rawDocuments: any[] = [];

    if (Array.isArray(result)) {
      rawDocuments = result;
    } else if (result && Array.isArray(result.data)) {
      rawDocuments = result.data;
    } else if (result && Array.isArray(result.documents)) {
      rawDocuments = result.documents;
    } else if (result && result.ok && Array.isArray(result.result)) {
      rawDocuments = result.result;
    } else {
      console.warn('⚠️ Resultado no contiene lista de documentos:', result);
      return [];
    }

    // Normalizar documentos a la interfaz Document esperada por el front
    const normalized: Document[] = rawDocuments
      .map((doc: any, idx: number) => {
        const id = doc.id || doc.documento_id || doc.document_id || doc.file_id || doc.uuid || idx + 1;
        const nombre =
          doc.nombre ||
          doc.filename ||
          doc.original_filename ||
          doc.file_name ||
          doc.name ||
          `Documento ${idx + 1}`;
        const possibleUrl =
          doc.documento_url ||
          doc.url ||
          doc.link ||
          doc.file_url ||
          (doc.path ? `${API_CONFIG.BASE_URL}${doc.path}` : null);
        const documento_url = possibleUrl || '';

        const file_size = doc.file_size || doc.size || undefined;

        return {
          id,
          nombre,
          documento_url,
          solicitante_id: doc.solicitante_id || solicitanteId,
          file_size,
        } as Document;
      })
      // Filtrar solo los que tengan URL resoluble
      .filter((d: Document) => !!d.documento_url);

    return normalized;
  } catch (error) {
    console.error('❌ Error en fetch getDocuments:', error);
    console.error('❌ URL que causó el error:', url);
    throw error;
  }
};

// Función para eliminar un documento
export const deleteDocument = async (documentId: number): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCUMENTOS}/${documentId}`;


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
