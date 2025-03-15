import React from 'react';
import { Customer } from '../../types/customer';
import { Mail, Phone, Save, Loader2, Trash2 } from 'lucide-react';

interface CustomerDetailsProps {
  customer: Customer;
  editedCustomer: Customer;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  canEdit: () => boolean;
  canDelete: () => boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onInputChange: (field: keyof Customer, value: string) => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  editedCustomer,
  isEditing,
  isLoading,
  error,
  canEdit,
  canDelete,
  onEdit,
  onSave,
  onDelete,
  onInputChange
}) => {
  // Group fields into categories for better organization
  const personalInfo = ['nombre_completo', 'tipo_documento', 'numero_documento', 'fecha_nacimiento', 'correo_electronico', 'numero_celular'];
  const locationInfo = ['direccion_residencia', 'tipo_vivienda', 'barrio', 'departamento', 'estrato', 'ciudad_gestion'];
  const financialInfo = ['banco', 'tipo_credito', 'valor_inmueble', 'cuota_inicial', 'porcentaje_financiar', 'total_egresos', 'total_activos', 'total_pasivos'];
  const jobInfo = ['actividad_economica', 'empresa_labora', 'fecha_vinculacion', 'direccion_empresa', 'telefono_empresa', 'tipo_contrato', 'cargo_actual', 'ingresos'];
  const metaInfo = ['created_at', 'archivos'];

  // Function to render a field
  const renderField = (key: string, value: any) => {
    if (value === null || value === undefined || value === '' || key === 'id') return null;
    
    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    
    return (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {isEditing ? (
          <input
            type={key.includes('date') || key.includes('fecha') ? 'date' : 'text'}
            value={editedCustomer[key as keyof Customer] as string || ''}
            onChange={(e) => onInputChange(key as keyof Customer, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
          />
        ) : (
          <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-800">
            {key.includes('correo') ? (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                {value}
              </div>
            ) : key.includes('celular') || key.includes('telefono') ? (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                {value}
              </div>
            ) : key.includes('url') || key.includes('archivos') ? (
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate block"
              >
                {value}
              </a>
            ) : (
              <span>{value}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        {/* Personal Information Section */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            {personalInfo.map(key => 
              customer[key as keyof Customer] ? 
                renderField(key, customer[key as keyof Customer]) : null
            )}
          </div>
        </div>
        
        {/* Location Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Ubicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            {locationInfo.map(key => 
              customer[key as keyof Customer] ? 
                renderField(key, customer[key as keyof Customer]) : null
            )}
          </div>
        </div>
        
        {/* Financial Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Información Financiera</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            {financialInfo.map(key => 
              customer[key as keyof Customer] ? 
                renderField(key, customer[key as keyof Customer]) : null
            )}
          </div>
        </div>
        
        {/* Job Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Información Laboral</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            {jobInfo.map(key => 
              customer[key as keyof Customer] ? 
                renderField(key, customer[key as keyof Customer]) : null
            )}
          </div>
        </div>
        
        {/* Meta Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3 mt-4">Metadatos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            {metaInfo.map(key => 
              customer[key as keyof Customer] ? 
                renderField(key, customer[key as keyof Customer]) : null
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        {isEditing ? (
          <button
            onClick={onSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar Cambios
          </button>
        ) : (
          <>
            {canEdit() && (
              <button
                onClick={onEdit}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Editar
              </button>
            )}
            {canDelete() && (
              <button
                onClick={onDelete}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Eliminar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};