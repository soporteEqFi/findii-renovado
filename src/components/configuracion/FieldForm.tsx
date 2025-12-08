import React, { useEffect, useState } from 'react';
import { FieldDefinition } from '../../types/fieldDefinition';
import { Trash2, Plus, Settings, GripVertical, Save } from 'lucide-react';
import { ConditionalFieldConfig } from './ConditionalFieldConfig';
import { buildApiUrl, API_CONFIG } from '../../config/constants';
import { toast } from 'react-hot-toast';

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
    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/40">
      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Configuración de Array</h5>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Opciones del Array (una por línea)</label>
          <textarea
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={6}
            placeholder="Opción 1
Opción 2
Opción 3
Opción 4
Opción 5
Opción 6"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Presiona Enter para agregar nuevas opciones. Cada línea será una opción del array.</p>
        </div>


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
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newOption, setNewOption] = useState('');

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

  // Funciones para drag-and-drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newOptions = [...value];
    const draggedItem = newOptions[draggedIndex];
    newOptions.splice(draggedIndex, 1);
    newOptions.splice(dropIndex, 0, draggedItem);

    onChange(newOptions);
    setDraggedIndex(null);
  };

  const handleAddOption = () => {
    if (newOption.trim() && !value.includes(newOption.trim())) {
      const newValue = [...value, newOption.trim()];
      onChange(newValue);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = value.filter((_, i) => i !== index);
    onChange(newOptions);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded border border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-gray-600 dark:text-gray-300">Opciones del Array</label>
          {value.length >= 2 && (
            <button
              type="button"
              onClick={() => setReorderMode(!reorderMode)}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                reorderMode
                  ? 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-gray-100 text-gray-600 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
              } hover:bg-blue-50`}
            >
              <GripVertical size={12} />
              {reorderMode ? 'Terminar Orden' : 'Reordenar'}
            </button>
          )}
        </div>

        {reorderMode ? (
          // Vista de reordenamiento con drag-and-drop
          <div className="space-y-2">
            {value.map((option, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <GripVertical size={14} className="text-gray-400" />
                <span className="flex-1 text-sm">{option}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</span>
              </div>
            ))}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Arrastra las opciones para reordenarlas. Haz clic en "Terminar Orden" cuando termines.
            </p>
          </div>
        ) : (
          // Vista normal con lista de opciones
          <div className="space-y-2">
            {value.map((option, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                <span className="flex-1 text-sm">{option}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {/* Campo para agregar nueva opción */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nueva opción..."
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus size={12} />
                Agregar
              </button>
            </div>
          </div>
        )}

        {/* Opción alternativa: textarea para edición masiva */}
        <details className="mt-3">
          <summary className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
            Edición masiva (una por línea)
          </summary>
          <div className="mt-2">
            <textarea
              value={localValue}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={4}
              placeholder="Opción 1\nOpción 2\nOpción 3"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Presiona Enter para agregar nuevas opciones. Cada línea será una opción del array.</p>
          </div>
        </details>
      </div>
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
    order_index?: number;
    arrayOptions?: string[];
    list_values?: { enum?: string[] };
    objectStructure?: { key: string; type: string; required: boolean; description: string; order_index?: number }[];
  }[];
  onChange: (structure: {
    key: string;
    type: string;
    required: boolean;
    description: string;
    order_index?: number;
    arrayOptions?: string[];
    list_values?: { enum?: string[] };
    objectStructure?: { key: string; type: string; required: boolean; description: string; order_index?: number }[];
  }[]) => void;
  isEditing?: boolean;
}> = ({ structure, onChange, isEditing = false }) => {
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Actualizar order_index basado en la posición actual
  const updateOrderIndexes = (items: any[]) => {
    return items.map((item, index) => ({
      ...item,
      order_index: index + 1,
    }));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newStructure = [...structure];
    const [movedItem] = newStructure.splice(draggedIndex, 1);
    newStructure.splice(dropIndex, 0, movedItem);

    // Actualizar los índices de orden
    const updatedStructure = updateOrderIndexes(newStructure);
    onChange(updatedStructure);
    setDraggedIndex(null);
  };

  return (
  <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/40">
    <div className="flex items-center justify-between mb-3">
      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Configuración de Objeto</h5>
      {structure.length >= 2 && (
        <button
          type="button"
          onClick={() => setReorderMode(!reorderMode)}
          className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
            reorderMode
              ? 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
              : 'bg-gray-100 text-gray-600 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
          } hover:bg-blue-50`}
        >
          <GripVertical size={12} />
          {reorderMode ? 'Terminar Orden' : 'Reordenar Campos'}
        </button>
      )}
    </div>
    <div className="space-y-3">
      {structure.map((field, index) => (
        <div
          key={index}
          className={`p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 space-y-2 ${
            reorderMode ? 'cursor-move' : ''
          } ${draggedIndex === index ? 'opacity-50' : ''}`}
          draggable={reorderMode}
          onDragStart={(e) => reorderMode && handleDragStart(e, index)}
          onDragOver={reorderMode ? handleDragOver : undefined}
          onDrop={reorderMode ? (e) => handleDrop(e, index) : undefined}
        >
          {reorderMode && (
            <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400 text-xs">
              <GripVertical size={14} className="text-gray-400" />
              <span>Arrastra para reordenar</span>
              <span className="ml-auto bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                Posición: {index + 1}
              </span>
            </div>
          )}
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
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="string">Texto</option>
              <option value="number">Número</option>
              <option value="integer">Entero</option>
              <option value="boolean">Sí/No</option>
              <option value="date">Fecha</option>
              <option value="array">Lista/Array</option>
              <option value="object">Objeto</option>
            </select>
            <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => {
                  const newStructure = [...structure];
                  newStructure[index].required = e.target.checked;
                  onChange(newStructure);
                }}
                className="mr-1 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              Req.
            </label>
            <button
              type="button"
              onClick={() => {
                const newStructure = structure.filter((_, i) => i !== index);
                onChange(newStructure);
              }}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded border border-gray-200 dark:border-gray-700">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Sub-campos del Objeto</label>
              <div className="space-y-2">
                {(field.objectStructure || []).map((subField, subIndex) => (
                  <div key={subIndex} className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 space-y-1">
                    <div className="grid grid-cols-3 gap-1">
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
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <input
                        type="number"
                        value={subField.order_index || ''}
                        onChange={(e) => {
                          const newStructure = [...structure];
                          const newSubStructure = [...(newStructure[index].objectStructure || [])];
                          newSubStructure[subIndex].order_index = e.target.value ? parseInt(e.target.value) : undefined;
                          newStructure[index].objectStructure = newSubStructure;
                          onChange(newStructure);
                        }}
                        placeholder="Orden"
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        min="1"
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
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="string">Texto</option>
                        <option value="number">Número</option>
                        <option value="integer">Entero</option>
                        <option value="boolean">Sí/No</option>
                        <option value="date">Fecha</option>
                      </select>
                      <label className="flex items-center text-xs text-gray-700 dark:text-gray-300">
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
                          className="mr-1 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
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
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs"
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
                    const newSubStructure = [...(newStructure[index].objectStructure || []), { key: '', type: 'string', required: false, description: '', order_index: undefined }];
                    newStructure[index].objectStructure = newSubStructure;
                    onChange(newStructure);
                  }}
                  className="w-full px-2 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1"
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
          const newStructure = [...structure, { key: '', type: 'string', required: false, description: '', order_index: undefined }];
          onChange(newStructure);
        }}
        className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1"
      >
        <Plus size={14} />
        Agregar Campo al Objeto
      </button>
    </div>
  </div>
);
};

