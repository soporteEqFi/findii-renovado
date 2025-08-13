import React from 'react';
import { Customer } from '../../types/customer';

// Sección de información personal
export const PersonalInfoSection: React.FC<{
  customer: Partial<Customer>;
  onChange: (field: keyof Customer, value: string) => void;
  isEditing?: boolean;
}> = ({ customer, onChange, isEditing = true }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo
        </label>
        <input
          type="text"
          value={customer.nombre_completo || ''}
          onChange={(e) => onChange('nombre_completo', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo Electrónico
        </label>
        <input
          type="email"
          value={customer.correo_electronico || ''}
          onChange={(e) => onChange('correo_electronico', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de Documento
        </label>
        <input
          type="text"
          value={customer.numero_documento || ''}
          onChange={(e) => onChange('numero_documento', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de Celular
        </label>
        <input
          type="tel"
          value={customer.numero_celular || ''}
          onChange={(e) => onChange('numero_celular', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

// Sección de información financiera
export const FinancialInfoSection: React.FC<{
  customer: Partial<Customer>;
  onChange: (field: keyof Customer, value: string) => void;
  isEditing?: boolean;
}> = ({ customer, onChange, isEditing = true }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Financiera</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ingresos
        </label>
        <input
          type="number"
          value={customer.ingresos || ''}
          onChange={(e) => onChange('ingresos', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total de Egresos
        </label>
        <input
          type="number"
          value={customer.total_egresos || ''}
          onChange={(e) => onChange('total_egresos', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total de Activos
        </label>
        <input
          type="number"
          value={customer.total_activos || ''}
          onChange={(e) => onChange('total_activos', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total de Pasivos
        </label>
        <input
          type="number"
          value={customer.total_pasivos || ''}
          onChange={(e) => onChange('total_pasivos', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

// Sección de información laboral
export const WorkInfoSection: React.FC<{
  customer: Partial<Customer>;
  onChange: (field: keyof Customer, value: string) => void;
  isEditing?: boolean;
}> = ({ customer, onChange, isEditing = true }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Empresa donde Labora
        </label>
        <input
          type="text"
          value={customer.empresa_labora || ''}
          onChange={(e) => onChange('empresa_labora', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cargo Actual
        </label>
        <input
          type="text"
          value={customer.cargo_actual || ''}
          onChange={(e) => onChange('cargo_actual', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Vinculación
        </label>
        <input
          type="date"
          value={customer.fecha_vinculacion || ''}
          onChange={(e) => onChange('fecha_vinculacion', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono de la Empresa
        </label>
        <input
          type="tel"
          value={customer.telefono_empresa || ''}
          onChange={(e) => onChange('telefono_empresa', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

// Sección de información del segundo titular
export const SecondTitularInfoSection: React.FC<{
  customer: Partial<Customer>;
  onChange: (field: keyof Customer, value: string) => void;
  isEditing?: boolean;
}> = ({ customer, onChange, isEditing = true }) => {
  // Parsear la información del segundo titular si existe
  let segundoTitularInfo: any = {};
  try {
    if (customer.info_segundo_titular) {
      segundoTitularInfo = JSON.parse(customer.info_segundo_titular);
    }
  } catch (error) {
    console.error('Error parsing info_segundo_titular:', error);
  }

  const handleSegundoTitularChange = (field: string, value: string) => {
    const updatedInfo = { ...segundoTitularInfo, [field]: value };
    onChange('info_segundo_titular', JSON.stringify(updatedInfo));
  };

  // Solo mostrar si hay segundo titular
  if (customer.segundo_titular !== 'si' && customer.segundo_titular !== 'true') {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Segundo Titular</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            value={segundoTitularInfo.nombre || ''}
            onChange={(e) => handleSegundoTitularChange('nombre', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento
          </label>
          <select
            value={segundoTitularInfo.tipo_documento || ''}
            onChange={(e) => handleSegundoTitularChange('tipo_documento', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar...</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PP">Pasaporte</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento
          </label>
          <input
            type="text"
            value={segundoTitularInfo.numero_documento || ''}
            onChange={(e) => handleSegundoTitularChange('numero_documento', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            value={segundoTitularInfo.fecha_nacimiento || ''}
            onChange={(e) => handleSegundoTitularChange('fecha_nacimiento', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Celular
          </label>
          <input
            type="tel"
            value={segundoTitularInfo.numero_celular || ''}
            onChange={(e) => handleSegundoTitularChange('numero_celular', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={segundoTitularInfo.correo_electronico || ''}
            onChange={(e) => handleSegundoTitularChange('correo_electronico', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado Civil
          </label>
          <select
            value={segundoTitularInfo.estado_civil || ''}
            onChange={(e) => handleSegundoTitularChange('estado_civil', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar...</option>
            <option value="soltero">Soltero</option>
            <option value="casado">Casado</option>
            <option value="union_libre">Unión Libre</option>
            <option value="divorciado">Divorciado</option>
            <option value="viudo">Viudo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel de Estudio
          </label>
          <select
            value={segundoTitularInfo.nivel_estudio || ''}
            onChange={(e) => handleSegundoTitularChange('nivel_estudio', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar...</option>
            <option value="primaria">Primaria</option>
            <option value="secundaria">Secundaria</option>
            <option value="tecnico">Técnico</option>
            <option value="tecnologo">Tecnólogo</option>
            <option value="profesional">Profesional</option>
            <option value="especializacion">Especialización</option>
            <option value="maestria">Maestría</option>
            <option value="doctorado">Doctorado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profesión
          </label>
          <input
            type="text"
            value={segundoTitularInfo.profesion || ''}
            onChange={(e) => handleSegundoTitularChange('profesion', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingresos
          </label>
          <input
            type="number"
            value={segundoTitularInfo.ingresos || ''}
            onChange={(e) => handleSegundoTitularChange('ingresos', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa donde Labora
          </label>
          <input
            type="text"
            value={segundoTitularInfo.empresa_labora || ''}
            onChange={(e) => handleSegundoTitularChange('empresa_labora', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cargo Actual
          </label>
          <input
            type="text"
            value={segundoTitularInfo.cargo_actual || ''}
            onChange={(e) => handleSegundoTitularChange('cargo_actual', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Vinculación
          </label>
          <input
            type="date"
            value={segundoTitularInfo.fecha_vinculacion || ''}
            onChange={(e) => handleSegundoTitularChange('fecha_vinculacion', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono de la Empresa
          </label>
          <input
            type="tel"
            value={segundoTitularInfo.telefono_empresa || ''}
            onChange={(e) => handleSegundoTitularChange('telefono_empresa', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}; 