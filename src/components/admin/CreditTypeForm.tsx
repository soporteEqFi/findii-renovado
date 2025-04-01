import React, { useState } from 'react';
import { CreditType, CreditTypeField, FieldValidation } from '../../types/creditTypes';
import { v4 as uuidv4 } from 'uuid';

interface CreditTypeFormProps {
  initialCreditType?: CreditType;
  onSave: (creditType: CreditType) => Promise<void>;
}

export const CreditTypeForm: React.FC<CreditTypeFormProps> = ({ initialCreditType, onSave }) => {
  
  console.log(initialCreditType);

  const [creditType, setCreditType] = useState<CreditType>(
    initialCreditType || {
    //   id: uuidv4(),
      name: '',
      displayName: '',
      description: '',
      fields: [],
      is_active: true,
    }
  );

  const [newField, setNewField] = useState<Partial<CreditTypeField>>({
    fieldType: 'text',
    isRequired: false,
    validation: {},
  });

  const handleCreditTypeChange = (field: keyof CreditType, value: any) => {
    setCreditType({
      ...creditType,
      [field]: value,
    });
  };

  const handleNewFieldChange = (field: keyof CreditTypeField, value: any) => {
    setNewField({
      ...newField,
      [field]: value,
    });
  };

  const addField = () => {
    if (!newField.name || !newField.displayName) return;

    const newFieldComplete: CreditTypeField = {
      id: uuidv4(),
      name: newField.name || '',
      displayName: newField.displayName || '',
      fieldType: newField.fieldType as any || 'text',
      order: creditType.fields.length + 1,
      isRequired: newField.isRequired || false,
      validation: newField.validation || {},
      options: newField.options,
      defaultValue: newField.defaultValue,
    };

    setCreditType({
      ...creditType,
      fields: [...creditType.fields, newFieldComplete],
    });

    // Limpiar el formulario de nuevo campo
    setNewField({
      fieldType: 'text',
      isRequired: false,
      validation: {},
    });
  };

  const removeField = (fieldId: string) => {
    setCreditType({
      ...creditType,
      fields: creditType.fields.filter(field => field.id !== fieldId),
    });
  };

  const reorderField = (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = creditType.fields.findIndex(field => field.id === fieldId);
    if (fieldIndex === -1) return;
    
    if (direction === 'up' && fieldIndex === 0) return;
    if (direction === 'down' && fieldIndex === creditType.fields.length - 1) return;
    
    const newFields = [...creditType.fields];
    const swapIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    
    [newFields[fieldIndex], newFields[swapIndex]] = [newFields[swapIndex], newFields[fieldIndex]];
    
    // Actualizar los órdenes
    newFields.forEach((field, index) => {
      field.order = index + 1;
    });
    
    setCreditType({
      ...creditType,
      fields: newFields,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(creditType);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Información del Tipo de Crédito</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Interno *</label>
            <input
              type="text"
              value={creditType.name}
              onChange={(e) => handleCreditTypeChange('name', e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Identificador único (sin espacios)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre para Mostrar *</label>
            <input
              type="text"
              value={creditType.display_name}
              onChange={(e) => handleCreditTypeChange('display_name', e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={creditType.description || ''}
              onChange={(e) => handleCreditTypeChange('description', e.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              rows={2}
            />
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={creditType.is_active}
                onChange={(e) => handleCreditTypeChange('is_active', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Activo</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Campos Personalizados</h2>
        
        {creditType.fields.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Campos Configurados</h3>
            <ul className="divide-y divide-gray-200">
              {creditType.fields.map((field, index) => (
                <li key={field.id || index} className="py-4 flex flex-wrap justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{field.displayName}</p>
                    <p className="text-sm text-gray-500">
                      {field.name} - Tipo: {field.fieldType} 
                      {field.isRequired ? ' (Obligatorio)' : ''}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => reorderField(field.id, 'up')}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderField(field.id, 'down')}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="p-1 rounded-full text-red-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded text-center text-gray-500">
            No hay campos configurados todavía.
          </div>
        )}
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-2">Agregar Nuevo Campo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Interno</label>
              <input
                type="text"
                value={newField.name || ''}
                onChange={(e) => handleNewFieldChange('name', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              />
              <p className="text-xs text-gray-500 mt-1">Sin espacios ni caracteres especiales</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre para Mostrar</label>
              <input
                type="text"
                value={newField.displayName || ''}
                onChange={(e) => handleNewFieldChange('displayName', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Campo</label>
              <select
                value={newField.fieldType as string}
                onChange={(e) => handleNewFieldChange('fieldType', e.target.value)}
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="date">Fecha</option>
                <option value="select">Selector</option>
                <option value="checkbox">Casilla de verificación</option>
              </select>
            </div>
            
            {newField.fieldType === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Opciones</label>
                <input
                  type="text"
                  value={newField.options?.join(', ') || ''}
                  onChange={(e) => handleNewFieldChange('options', e.target.value.split(', '))}
                  className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5"
                  placeholder="Opción1, Opción2, Opción3"
                />
              </div>
            )}
            
            <div>
              <label className="flex items-center mt-4">
                <input
                  type="checkbox"
                  checked={newField.isRequired || false}
                  onChange={(e) => handleNewFieldChange('isRequired', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Campo obligatorio</span>
              </label>
            </div>
            
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={addField}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!newField.name || !newField.displayName}
              >
                Agregar Campo
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Guardar Configuración
        </button>
      </div>
    </form>
  );
}; 