import React, { useState, useRef } from 'react';
import { Customer } from '../../types/customer';
import { Upload, File, X as XIcon, Save, Loader2, Calendar } from 'lucide-react';

interface CustomerFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Personal Information */}
        <div className="md:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">Información Personal</h3>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={newCustomer.nombre || ''}
            onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo Documento *
          </label>
          <select
            value={newCustomer.tipo_documento || ''}
            onChange={(e) => handleInputChange('tipo_documento', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar...</option>
            <option value="CC">CC - Cédula de Ciudadanía</option>
            <option value="TI">TI - Tarjeta de Identidad</option>
            <option value="CE">CE - Cédula de Extranjería</option>
            <option value="PA">PA - Pasaporte</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Número Documento *
          </label>
          <input
            type="text"
            value={newCustomer.numero_documento || ''}
            onChange={(e) => handleInputChange('numero_documento', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fecha Nacimiento *
          </label>
          <div className="relative">
            <input
              type="date"
              value={newCustomer.fecha_nacimiento || ''}
              onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Número Celular *
          </label>
          <input
            type="tel"
            value={newCustomer.numero_celular || ''}
            onChange={(e) => handleInputChange('numero_celular', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Correo Electrónico *
          </label>
          <input
            type="email"
            value={newCustomer.correo_electronico || ''}
            onChange={(e) => handleInputChange('correo_electronico', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Additional Personal Information */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nivel Estudio
          </label>
          <input
            type="text"
            value={newCustomer.nivel_estudio || ''}
            onChange={(e) => handleInputChange('nivel_estudio', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Location Information */}
        <div className="md:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Información de Ubicación</h3>
        </div>

        {/* Add all location fields... */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Dirección Residencia
          </label>
          <input
            type="text"
            value={newCustomer.direccion_residencia || ''}
            onChange={(e) => handleInputChange('direccion_residencia', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* File Upload Section */}
        <div className="md:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Archivos Adjuntos</h3>
          <div className="mt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={triggerFileInput}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar Archivos
              </button>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Archivos seleccionados:</h4>
                  <ul className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <div className="flex items-center">
                          <File className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-800">{file.name}</span>
                          <span className="ml-2 text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar
        </button>
      </div>
    </form>
  );
};