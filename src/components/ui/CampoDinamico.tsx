import React from 'react';
import { EsquemaCampo } from '../../types/esquemas';

// Componente para campos objeto estructurados
const ObjectField: React.FC<{
  name: string;
  structure: any[];
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}> = ({ name, structure, value = {}, onChange, disabled = false }) => {
  const actualizarCampo = (key: string, valor: any) => {
    const nuevoObjeto = { ...value, [key]: valor };
    // Limpiar campos vacíos
    Object.keys(nuevoObjeto).forEach(k => {
      if (nuevoObjeto[k] === '' || nuevoObjeto[k] === null || nuevoObjeto[k] === undefined) {
        delete nuevoObjeto[k];
      }
    });
    onChange(nuevoObjeto);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {structure.map(subcampo => (
        <div key={subcampo.key} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {subcampo.description || subcampo.key} {subcampo.required && <span className="text-red-500">*</span>}
          </label>
          {(subcampo.type === 'array' && subcampo.list_values && typeof subcampo.list_values === 'object' && 'enum' in subcampo.list_values) ? (
            // Si el subcampo es de tipo array con enum, renderizar select
            <select
              value={value[subcampo.key] ?? subcampo.default_value ?? ''}
              onChange={(e) => actualizarCampo(subcampo.key, e.target.value)}
              required={subcampo.required}
              disabled={disabled}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
            >
              <option value="">Seleccionar...</option>
              {(subcampo.list_values as { enum: string[] }).enum.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            // Input normal
            <input
              type={subcampo.type === 'number' || subcampo.type === 'integer' ? 'number' : 'text'}
              placeholder={subcampo.description || subcampo.key}
              value={value[subcampo.key] ?? subcampo.default_value ?? ''}
              onChange={(e) => actualizarCampo(subcampo.key, e.target.value)}
              required={subcampo.required}
              disabled={disabled}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              step={subcampo.type === 'integer' ? '1' : '0.01'}
            />
          )}
        </div>
      ))}

      {/* Información de debug para el objeto */}
      {process.env.NODE_ENV === 'development' && Object.keys(value || {}).length > 0 && (
        <div className="col-span-full mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <strong>Debug - Valor actual:</strong> {JSON.stringify(value, null, 2)}
        </div>
      )}
    </div>
  );
};

interface CampoDinamicoProps {
  campo: EsquemaCampo;
  value: any;
  onChange: (key: string, value: any) => void;
  error?: string;
  disabled?: boolean;
}

export const CampoDinamico: React.FC<CampoDinamicoProps> = ({
  campo,
  value,
  onChange,
  error,
  disabled = false
}) => {
  // Usar default_value si value es null/undefined/empty
  const efectiveValue = value ?? campo.default_value ?? '';

  const handleChange = (newValue: any) => {
    onChange(campo.key, newValue);
  };

  // Si es un campo objeto, renderizar los subcampos directamente sin contenedor
  if (campo.type === 'object' && campo.list_values && typeof campo.list_values === 'object' && 'object_structure' in campo.list_values) {
    const structure = (campo.list_values as { object_structure: EsquemaCampo[] }).object_structure;

    return (
      <>
        {structure.map((subcampo: EsquemaCampo) => (
          <div key={subcampo.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {subcampo.description || subcampo.key} {subcampo.required && <span className="text-red-500">*</span>}
            </label>
            {(subcampo.type === 'array' && subcampo.list_values && typeof subcampo.list_values === 'object' && 'enum' in subcampo.list_values) ? (
              // Si el subcampo es de tipo array con enum, renderizar select
              <select
                value={efectiveValue[subcampo.key] ?? subcampo.default_value ?? ''}
                onChange={(e) => {
                  const nuevoObjeto = { ...efectiveValue, [subcampo.key]: e.target.value };
                  // Limpiar campos vacíos
                  Object.keys(nuevoObjeto).forEach(k => {
                    if (nuevoObjeto[k] === '' || nuevoObjeto[k] === null || nuevoObjeto[k] === undefined) {
                      delete nuevoObjeto[k];
                    }
                  });
                  handleChange(nuevoObjeto);
                }}
                required={subcampo.required}
                disabled={disabled}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              >
                <option value="">Seleccionar...</option>
                {(subcampo.list_values as { enum: string[] }).enum.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              // Input normal
              <input
                type={subcampo.type === 'number' || subcampo.type === 'integer' ? 'number' : 'text'}
                placeholder={subcampo.description || subcampo.key}
                value={efectiveValue[subcampo.key] ?? subcampo.default_value ?? ''}
                onChange={(e) => {
                  const nuevoObjeto = { ...efectiveValue, [subcampo.key]: e.target.value };
                  // Limpiar campos vacíos
                  Object.keys(nuevoObjeto).forEach(k => {
                    if (nuevoObjeto[k] === '' || nuevoObjeto[k] === null || nuevoObjeto[k] === undefined) {
                      delete nuevoObjeto[k];
                    }
                  });
                  handleChange(nuevoObjeto);
                }}
                required={subcampo.required}
                disabled={disabled}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                step={subcampo.type === 'integer' ? '1' : '0.01'}
              />
            )}
          </div>
        ))}
      </>
    );
  }

  const renderCampo = () => {
    const baseClasses = `border text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 ${
      error
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:ring-blue-500'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

    switch (campo.type) {
      case 'string':
        // Verificar si tiene opciones enum en list_values
        if (campo.list_values && typeof campo.list_values === 'object' && 'enum' in campo.list_values) {
          const opciones = (campo.list_values as { enum: string[] }).enum;
          return (
            <select
              value={efectiveValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              className={baseClasses}
              required={campo.required}
              disabled={disabled}
            >
              <option value="">Seleccionar...</option>
              {opciones.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        // Verificar si es array directo (formato anterior)
        if (campo.list_values && Array.isArray(campo.list_values) && campo.list_values.length > 0) {
          const opciones = campo.list_values as string[];
          return (
            <select
              value={efectiveValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              className={baseClasses}
              required={campo.required}
              disabled={disabled}
            >
              <option value="">Seleccionar...</option>
              {opciones.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        // Input de texto normal
        return (
          <input
            type="text"
            value={efectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClasses}
            required={campo.required}
            placeholder={campo.description}
            disabled={disabled}
          />
        );

      case 'integer':
      case 'number':
        return (
          <input
            type="number"
            value={efectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClasses}
            required={campo.required}
            placeholder={campo.description}
            disabled={disabled}
            step={campo.type === 'integer' ? '1' : '0.01'}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={efectiveValue || false}
              onChange={(e) => handleChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required={campo.required}
              disabled={disabled}
            />
            <label className="ml-2 text-sm text-gray-700">
              {campo.description || campo.key}
            </label>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={efectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClasses}
            required={campo.required}
            disabled={disabled}
          />
        );

      case 'object':
        // Solo tipo object con object_structure
        if (campo.list_values && typeof campo.list_values === 'object' && 'object_structure' in campo.list_values) {
          const estructura = (campo.list_values as { object_structure: any[] }).object_structure;
          return (
            <ObjectField
              name={campo.description || campo.key}
              structure={estructura}
              value={efectiveValue || {}}
              onChange={handleChange}
              disabled={disabled}
            />
          );
        }
        // Si no tiene object_structure, mostrar error
        return (
          <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
            Error: Campo tipo object debe tener list_values con object_structure
          </div>
        );

      case 'array':
        // Verificar si tiene opciones enum en list_values (para selectores de una opción)
        if (campo.list_values && typeof campo.list_values === 'object' && 'enum' in campo.list_values) {
          const opciones = (campo.list_values as { enum: string[] }).enum;
          return (
            <select
              value={efectiveValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              className={baseClasses}
              required={campo.required}
              disabled={disabled}
            >
              <option value="">Seleccionar...</option>
              {opciones.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        // Si no tiene enum, mostrar error
        return (
          <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
            Error: Campo tipo array debe tener list_values con enum
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={efectiveValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseClasses}
            required={campo.required}
            placeholder={campo.description}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {campo.description || campo.key} {campo.required && '*'}
      </label>
      {renderCampo()}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};
