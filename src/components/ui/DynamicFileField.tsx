import React, { useState, useRef } from 'react';
import { FileFieldConfig } from '../../types/fieldDefinition';
import { Upload, X, File, Download, Trash2 } from 'lucide-react';

interface DynamicFileFieldProps {
  value?: any;
  onChange: (value: any) => void;
  config: FileFieldConfig;
  label: string;
  required?: boolean;
  disabled?: boolean;
  entityId: number;
  entityType: string;
  jsonColumn: string;
  fieldKey: string;
}

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploaded_at: string;
  description?: string;
  [key: string]: any; // Para campos adicionales configurados
}

export const DynamicFileField: React.FC<DynamicFileFieldProps> = ({
  value,
  onChange,
  config,
  label,
  required = false,
  disabled = false,
  entityId,
  entityType,
  jsonColumn,
  fieldKey
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalizar el valor a array
  const files: FileItem[] = (() => {
    if (!value) return [];

    // Si ya es un array, usarlo directamente
    if (Array.isArray(value)) return value;

    // Si es un objeto con estructura de archivo, convertirlo a array
    if (typeof value === 'object' && value !== null) {
      // Verificar si tiene propiedades de archivo
      if (value.name || value.url || value.size) {
        return [value as FileItem];
      }
    }

    // Si es un string (URL), crear objeto de archivo
    if (typeof value === 'string') {
      return [{
        id: `existing-${Date.now()}`,
        name: 'Archivo existente',
        size: 0,
        type: 'unknown',
        url: value,
        uploaded_at: new Date().toISOString(),
        description: ''
      }];
    }

    return [];
  })();

  // Tipos de archivo permitidos
  const allowedTypes = config.allowed_types || ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'];
  const maxSize = config.max_size_mb || 10; // 10MB por defecto
  const multiple = config.multiple || false;
  const requiredFields = config.required_fields || [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) return;

    // Validar archivos
    const validFiles = selectedFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const isValidType = allowedTypes.includes(extension || '');
      const isValidSize = file.size <= maxSize * 1024 * 1024;

      if (!isValidType) {
        alert(`Tipo de archivo no permitido: ${file.name}. Tipos permitidos: ${allowedTypes.join(', ')}`);
      }

      if (!isValidSize) {
        alert(`Archivo demasiado grande: ${file.name}. Tamaño máximo: ${maxSize}MB`);
      }

      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    // Simular subida de archivos (aquí se integraría con el servicio real)
    uploadFiles(validFiles);
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: FileItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Simular progreso de subida
        setUploadProgress((i / files.length) * 100);

        // Crear objeto de archivo
        const fileItem: FileItem = {
          id: `temp-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploaded_at: new Date().toISOString(),
          description: ''
        };

        // Agregar campos requeridos adicionales
        requiredFields.forEach(field => {
          if (field !== 'description') {
            fileItem[field] = '';
          }
        });

        uploadedFiles.push(fileItem);

        // Simular delay de subida
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Actualizar valor
      const newValue = multiple ? [...files, ...uploadedFiles] : uploadedFiles[0];
      onChange(newValue);

      setUploadProgress(100);

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error al subir archivos:', error);
      alert('Error al subir archivos');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (fileId: string) => {
    const newFiles = files.filter(file => file.id !== fileId);
    onChange(multiple ? newFiles : newFiles[0] || null);
  };

  const updateFileField = (fileId: string, field: string, value: any) => {
    const newFiles = files.map(file =>
      file.id === fileId ? { ...file, [field]: value } : file
    );
    onChange(multiple ? newFiles : newFiles[0] || null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (!type || type === 'unknown') return '📎';
    if (type.includes('pdf')) return '📄';
    if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) return '🖼️';
    if (type.includes('word') || type.includes('document') || type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xls')) return '📊';
    if (type.includes('text') || type.includes('txt')) return '📄';
    return '📎';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Input de archivo */}
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={allowedTypes.map(type => `.${type}`).join(',')}
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>
              {multiple ? 'Seleccionar Archivos' : 'Seleccionar Archivo'}
            </span>
          </button>

          <span className="text-sm text-gray-500">
            Tipos: {allowedTypes.join(', ')} | Máx: {maxSize}MB
          </span>
        </div>

        {/* Barra de progreso */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Archivos {multiple ? `(${files.length})` : ''}
          </h4>

          {files.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-2xl">{getFileIcon(file.type)}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      Subido: {new Date(file.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.url && (
                    <button
                      type="button"
                      onClick={() => window.open(file.url, '_blank')}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Campos adicionales configurados */}
              {requiredFields.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  {requiredFields.map(field => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={file[field] || ''}
                        onChange={(e) => updateFileField(file.id, field, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={`Ingrese ${field}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
