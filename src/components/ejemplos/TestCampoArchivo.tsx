import React, { useState } from 'react';
import { CampoDinamico } from '../ui/CampoDinamico';
import { EsquemaCampo } from '../../types/esquemas';

export const TestCampoArchivo: React.FC = () => {
  const [formData, setFormData] = useState<any>({
    // Simular un archivo existente como vendría de la BD
    documento_prueba: {
      id: 'existing-1',
      name: 'gallery5.jpg',
      size: 178449,
      type: 'image/jpeg',
      url: '/uploads/pruebas/documentos/gallery5.jpg',
      uploaded_at: '2025-09-02T02:59:12.617Z',
      descripcion: 'Imagen de prueba del sistema'
    },
    // Campo de múltiples documentos
    documentos_multiples: [
      {
        id: 'existing-2',
        name: 'documento1.pdf',
        size: 1024000,
        type: 'application/pdf',
        url: '/uploads/pruebas/multiples/documento1.pdf',
        uploaded_at: '2025-09-01T10:30:00Z',
        categoria: 'Factura',
        fecha: '2025-09-01'
      },
      {
        id: 'existing-3',
        name: 'imagen2.jpg',
        size: 512000,
        type: 'image/jpeg',
        url: '/uploads/pruebas/multiples/imagen2.jpg',
        uploaded_at: '2025-09-01T15:45:00Z',
        categoria: 'Foto',
        fecha: '2025-09-01'
      }
    ]
  });

  // Esquema de prueba con campo de archivo
  const esquemaPrueba: EsquemaCampo[] = [
    {
      key: 'documento_prueba',
      type: 'file',
      required: false,
      description: 'Documento de prueba para testing',
      order_index: 1,
      list_values: {
        file_config: {
          allowed_types: ['pdf', 'jpg', 'png'],
          max_size_mb: 2,
          multiple: false,
          required_fields: ['descripcion'],
          storage_path: 'pruebas/documentos'
        }
      }
    },
    {
      key: 'documentos_multiples',
      type: 'file',
      required: false,
      description: 'Múltiples documentos',
      order_index: 2,
      list_values: {
        file_config: {
          allowed_types: ['pdf', 'doc', 'jpg'],
          max_size_mb: 5,
          multiple: true,
          required_fields: ['categoria', 'fecha'],
          storage_path: 'pruebas/multiples'
        }
      }
    }
  ];

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🧪 Prueba: Campo de Archivo Dinámico
        </h1>
        <p className="text-gray-600">
          Probando que el campo de archivo se renderice correctamente
        </p>
      </div>

      {/* Formulario de prueba */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Formulario de Prueba
        </h2>

        <div className="space-y-4">
          {esquemaPrueba.map((campo) => (
            <CampoDinamico
              key={campo.key}
              campo={campo}
              value={formData[campo.key]}
              onChange={handleFieldChange}
              disabled={false}
            />
          ))}
        </div>
      </div>

      {/* Datos del formulario */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          📊 Datos del Formulario
        </h3>
        <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>

      {/* Información del esquema */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          ℹ️ Esquema de Prueba
        </h3>
        <pre className="text-xs text-blue-800 bg-white p-3 rounded border overflow-x-auto">
          {JSON.stringify(esquemaPrueba, null, 2)}
        </pre>
      </div>
    </div>
  );
};
