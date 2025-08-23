import React, { useEffect, useState } from 'react';
import { FieldDefinition } from '../../types/fieldDefinition';
import { Trash2, Plus } from 'lucide-react';

// Componente reutilizable para configuración de Array
const ArrayConfiguration: React.FC<{
  value: string[];
  onChange: (options: string[]) => void;
  isEditing?: boolean;
}> = ({ value, onChange, isEditing = false }) => {
  const [localValue, setLocalValue] = useState(value.join('\n'));

  // Actualizar el valor local cuando cambia el prop value
  useEffect(() => {
    setLocalValue(value.join('\n'));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    const options = localValue.split('\n').filter(opt => opt.trim() !== '');
    onChange(options);
  };

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h5 className="text-sm font-medium text-gray-700 mb-3">Configuración de Array</h5>
      <div>
        <label className="block text-sm text-gray-600 mb-2">Opciones del Array (una por línea)</label>
        <textarea
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          rows={6}
          placeholder="Opción 1
Opción 2
Opción 3
Opción 4
Opción 5
Opción 6"
        />
        <p className="text-xs text-gray-500 mt-1">Presiona Enter para agregar nuevas opciones. Cada línea será una opción del array.</p>
      </div>
    </div>
  );
};

// Componente para configuración de Array anidado (dentro de objetos)
const NestedArrayConfiguration: React.FC<{
  value: string[];
  onChange: (options: string[]) => void;
}> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value.join('\n'));

  // Actualizar el valor local cuando cambia el prop value
  useEffect(() => {
    setLocalValue(value.join('\n'));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    const options = localValue.split('\n').filter(opt => opt.trim() !== '');
    onChange(options);
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded border">
      <label className="block text-sm text-gray-600 mb-2">Opciones del Array (una por línea)</label>
      <textarea
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        rows={5}
        placeholder="Opción 1
Opción 2
Opción 3
Opción 4
Opción 5"
      />
      <p className="text-xs text-gray-500 mt-1">Presiona Enter para agregar nuevas opciones. Cada línea será una opción del array.</p>
    </div>
  );
};