// Componente reutilizable para configuración de Archivo
const FileConfiguration: React.FC<{
  value: {
    allowed_types: string[];
    max_size_mb: number;
    multiple: boolean;
    required_fields: string[];
    storage_path: string;
  };
  onChange: (config: {
    allowed_types: string[];
    max_size_mb: number;
    multiple: boolean;
    required_fields: string[];
    storage_path: string;
  }) => void;
  isEditing?: boolean;
}> = ({ value, onChange, isEditing = false }) => {
  const [newField, setNewField] = useState('');

  const addRequiredField = () => {
    if (newField.trim() && !value.required_fields.includes(newField.trim())) {
      onChange({
        ...value,
        required_fields: [...value.required_fields, newField.trim()]
      });
      setNewField('');
    }
  };

  const removeRequiredField = (field: string) => {
    onChange({
      ...value,
      required_fields: value.required_fields.filter(f => f !== field)
    });
  };

  const addAllowedType = (type: string) => {
    if (type && !value.allowed_types.includes(type)) {
      onChange({
        ...value,
        allowed_types: [...value.allowed_types, type]
      });
    }
  };

  const removeAllowedType = (type: string) => {
    onChange({
      ...value,
      allowed_types: value.allowed_types.filter(t => t !== type)
    });
  };

  return (
    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/40">
      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Configuración de Archivo</h5>

      {/* Tipos de archivo permitidos */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Tipos de archivo permitidos</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {value.allowed_types.map((type) => (
            <span
              key={type}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {type}
              <button
                type="button"
                onClick={() => removeAllowedType(type)}
                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => addAllowedType(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            defaultValue=""
          >
            <option value="">Agregar tipo...</option>
            <option value="pdf">PDF</option>
            <option value="jpg">JPG</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="doc">DOC</option>
            <option value="docx">DOCX</option>
            <option value="xls">XLS</option>
            <option value="xlsx">XLSX</option>
            <option value="txt">TXT</option>
          </select>
        </div>
      </div>

      {/* Tamaño máximo */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Tamaño máximo (MB)</label>
        <input
          type="number"
          value={value.max_size_mb}
          onChange={(e) => onChange({ ...value, max_size_mb: parseInt(e.target.value) || 1 })}
          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          min="1"
          max="100"
        />
      </div>

      {/* Múltiples archivos */}
      <div className="mb-4">
        <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={value.multiple}
            onChange={(e) => onChange({ ...value, multiple: e.target.checked })}
            className="mr-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
          />
          Permitir múltiples archivos
        </label>
      </div>

      {/* Ruta de almacenamiento */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Ruta de almacenamiento</label>
        <input
          type="text"
          value={value.storage_path}
          onChange={(e) => onChange({ ...value, storage_path: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="ej: solicitantes/documentos"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ruta donde se almacenarán los archivos</p>
      </div>

      {/* Campos requeridos adicionales */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Campos adicionales requeridos</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {value.required_fields.map((field) => (
            <span
              key={field}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
              {field}
              <button
                type="button"
                onClick={() => removeRequiredField(field)}
                className="ml-1 text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="ej: descripcion, categoria"
            onKeyPress={(e) => e.key === 'Enter' && addRequiredField()}
          />
          <button
            type="button"
            onClick={addRequiredField}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Agregar
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Campos adicionales que se pedirán para cada archivo</p>
      </div>
    </div>
  );
};

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
  onConfigureCondition?: (field: FieldDefinition) => void;
  onSaveGroupConfiguration?: (groupData: { displayName: string; description: string; isActive: boolean }) => void;
  onGroupUpdate?: (group: EntityGroup) => void;
}

const defaultItem: FieldDefinition = {
  empresa_id: 1,
  entity: 'solicitante',
  json_column: 'info_extra',
  key: '',
  type: 'string',
  required: false,
  isActive: true, // Por defecto los campos están activos
  description: '',
  default_value: '',
};

const FieldForm: React.FC<Props> = ({ initial, selectedGroup, onSubmit, onCancel, onEditField, onDeleteField, onConfigureCondition, onSaveGroupConfiguration, onGroupUpdate }) => {
  const [form, setForm] = useState<FieldDefinition>(initial || defaultItem);
  const [groupForm, setGroupForm] = useState({
    displayName: selectedGroup?.displayName || '',
    description: selectedGroup?.description || '',
    isActive: selectedGroup?.isActive ?? true
  });
  const [newFieldForm, setNewFieldForm] = useState({
    key: '',
    displayName: '',
    type: 'string' as 'string' | 'number' | 'integer' | 'boolean' | 'date' | 'array' | 'object' | 'file',
    required: false,
    isActive: true, // Por defecto los campos están activos
    order_index: undefined as number | undefined,
    min_value: undefined as number | undefined,
    max_value: undefined as number | undefined,
    arrayOptions: [] as string[],
    objectStructure: [] as {
      key: string;
      type: string;
      required: boolean;
      description: string;
      order_index?: number;
      arrayOptions?: string[];
      objectStructure?: { key: string; type: string; required: boolean; description: string; order_index?: number }[];
    }[],
    fileConfig: {
      allowed_types: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'] as string[],
      max_size_mb: 5,
      multiple: false,
      required_fields: [] as string[],
      storage_path: ''
    }
  });
  const [showAddField, setShowAddField] = useState(false);
  const [showConditionalModal, setShowConditionalModal] = useState(false);
  const [fieldToConfigure, setFieldToConfigure] = useState<FieldDefinition | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

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
        description: field.description,
        order_index: field.order_index
      };

                   // Validar y limpiar configuración de array
       if (field.type === 'array') {
         // Si tiene arrayOptions, usarlo; si no, usar list_values.enum existente
         if (field.arrayOptions && field.arrayOptions.length > 0) {
           // Filtrar líneas vacías solo al guardar
           const filteredOptions = field.arrayOptions.filter((opt: string) => opt.trim() !== '');
           cleanedField.list_values = { enum: filteredOptions };
           // Eliminar arrayOptions ya que no debe existir en la estructura final
           delete cleanedField.arrayOptions;
         } else if (field.list_values?.enum) {
           // Si ya tiene list_values.enum, mantenerlo
           cleanedField.list_values = field.list_values;
         }
       }

      // Validar y limpiar configuración de objeto anidado
      if (field.type === 'object' && field.objectStructure && field.objectStructure.length > 0) {
        const nestedStructure = field.objectStructure.map((subField: any) => {
          const nestedField: any = {
            key: subField.key,
            type: subField.type,
            required: subField.required,
            description: subField.description,
            order_index: subField.order_index
          };

                                          // Para sub-campos de tipo array, agregar list_values.enum y eliminar arrayOptions
           if (subField.type === 'array') {
             // Si tiene arrayOptions, usarlo; si no, usar list_values.enum existente
             if (subField.arrayOptions && subField.arrayOptions.length > 0) {
               // Filtrar líneas vacías solo al guardar
               const filteredOptions = subField.arrayOptions.filter((opt: string) => opt.trim() !== '');
               nestedField.list_values = { enum: filteredOptions };
               delete nestedField.arrayOptions;
             } else if (subField.list_values?.enum) {
               // Si ya tiene list_values.enum, mantenerlo
               nestedField.list_values = subField.list_values;
             }
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
      const validTypes = ['string', 'number', 'integer', 'boolean', 'date', 'array', 'object', 'file'];
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

      // Validar configuración de archivo
      if (field.type === 'file') {
        if (!field.fileConfig || !field.fileConfig.allowed_types || field.fileConfig.allowed_types.length === 0) {
          alert(`El campo "${field.description || field.key}" es de tipo archivo pero no tiene tipos permitidos configurados.`);
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

     if (newFieldForm.type === 'file' && newFieldForm.fileConfig.allowed_types.length === 0) {
       alert('El campo es de tipo archivo pero no tiene tipos permitidos configurados.');
       return;
     }

     // Validar que min_value no sea mayor que max_value
     if (
       (newFieldForm.type === 'number' || newFieldForm.type === 'integer') &&
       newFieldForm.min_value !== undefined &&
       newFieldForm.max_value !== undefined &&
       newFieldForm.min_value > newFieldForm.max_value
     ) {
       alert('El valor mínimo no puede ser mayor que el valor máximo.');
       return;
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
      order_index: newFieldForm.order_index,
      min_value: newFieldForm.min_value,
      max_value: newFieldForm.max_value,
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
      } else if (newFieldForm.type === 'file') {
        // Configuración para campos de archivo
        newField.list_values = {
          file_config: {
            allowed_types: newFieldForm.fileConfig.allowed_types,
            max_size_mb: newFieldForm.fileConfig.max_size_mb,
            multiple: newFieldForm.fileConfig.multiple,
            required_fields: newFieldForm.fileConfig.required_fields,
            storage_path: newFieldForm.fileConfig.storage_path
          }
        };
      }

      onSubmit(newField);
     setNewFieldForm({
       key: '',
       displayName: '',
       type: 'string',
       required: false,
       isActive: true,
       order_index: undefined,
       min_value: undefined,
       max_value: undefined,
       arrayOptions: [],
       objectStructure: [],
       fileConfig: {
         allowed_types: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'] as string[],
         max_size_mb: 5,
         multiple: false,
         required_fields: [] as string[],
         storage_path: ''
       }
     });
     setShowAddField(false);
   };

  const handleRemoveField = (field: FieldDefinition) => {
    if (onDeleteField) {
      onDeleteField(field);
    }
  };

  // Funciones para drag-and-drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex || !selectedGroup) {
      setDraggedIndex(null);
      return;
    }

    const sortedFields = [...selectedGroup.fields].sort((a, b) => {
      const orderA = a.order_index || 999;
      const orderB = b.order_index || 999;
      return orderA - orderB;
    });

    const newFields = [...sortedFields];
    const draggedField = newFields[draggedIndex];

    // Remover el campo arrastrado de su posición original
    newFields.splice(draggedIndex, 1);

    // Insertar en la nueva posición
    newFields.splice(dropIndex, 0, draggedField);

    // Actualizar order_index para todos los campos
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order_index: index + 1
    }));

    // Actualizar el selectedGroup con los nuevos órdenes
    if (onGroupUpdate) {
      onGroupUpdate({
        ...selectedGroup,
        fields: updatedFields
      });
    }

    setDraggedIndex(null);
  };

  const handleSaveFieldOrder = async () => {
    if (!selectedGroup || !reorderMode) return;

    setSavingOrder(true);
    try {
      // Si es el grupo de campos fijos, usar localStorage
      if (selectedGroup.entity === 'campos_fijos') {
        const sortedFields = [...selectedGroup.fields].sort((a, b) => {
          const orderA = a.order_index || 999;
          const orderB = b.order_index || 999;
          return orderA - orderB;
        });

        const fieldKeys = sortedFields.map(field => field.key);

        // Importar dinámicamente el servicio para evitar problemas de dependencias circulares
        const { FixedFieldsService } = await import('../../services/fixedFieldsService');
        FixedFieldsService.reorderFields(fieldKeys);

        toast.success(`Orden actualizado para ${fieldKeys.length} campos fijos`);
        setReorderMode(false);

        // Recargar la página de configuración para reflejar los cambios
        window.location.reload();
        return;
      }

      // Para otros grupos, usar la API normal
      const sortedFields = [...selectedGroup.fields].sort((a, b) => {
        const orderA = a.order_index || 999;
        const orderB = b.order_index || 999;
        return orderA - orderB;
      });

      const fieldOrders = sortedFields.map((field, index) => ({
        key: field.key,
        order_index: index + 1
      }));

      const endpoint = API_CONFIG.ENDPOINTS.REORDENAR_CAMPOS
        .replace('{entity}', selectedGroup.entity)
        .replace('{json_field}', selectedGroup.jsonColumn);

      const url = buildApiUrl(endpoint) + `?empresa_id=1`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field_orders: fieldOrders })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      toast.success(`Orden actualizado para ${fieldOrders.length} campos`);
      setReorderMode(false);

    } catch (error: any) {
      console.error('Error saving field order:', error);
      toast.error(error.message || 'Error al guardar el orden de los campos');
    } finally {
      setSavingOrder(false);
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Interno *</label>
            <input
              name="key"
              value={form.key}
              onChange={(e) => setForm(prev => ({ ...prev, key: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="credito_hipotecario"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Identificador único (sin espacios)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre para Mostrar *</label>
            <input
              name="description"
              value={form.description || ''}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Crédito de vivienda"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orden de Aparición</label>
            <input
              type="number"
              name="order_index"
              value={form.order_index || ''}
              onChange={(e) => setForm(prev => ({ ...prev, order_index: e.target.value ? parseInt(e.target.value) : undefined }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="1, 2, 3..."
              min="1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Número que define el orden de aparición (1 = primero, 2 = segundo, etc.)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor por Defecto</label>
            <input
              name="default_value"
              value={form.default_value || ''}
              onChange={(e) => setForm(prev => ({ ...prev, default_value: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Valor predeterminado"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
          <textarea
            name="default_value"
            value={form.default_value || ''}
            onChange={(e) => setForm(prev => ({ ...prev, default_value: e.target.value }))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            rows={3}
            placeholder="Radicación multibanco para créditos de vivienda a nivel nacional."
          />
        </div>

        {/* Validaciones numéricas - Solo para campos number e integer */}
        {(form.type === 'number' || form.type === 'integer') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Mínimo</label>
              <input
                type="number"
                name="min_value"
                value={form.min_value ?? ''}
                onChange={(e) => setForm(prev => ({ ...prev, min_value: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Ej: 0"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor mínimo permitido para este campo numérico</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Máximo</label>
              <input
                type="number"
                name="max_value"
                value={form.max_value ?? ''}
                onChange={(e) => setForm(prev => ({ ...prev, max_value: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Ej: 5"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor máximo permitido para este campo numérico</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <input
              id="required"
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm(prev => ({ ...prev, required: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Obligatorio (REQ)</label>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Activo</label>
          </div>
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
             structure={form.list_values.object_structure.map((field: any) => {
               if (field.type === 'array' && field.list_values?.enum) {
                 return {
                   ...field,
                   arrayOptions: field.list_values.enum
                 };
               }
               return field;
             })}
             onChange={(structure) => {
               // Transformar arrayOptions de vuelta a list_values.enum para campos de tipo array
               const transformedStructure = structure.map((field: any) => {
                 if (field.type === 'array' && field.arrayOptions) {
                   const { arrayOptions, ...fieldWithoutArrayOptions } = field;
                   return {
                     ...fieldWithoutArrayOptions,
                     list_values: {
                       ...field.list_values,
                       enum: arrayOptions
                     }
                   };
                 }
                 // Para campos que no son array, devolver tal como están
                 return field;
               });

               setForm(prev => ({
                 ...prev,
                 list_values: { ...prev.list_values, object_structure: transformedStructure }
               }));
             }}
             isEditing={true}
           />
         )}

        {/* Configuración de archivo */}
        {form.type === 'file' && form.list_values?.file_config && (
          <FileConfiguration
            value={form.list_values.file_config}
            onChange={(config) => setForm(prev => ({
              ...prev,
              list_values: { ...prev.list_values, file_config: config }
            }))}
            isEditing={true}
          />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
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
      <div className={`bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-4 rounded-lg ${showAddField ? 'opacity-50' : ''}`}>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Información de la Entidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Interno *</label>
            <input
              value={selectedGroup?.entity || ''}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="credito_hipotecario"
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Identificador único (sin espacios)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre para Mostrar *</label>
            <input
              name="displayName"
              value={groupForm.displayName}
              onChange={handleGroupFormChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Crédito de vivienda"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
          <textarea
            name="description"
            value={groupForm.description}
            onChange={handleGroupFormChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Activo</label>
        </div>
      </div>

      {/* Fields Configuration Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Campos Personalizados</h3>
        <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Campos Configurados</h4>
            {selectedGroup && selectedGroup.fields.length > 1 && (
              <div className="flex gap-2">
                {reorderMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setReorderMode(false)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveFieldOrder}
                      disabled={savingOrder}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {savingOrder ? <Save size={14} className="animate-pulse" /> : <Save size={14} />}
                      {savingOrder ? 'Guardando...' : 'Guardar Orden'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReorderMode(true)}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 flex items-center gap-1"
                  >
                    <GripVertical size={14} />
                    Reordenar
                  </button>
                )}
              </div>
            )}
          </div>

          {reorderMode && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Modo Reordenamiento:</strong> Arrastra los campos para cambiar su orden en los formularios.
            </div>
          )}

          {selectedGroup && selectedGroup.fields.length > 0 ? (
            <div className="space-y-2">
              {selectedGroup.fields
                .sort((a, b) => {
                  // Ordenar por order_index, si no tiene order_index va al final
                  const orderA = a.order_index || 999;
                  const orderB = b.order_index || 999;
                  return orderA - orderB;
                })
                .map((field, index) => (
                <div
                  key={field.key}
                  className={`
                    flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700
                    ${reorderMode ? 'cursor-move hover:shadow-md transition-shadow' : ''}
                    ${draggedIndex === index ? 'opacity-50 transform rotate-1' : ''}
                  `}
                  draggable={reorderMode}
                  onDragStart={(e) => reorderMode && handleDragStart(e, index)}
                  onDragOver={(e) => reorderMode && handleDragOver(e)}
                  onDrop={(e) => reorderMode && handleDrop(e, index)}
                >
                  <div className="flex items-center gap-3">
                    {reorderMode && (
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                    )}
                    {field.order_index ? (
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                        {field.order_index}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs font-medium rounded-full">
                        ?
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{field.description || field.key}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {field.key} - Tipo: {field.type} {field.required ? '(Obligatorio)' : ''}
                      </div>
                    </div>
                  </div>
                  {!reorderMode && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
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
                         className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm"
                         onClick={() => {
                           setFieldToConfigure(field);
                           setShowConditionalModal(true);
                         }}
                         title="Configurar condición"
                       >
                         <Settings size={16} />
                       </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                        onClick={() => handleRemoveField(field)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No hay campos configurados</p>
          )}
        </div>

        {/* Add New Field Section */}
        {showAddField ? (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-300">✨ Agregar Nuevo Campo</h4>
              <button
                type="button"
                onClick={() => setShowAddField(false)}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
              >
                ✕ Cancelar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Nombre Interno</label>
                <input
                  name="key"
                  value={newFieldForm.key}
                  onChange={handleNewFieldChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Sin espacios ni caracteres especiales"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Nombre para Mostrar</label>
                <input
                  name="displayName"
                  value={newFieldForm.displayName}
                  onChange={handleNewFieldChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Tipo de Campo</label>
                <select
                  name="type"
                  value={newFieldForm.type}
                  onChange={handleNewFieldChange}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="string">Texto</option>
                  <option value="number">Número</option>
                  <option value="integer">Entero</option>
                  <option value="boolean">Sí/No</option>
                  <option value="date">Fecha</option>
                  <option value="array">Lista/Array</option>
                  <option value="object">Objeto</option>
                  <option value="file">Archivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Orden de Aparición</label>
                <input
                  type="number"
                  name="order_index"
                  value={newFieldForm.order_index || ''}
                  onChange={(e) => setNewFieldForm(prev => ({ ...prev, order_index: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="1, 2, 3..."
                  min="1"
                />
              </div>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center">
                  <input
                    id="fieldRequired"
                    name="required"
                    type="checkbox"
                    checked={newFieldForm.required}
                    onChange={handleNewFieldChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                  <label htmlFor="fieldRequired" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Obligatorio (REQ)</label>
                </div>

                <div className="flex items-center">
                  <input
                    id="fieldActive"
                    name="isActive"
                    type="checkbox"
                    checked={newFieldForm.isActive ?? true}
                    onChange={(e) => setNewFieldForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                  <label htmlFor="fieldActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Activo</label>
                </div>
              </div>
            </div>

            {/* Validaciones numéricas - Solo para campos number e integer */}
            {(newFieldForm.type === 'number' || newFieldForm.type === 'integer') && (
              <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Validaciones Numéricas</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Valor Mínimo</label>
                    <input
                      type="number"
                      value={newFieldForm.min_value ?? ''}
                      onChange={(e) => setNewFieldForm(prev => ({ ...prev, min_value: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Ej: 0"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor mínimo permitido para este campo numérico</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Valor Máximo</label>
                    <input
                      type="number"
                      value={newFieldForm.max_value ?? ''}
                      onChange={(e) => setNewFieldForm(prev => ({ ...prev, max_value: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Ej: 5"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor máximo permitido para este campo numérico</p>
                  </div>
                </div>
              </div>
            )}

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

            {/* File Configuration */}
            {newFieldForm.type === 'file' && (
              <FileConfiguration
                value={newFieldForm.fileConfig}
                onChange={(config) => setNewFieldForm(prev => ({ ...prev, fileConfig: config }))}
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2"
            >
              <Plus size={16} />
              Agregar Nuevo Campo
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
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

      {/* Modal de Configuración de Condiciones */}
      {showConditionalModal && fieldToConfigure && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ConditionalFieldConfig
              campo={fieldToConfigure}
              camposDisponibles={selectedGroup?.fields || []}
              onSave={(campoKey, conditionalConfig) => {
                if (onConfigureCondition) {
                  // Crear un campo actualizado con la condición
                  const updatedField = {
                    ...fieldToConfigure,
                    conditional_on: conditionalConfig.field ? conditionalConfig : undefined
                  };
                  onConfigureCondition(updatedField);
                }
                setShowConditionalModal(false);
                setFieldToConfigure(null);
              }}
              onCancel={() => {
                setShowConditionalModal(false);
                setFieldToConfigure(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldForm;
