import React, { useState } from 'react';
import { DynamicFileField } from '../ui/DynamicFileField';
import { FileFieldConfig } from '../../types/fieldDefinition';

export const EjemploCampoArchivo: React.FC = () => {
  const [archivos, setArchivos] = useState<any>(null);
  const [archivosMultiples, setArchivosMultiples] = useState<any>([]);

  // Configuración para campo de archivo único (cédula)
  const configCedula: FileFieldConfig = {
    allowed_types: ['pdf', 'jpg', 'png'],
    max_size_mb: 2,
    multiple: false,
    required_fields: ['fecha_vencimiento'],
    storage_path: 'solicitantes/identificacion'
  };

  // Configuración para campo de archivos múltiples (documentos de crédito)
  const configDocumentos: FileFieldConfig = {
    allowed_types: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    max_size_mb: 5,
    multiple: true,
    required_fields: ['descripcion', 'categoria'],
    storage_path: 'creditos/documentos'
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🗂️ Ejemplo: Campos de Archivo Dinámicos
        </h1>
        <p className="text-lg text-gray-600">
          Demostración del nuevo tipo de campo "file" en el sistema de campos dinámicos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campo de archivo único - Cédula */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Campo de Archivo Único
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Ejemplo: Cédula de ciudadanía con validación de tipo y tamaño
          </p>

          <DynamicFileField
            value={archivos}
            onChange={setArchivos}
            config={configCedula}
            label="Cédula de Ciudadanía"
            required={true}
            entityId={123}
            entityType="solicitante"
            jsonColumn="info_extra"
            fieldKey="cedula"
          />

          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">Configuración del Campo:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(configCedula, null, 2)}
            </pre>
          </div>
        </div>

        {/* Campo de archivos múltiples - Documentos */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📚 Campo de Archivos Múltiples
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Ejemplo: Documentos de crédito con campos adicionales
          </p>

          <DynamicFileField
            value={archivosMultiples}
            onChange={setArchivosMultiples}
            config={configDocumentos}
            label="Documentos del Crédito"
            required={false}
            entityId={123}
            entityType="solicitante"
            jsonColumn="detalle_credito"
            fieldKey="documentos_credito"
          />

          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <h4 className="font-medium text-gray-700 mb-2">Configuración del Campo:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(configDocumentos, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Información del sistema */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          ℹ️ Información del Sistema de Archivos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Características:</h4>
            <ul className="space-y-1">
              <li>✅ Validación de tipos de archivo</li>
              <li>✅ Límites de tamaño configurables</li>
              <li>✅ Archivos únicos o múltiples</li>
              <li>✅ Campos adicionales requeridos</li>
              <li>✅ Rutas de almacenamiento personalizadas</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Tipos Soportados:</h4>
            <ul className="space-y-1">
              <li>📄 Documentos: PDF, DOC, DOCX</li>
              <li>🖼️ Imágenes: JPG, PNG, JPEG</li>
              <li>📊 Hojas de cálculo: XLS, XLSX</li>
              <li>📝 Texto: TXT</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Valores actuales */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          📊 Valores Actuales de los Campos
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Cédula (Archivo Único):</h4>
            <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify(archivos, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Documentos (Múltiples):</h4>
            <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify(archivosMultiples, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Instrucciones de uso */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">
          🚀 Cómo Usar en tu Aplicación
        </h3>
        <div className="text-sm text-green-800 space-y-3">
          <p>
            <strong>1. Configurar el campo en el esquema:</strong>
          </p>
          <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`{
  key: 'documentos_credito',
  type: 'file',
  required: false,
  description: 'Documentos relacionados al crédito',
  list_values: {
    file_config: {
      allowed_types: ['pdf', 'doc', 'jpg'],
      max_size_mb: 5,
      multiple: true,
      required_fields: ['descripcion', 'categoria'],
      storage_path: 'creditos/documentos'
    }
  }
}`}
          </pre>

          <p>
            <strong>2. Usar el componente en tu formulario:</strong>
          </p>
          <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`<DynamicFileField
  value={data.documentos_credito}
  onChange={(value) => updateData('documentos_credito', value)}
  config={campo.list_values.file_config}
  label="Documentos del Crédito"
  required={true}
  entityId={123}
  entityType="solicitante"
  jsonColumn="detalle_credito"
  fieldKey="documentos_credito"
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};