// Componente reutilizable para configuración de Objeto
const ObjectConfiguration: React.FC<{
  structure: {
    key: string;
    type: string;
    required: boolean;
    description: string;
    arrayOptions?: string[];
    objectStructure?: { key: string; type: string; required: boolean; description: string }[];
  }[];
  onChange: (structure: {
    key: string;
    type: string;
    required: boolean;
    description: string;
    arrayOptions?: string[];
    objectStructure?: { key: string; type: string; required: boolean; description: string }[];
  }[]) => void;
  isEditing?: boolean;
}> = ({ structure, onChange, isEditing = false }) => (
  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
    <h5 className="text-sm font-medium text-gray-700 mb-3">Configuración de Objeto</h5>
    <div className="space-y-3">
      {structure.map((field, index) => (
        <div key={index} className="p-3 bg-white rounded border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={field.key}
              onChange={(e) => {
                const newStructure = [...structure];
                newStructure[index].key = e.target.value;
                onChange(newStructure);
              }}
              placeholder="nombre_campo"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <input
              type="text"
              value={field.description || ''}
              onChange={(e) => {
                const newStructure = [...structure];
                newStructure[index].description = e.target.value;
                onChange(newStructure);
              }}
              placeholder="Descripción del campo"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={field.type}
              onChange={(e) => {
                const newStructure = [...structure];
                newStructure[index].type = e.target.value;
                // Reset nested configuration when type changes
                if (e.target.value !== 'array') {
                  delete newStructure[index].arrayOptions;
                }
                if (e.target.value !== 'object') {
                  delete newStructure[index].objectStructure;
                }
                onChange(newStructure);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="string">Texto</option>
              <option value="number">Número</option>
              <option value="integer">Entero</option>
              <option value="boolean">Sí/No</option>
              <option value="date">Fecha</option>
              <option value="array">Lista/Array</option>
              <option value="object">Objeto</option>
            </select>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => {
                  const newStructure = [...structure];
                  newStructure[index].required = e.target.checked;
                  onChange(newStructure);
                }}
                className="mr-1"
              />
              Req.
            </label>
            <button
              type="button"
              onClick={() => {
                const newStructure = structure.filter((_, i) => i !== index);
                onChange(newStructure);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={14} />
            </button>
          </div>

                     {/* Configuración de Array anidado */}
                       {field.type === 'array' && (
              <NestedArrayConfiguration
                value={field.arrayOptions || []}
                onChange={(options) => {
                  const newStructure = [...structure];
                  newStructure[index].arrayOptions = options;
                  onChange(newStructure);
                }}
              />
            )}

          {/* Configuración de Objeto anidado */}
          {field.type === 'object' && (
            <div className="mt-3 p-3 bg-gray-50 rounded border">
              <label className="block text-sm text-gray-600 mb-2">Sub-campos del Objeto</label>
              <div className="space-y-2">
                {(field.objectStructure || []).map((subField, subIndex) => (
                  <div key={subIndex} className="p-2 bg-white rounded border space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        value={subField.key}
                        onChange={(e) => {
                          const newStructure = [...structure];
                          const newSubStructure = [...(newStructure[index].objectStructure || [])];
                          newSubStructure[subIndex].key = e.target.value;
                          newStructure[index].objectStructure = newSubStructure;
                          onChange(newStructure);
                        }}
                        placeholder="nombre_subcampo"
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        value={subField.description || ''}
                        onChange={(e) => {
                          const newStructure = [...structure];
                          const newSubStructure = [...(newStructure[index].objectStructure || [])];
                          newSubStructure[subIndex].description = e.target.value;
                          newStructure[index].objectStructure = newSubStructure;
                          onChange(newStructure);
                        }}
                        placeholder="Descripción"
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={subField.type}
                        onChange={(e) => {
                          const newStructure = [...structure];
                          const newSubStructure = [...(newStructure[index].objectStructure || [])];
                          newSubStructure[subIndex].type = e.target.value;
                          newStructure[index].objectStructure = newSubStructure;
                          onChange(newStructure);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="string">Texto</option>
                        <option value="number">Número</option>
                        <option value="integer">Entero</option>
                        <option value="boolean">Sí/No</option>
                        <option value="date">Fecha</option>
                      </select>
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={subField.required}
                          onChange={(e) => {
                            const newStructure = [...structure];
                            const newSubStructure = [...(newStructure[index].objectStructure || [])];
                            newSubStructure[subIndex].required = e.target.checked;
                            newStructure[index].objectStructure = newSubStructure;
                            onChange(newStructure);
                          }}
                          className="mr-1"
                        />
                        Req.
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const confirmDelete = window.confirm(
                            `¿Estás seguro de que quieres eliminar el sub-campo "${subField.description || subField.key}"?\n\nEsta acción no se puede deshacer.`
                          );

                          if (confirmDelete) {
                            const newStructure = [...structure];
                            const newSubStructure = (newStructure[index].objectStructure || []).filter((_, i) => i !== subIndex);
                            newStructure[index].objectStructure = newSubStructure;
                            onChange(newStructure);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newStructure = [...structure];
                    const newSubStructure = [...(newStructure[index].objectStructure || []), { key: '', type: 'string', required: false, description: '' }];
                    newStructure[index].objectStructure = newSubStructure;
                    onChange(newStructure);
                  }}
                  className="w-full px-2 py-1 border border-dashed border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"
                >
                  <Plus size={12} />
                  Agregar Sub-campo
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const newStructure = [...structure, { key: '', type: 'string', required: false, description: '' }];
          onChange(newStructure);
        }}
        className="w-full px-3 py-2 border border-dashed border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"
      >
        <Plus size={14} />
        Agregar Campo al Objeto
      </button>
    </div>
  </div>
);

interface EntityGroup {
  entity: string;
  jsonColumn: string;
  displayName: string;
  description: string;
  fields: FieldDefinition[];
  fieldCount: number;
  isActive: boolean;
}

interface Props {
  initial?: FieldDefinition;
  selectedGroup?: EntityGroup | null;
  entityGroups?: EntityGroup[];
  onSubmit: (data: FieldDefinition) => void;
  onCancel: () => void;
  onEditField?: (field: FieldDefinition) => void;
  onDeleteField?: (field: FieldDefinition) => void;
  onSaveGroupConfiguration?: (groupData: { displayName: string; description: string; isActive: boolean }) => void;
}

const defaultItem: FieldDefinition = {
  empresa_id: 1,
  entity: 'solicitante',
  json_column: 'info_extra',
  key: '',
  type: 'string',
  required: false,
  description: '',
  default_value: '',
};

const FieldForm: React.FC<Props> = ({ initial, selectedGroup, onSubmit, onCancel, onEditField, onDeleteField, onSaveGroupConfiguration }) => {
  const [form, setForm] = useState<FieldDefinition>(initial || defaultItem);
  const [groupForm, setGroupForm] = useState({
    displayName: selectedGroup?.displayName || '',
    description: selectedGroup?.description || '',
    isActive: selectedGroup?.isActive ?? true
  });
  const [newFieldForm, setNewFieldForm] = useState({
    key: '',
    displayName: '',
    type: 'string' as 'string' | 'number' | 'integer' | 'boolean' | 'date' | 'array' | 'object',
    required: false,
    arrayOptions: [] as string[],
    objectStructure: [] as {
      key: string;
      type: string;
      required: boolean;
      description: string;
      arrayOptions?: string[];
      objectStructure?: { key: string; type: string; required: boolean; description: string }[];
    }[]
  });
  const [showAddField, setShowAddField] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm(initial);
    } else if (selectedGroup) {
      setForm(prev => ({
        ...prev,
        entity: selectedGroup.entity,
        json_column: selectedGroup.jsonColumn
      }));
    }
  }, [initial, selectedGroup]);

  useEffect(() => {
    if (selectedGroup) {
      setGroupForm({
        displayName: selectedGroup.displayName,
        description: selectedGroup.description,
        isActive: selectedGroup.isActive
      });
    }
  }, [selectedGroup]);

  const handleGroupFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setGroupForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNewFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setNewFieldForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Función para limpiar y validar la estructura de datos
  const cleanAndValidateStructure = (structure: any[]): any[] => {
    return structure.map(field => {
      const cleanedField: any = {
        key: field.key,
        type: field.type,
        required: field.required,
        description: field.description
      };

             // Validar y limpiar configuración de array
       if (field.type === 'array' && field.arrayOptions && field.arrayOptions.length > 0) {
         // Filtrar líneas vacías solo al guardar
         const filteredOptions = field.arrayOptions.filter((opt: string) => opt.trim() !== '');
         cleanedField.list_values = { enum: filteredOptions };
         // Eliminar arrayOptions ya que no debe existir en la estructura final
         delete cleanedField.arrayOptions;
       }

      // Validar y limpiar configuración de objeto anidado
      if (field.type === 'object' && field.objectStructure && field.objectStructure.length > 0) {
        const nestedStructure = field.objectStructure.map((subField: any) => {
          const nestedField: any = {
            key: subField.key,
            type: subField.type,
            required: subField.required,
            description: subField.description
          };

                     // Para sub-campos de tipo array, agregar list_values.enum y eliminar arrayOptions
           if (subField.type === 'array' && subField.arrayOptions && subField.arrayOptions.length > 0) {
             // Filtrar líneas vacías solo al guardar
             const filteredOptions = subField.arrayOptions.filter((opt: string) => opt.trim() !== '');
             nestedField.list_values = { enum: filteredOptions };
             delete nestedField.arrayOptions;
           }

          return nestedField;
        });

        cleanedField.list_values = {
          array_type: 'object',
          object_structure: nestedStructure
        };
        // Eliminar objectStructure ya que está dentro de list_values
        delete cleanedField.objectStructure;
      }

      return cleanedField;
    });
  };

  // Función para validar que los tipos sean correctos
  const validateFieldTypes = (structure: any[]): boolean => {
    for (const field of structure) {
      // Validar tipo básico
      const validTypes = ['string', 'number', 'integer', 'boolean', 'date', 'array', 'object'];
      if (!validTypes.includes(field.type)) {
        alert(`Tipo inválido "${field.type}" en el campo "${field.description || field.key}". Tipos válidos: ${validTypes.join(', ')}`);
        return false;
      }

      // Validar configuración de array
      if (field.type === 'array') {
        if (!field.arrayOptions || field.arrayOptions.length === 0) {
          alert(`El campo "${field.description || field.key}" es de tipo array pero no tiene opciones configuradas.`);
          return false;
        }
      }

      // Validar configuración de objeto
      if (field.type === 'object') {
        if (!field.objectStructure || field.objectStructure.length === 0) {
          alert(`El campo "${field.description || field.key}" es de tipo objeto pero no tiene sub-campos configurados.`);
          return false;
        }

        // Validar sub-campos recursivamente
        if (!validateFieldTypes(field.objectStructure)) {
          return false;
        }
      }
    }
    return true;
  };

     const handleAddField = () => {
     if (!newFieldForm.key || !newFieldForm.displayName) return;

     // Validar tipos antes de crear el campo
     if (newFieldForm.type === 'array' && newFieldForm.arrayOptions.length === 0) {
       alert('El campo es de tipo array pero no tiene opciones configuradas.');
       return;
     }

     if (newFieldForm.type === 'object' && newFieldForm.objectStructure.length > 0) {
       if (!validateFieldTypes(newFieldForm.objectStructure)) {
         return;
       }
     }

     const newField: FieldDefinition = {
       empresa_id: 1,
       entity: selectedGroup?.entity || 'solicitante',
       json_column: selectedGroup?.jsonColumn || 'info_extra',
       key: newFieldForm.key,
       type: newFieldForm.type as any,
       required: newFieldForm.required,
       description: newFieldForm.displayName,
       default_value: '',
     };

           // Add list_values for array and object types
      if (newFieldForm.type === 'array' && newFieldForm.arrayOptions.length > 0) {
        // Filtrar líneas vacías y crear list_values.enum
        const filteredOptions = newFieldForm.arrayOptions.filter(opt => opt.trim() !== '');
        newField.list_values = { enum: filteredOptions };

      } else if (newFieldForm.type === 'object' && newFieldForm.objectStructure.length > 0) {
        // Usar la función de limpieza y validación
        const cleanedStructure = cleanAndValidateStructure(newFieldForm.objectStructure);

        newField.list_values = {
          array_type: 'object',
          object_structure: cleanedStructure
        };
      }

      onSubmit(newField);
     setNewFieldForm({
       key: '',
       displayName: '',
       type: 'string',
       required: false,
       arrayOptions: [],
       objectStructure: []
     });
     setShowAddField(false);
   };

  const handleRemoveField = (field: FieldDefinition) => {
    if (onDeleteField) {
      onDeleteField(field);
    }
  };

     const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (initial) {
       // Editing existing field - limpiar estructura antes de enviar
       const cleanedForm = { ...form };

       // Si es un campo de tipo objeto, limpiar la estructura
       if (cleanedForm.type === 'object' && cleanedForm.list_values?.object_structure) {
         cleanedForm.list_values = {
           ...cleanedForm.list_values,
           object_structure: cleanAndValidateStructure(cleanedForm.list_values.object_structure)
         };
       }

               // Si es un campo de tipo array, asegurar que no tenga arrayOptions
        if (cleanedForm.type === 'array' && cleanedForm.list_values?.enum) {
          // arrayOptions ya debería estar limpio, pero por seguridad
          delete (cleanedForm as any).arrayOptions;
        }

        onSubmit(cleanedForm);
     } else {
       // This is handled by the add field functionality
       alert('Use el botón "Agregar Campo" para añadir nuevos campos');
     }
   };

  // If we're editing a specific field
  if (initial) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Interno *</label>
            <input
              name="key"
              value={form.key}
              onChange={(e) => setForm(prev => ({ ...prev, key: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="credito_hipotecario"
            />
            <p className="text-xs text-gray-500 mt-1">Identificador único (sin espacios)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre para Mostrar *</label>
            <input
              name="description"
              value={form.description || ''}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Crédito de vivienda"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            name="default_value"
            value={form.default_value || ''}
            onChange={(e) => setForm(prev => ({ ...prev, default_value: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Radicación multibanco para créditos de vivienda a nivel nacional."
          />
        </div>

        <div className="flex items-center">
          <input
            id="active"
            type="checkbox"
            checked={form.required}
            onChange={(e) => setForm(prev => ({ ...prev, required: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">Activo</label>
        </div>

        {/* Configuración específica según el tipo de campo */}
        {form.type === 'array' && form.list_values?.enum && (
          <ArrayConfiguration
            value={form.list_values.enum}
            onChange={(options) => setForm(prev => ({
              ...prev,
              list_values: { ...prev.list_values, enum: options }
            }))}
            isEditing={true}
          />
        )}

                 {form.type === 'object' && form.list_values?.object_structure && (
           <ObjectConfiguration
             structure={form.list_values.object_structure.map((field: any) => ({
               ...field,
               // Transformar list_values.enum a arrayOptions para campos de tipo array
               arrayOptions: field.type === 'array' && field.list_values?.enum
                 ? field.list_values.enum
                 : field.arrayOptions || []
             }))}
             onChange={(structure) => {
               // NO limpiar aquí, solo actualizar el estado
               setForm(prev => ({
                 ...prev,
                 list_values: { ...prev.list_values, object_structure: structure }
               }));
             }}
             isEditing={true}
           />
         )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Guardar Configuración
          </button>
        </div>
      </form>
    );
  }

  // If we're editing a group or creating new
  return (
    <div className="space-y-6">
      {/* Group Information Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Entidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Interno *</label>
            <input
              value={selectedGroup?.entity || ''}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              placeholder="credito_hipotecario"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Identificador único (sin espacios)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre para Mostrar *</label>
            <input
              name="displayName"
              value={groupForm.displayName}
              onChange={handleGroupFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Crédito de vivienda"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            name="description"
            value={groupForm.description}
            onChange={handleGroupFormChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Radicación multibanco para créditos de vivienda a nivel nacional."
          />
        </div>

        <div className="mt-4 flex items-center">
          <input
            id="active"
            name="isActive"
            type="checkbox"
            checked={groupForm.isActive}
            onChange={handleGroupFormChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">Activo</label>
        </div>
      </div>

      {/* Fields Configuration Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Campos Personalizados</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Campos Configurados</h4>

          {selectedGroup && selectedGroup.fields.length > 0 ? (
            <div className="space-y-2">
              {selectedGroup.fields.map((field) => (
                <div key={field.key} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{field.description || field.key}</div>
                    <div className="text-xs text-gray-500">
                      {field.key} - Tipo: {field.type} {field.required ? '(Obligatorio)' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() => {
                        if (onEditField) {
                          onEditField(field);
                        }
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 text-sm"
                      onClick={() => handleRemoveField(field)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay campos configurados</p>
          )}
        </div>

        {/* Add New Field Section */}
        {showAddField ? (
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar Nuevo Campo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre Interno</label>
                <input
                  name="key"
                  value={newFieldForm.key}
                  onChange={handleNewFieldChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Sin espacios ni caracteres especiales"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre para Mostrar</label>
                <input
                  name="displayName"
                  value={newFieldForm.displayName}
                  onChange={handleNewFieldChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tipo de Campo</label>
                <select
                  name="type"
                  value={newFieldForm.type}
                  onChange={handleNewFieldChange}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="string">Texto</option>
                  <option value="number">Número</option>
                  <option value="integer">Entero</option>
                  <option value="boolean">Sí/No</option>
                  <option value="date">Fecha</option>
                  <option value="array">Lista/Array</option>
                  <option value="object">Objeto</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <input
                  id="fieldRequired"
                  name="required"
                  type="checkbox"
                  checked={newFieldForm.required}
                  onChange={handleNewFieldChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="fieldRequired" className="ml-2 block text-sm text-gray-700">Campo obligatorio</label>
              </div>
            </div>

            {/* Array Configuration */}
            {newFieldForm.type === 'array' && (
              <ArrayConfiguration
                value={newFieldForm.arrayOptions}
                onChange={(options) => setNewFieldForm(prev => ({ ...prev, arrayOptions: options }))}
              />
            )}

            {/* Object Configuration */}
            {newFieldForm.type === 'object' && (
              <ObjectConfiguration
                structure={newFieldForm.objectStructure}
                onChange={(structure) => setNewFieldForm(prev => ({ ...prev, objectStructure: structure }))}
              />
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleAddField}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Agregar Campo
              </button>
              <button
                type="button"
                onClick={() => setShowAddField(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowAddField(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <Plus size={16} />
              Agregar Nuevo Campo
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => {
            if (onSaveGroupConfiguration) {
              onSaveGroupConfiguration(groupForm);
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  );
};

export default FieldForm;
