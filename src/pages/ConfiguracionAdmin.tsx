import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { FieldDefinition } from '../types/fieldDefinition';
import { fieldConfigService } from '../services/fieldConfigService';
import { conditionalFieldService } from '../services/conditionalFieldService';
import FieldForm from '../components/configuracion/FieldForm';
import { ConditionalFieldConfig } from '../components/configuracion/ConditionalFieldConfig';
import { toast } from 'react-hot-toast';
import TableColumnConfig from '../components/configuracion/TableColumnConfig';
import CategoriasManager from '../components/configuracion/CategoriasManager';
import { FixedFieldsService } from '../services/fixedFieldsService';

interface EntityGroup {
  entity: string;
  jsonColumn: string;
  displayName: string;
  description: string;
  fields: FieldDefinition[];
  fieldCount: number;
  isActive: boolean;
}

const ConfiguracionAdmin: React.FC = () => {
  const [entityGroups, setEntityGroups] = useState<EntityGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editing, setEditing] = useState<FieldDefinition | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<EntityGroup | null>(null);
  const [showConditionalConfig, setShowConditionalConfig] = useState<boolean>(false);
  const [configuringField, setConfiguringField] = useState<FieldDefinition | null>(null);
  const [activeTab, setActiveTab] = useState<'campos' | 'tabla' | 'categorias'>('campos');

  const entityConfig = useMemo(() => ([
    {
      entity: 'solicitante',
      jsonColumn: 'info_extra',
      displayName: 'Solicitante',
      description: 'Configuración de campos personalizados para información del solicitante.'
    },
    {
      entity: 'ubicacion',
      jsonColumn: 'detalle_direccion',
      displayName: 'Ubicación',
      description: 'Configuración de campos personalizados para información de ubicación y direcciones.'
    },
    {
      entity: 'actividad_economica',
      jsonColumn: 'detalle_actividad',
      displayName: 'Actividad Económica',
      description: 'Configuración de campos personalizados para información de actividad económica.'
    },
    {
      entity: 'informacion_financiera',
      jsonColumn: 'detalle_financiera',
      displayName: 'Información Financiera',
      description: 'Configuración de campos personalizados para información financiera del solicitante.'
    },
    {
      entity: 'referencia',
      jsonColumn: 'detalle_referencia',
      displayName: 'Referencias',
      description: 'Configuración de campos personalizados para información de referencias personales.'
    },
    {
      entity: 'solicitud',
      jsonColumn: 'detalle_credito',
      displayName: 'Solicitud',
      description: 'Configuración de campos personalizados para información de la solicitud de crédito.'
    }
  ]), []);

  const loadAllGroups = async () => {
    setLoading(true);
    try {
      const groups: EntityGroup[] = [];

      for (const config of entityConfig) {
        try {
          const fields = await fieldConfigService.listBy(config.entity, config.jsonColumn);
          groups.push({
            ...config,
            fields: fields.map(field => ({ ...field, entity: config.entity, json_column: config.jsonColumn })),
            fieldCount: fields.length,
            isActive: true
          });
        } catch (e) {
          // Si hay error cargando un grupo específico, agregarlo con 0 campos
          groups.push({
            ...config,
            fields: [],
            fieldCount: 0,
            isActive: true
          });
        }
      }

      // Agregar grupo de campos fijos con orden personalizado
      const fixedFieldsOrdered = FixedFieldsService.getFixedFields();
      const fixedFieldsAsDefinitions = fixedFieldsOrdered.map((field, index) => ({
        id: `fixed_${field.key}`,
        empresa_id: 1,
        key: field.key,
        type: field.type,
        description: field.description,
        required: field.required || false,
        entity: 'campos_fijos',
        json_column: 'info_general',
        order_index: index + 1,
        default_value: field.default_value || null,
        list_values: field.list_values || null,
        conditional_on: undefined,
        isActive: true
      }));
      
      groups.push({
        entity: 'campos_fijos',
        jsonColumn: 'info_general',
        displayName: 'Campos Fijos',
        description: 'Campos fijos del formulario que no pertenecen a ninguna entidad específica de la base de datos.',
        fields: fixedFieldsAsDefinitions,
        fieldCount: fixedFieldsAsDefinitions.length,
        isActive: true
      });

      setEntityGroups(groups);
    } catch (e: any) {
      toast.error(e.message || 'Error cargando configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllGroups();
  }, []);

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (group: EntityGroup) => {
    setSelectedGroup(group);
    setEditing(null);
    setShowForm(true);
  };

  const handleEditField = (field: FieldDefinition) => {
    // Si es un campo fijo, no permitir edición
    if (field.entity === 'campos_fijos') {
      toast.error('Los campos fijos no se pueden editar. Son campos base del formulario.');
      return;
    }
    
    const group = entityGroups.find(g => g.entity === field.entity && g.jsonColumn === field.json_column);
    setSelectedGroup(group || null);
    setEditing(field);
    setShowForm(true);
  };

  const handleDeleteField = async (field: FieldDefinition) => {
    if (!confirm(`¿Eliminar el campo "${field.description || field.key}"?`)) return;
    
    try {
      // Si es un campo fijo, no intentar eliminarlo de la BD
      if (field.entity === 'campos_fijos') {
        toast.error('Los campos fijos no se pueden eliminar. Son campos base del formulario.');
        return;
      }

      await fieldConfigService.delete(field.entity, field.json_column, field.key);
      toast.success('Campo eliminado');

      // Update only the selected group's fields without closing modal
      if (selectedGroup) {
        const updatedFields = selectedGroup.fields.filter(f => f.key !== field.key);
        const updatedGroup = { ...selectedGroup, fields: updatedFields, fieldCount: updatedFields.length };
        setSelectedGroup(updatedGroup);

        // Update the entityGroups state
        setEntityGroups(prev => prev.map(group =>
          group.entity === selectedGroup.entity && group.jsonColumn === selectedGroup.jsonColumn
            ? updatedGroup
            : group
        ));
      }
    } catch (e: any) {
      toast.error(e.message || 'Error eliminando campo');
    }
  };

  const handleConfigureCondition = (field: FieldDefinition) => {
    setConfiguringField(field);
    setShowConditionalConfig(true);
  };

  const handleSaveCondition = async (campoKey: string, conditionalConfig: any) => {
    console.log('ConfiguracionAdmin - handleSaveCondition iniciado:', { campoKey, conditionalConfig, configuringField });

    if (!configuringField) {
      console.log('ConfiguracionAdmin - No hay configuringField');
      return;
    }

    try {
      // Validar que el campo tenga ID
      if (!configuringField.id) {
        toast.error('Error: El campo no tiene ID válido');
        return;
      }

      // Validar la condición antes de guardar
      // Si no hay campo activador seleccionado, significa que se quiere remover la condición
      if (conditionalConfig.field) {
        const validation = conditionalFieldService.validateCondition(conditionalConfig);
        if (!validation.isValid) {
          toast.error(`Errores de validación: ${validation.errors.join(', ')}`);
          return;
        }
      }

      console.log('Enviando actualización:', {
        fieldKey: configuringField.key,
        entity: configuringField.entity,
        jsonColumn: configuringField.json_column,
        conditionalConfig: conditionalConfig.field ? conditionalConfig : null
      });

      // Actualizar la condición en el backend
      await conditionalFieldService.updateFieldCondition(
        configuringField.key,
        configuringField.entity,
        configuringField.json_column,
        conditionalConfig.field ? conditionalConfig : null
      );

      // Actualizar el estado local
      if (selectedGroup) {
        const updatedFields = selectedGroup.fields.map(f =>
          f.key === configuringField.key ? { ...f, conditional_on: conditionalConfig.field ? conditionalConfig : undefined } : f
        );
        const updatedGroup = { ...selectedGroup, fields: updatedFields };
        setSelectedGroup(updatedGroup);

        // Update the entityGroups state
        setEntityGroups(prev => prev.map(group =>
          group.entity === selectedGroup.entity && group.jsonColumn === selectedGroup.jsonColumn
            ? updatedGroup
            : group
        ));
      }

      toast.success('Condición guardada exitosamente');
      setShowConditionalConfig(false);
      setConfiguringField(null);
    } catch (e: any) {
      console.error('Error guardando condición:', e);
      toast.error(e.message || 'Error guardando condición');
    }
  };

  const handleCancelCondition = () => {
    setShowConditionalConfig(false);
    setConfiguringField(null);
  };

  const handleDelete = async (group: EntityGroup) => {
    if (!confirm(`¿Eliminar toda la configuración de "${group.displayName}"?`)) return;
    try {
      // Eliminar todos los campos del grupo
      for (const field of group.fields) {
        await fieldConfigService.delete(field.entity, field.json_column, field.key);
      }
      toast.success('Configuración eliminada');
      loadAllGroups();
    } catch (e: any) {
      toast.error(e.message || 'Error eliminando');
    }
  };

  const handleSubmit = async (data: FieldDefinition) => {
    try {
      const targetGroup = selectedGroup || entityGroups[0];
      const payload: FieldDefinition = {
        ...data,
        entity: targetGroup.entity,
        json_column: targetGroup.jsonColumn,
      };

      if (editing && editing.id) {
        // Si estamos editando un campo existente, usar updateField para actualizar solo ese campo
        const updates: Partial<FieldDefinition> = {
          key: data.key,
          type: data.type,
          required: data.required,
          description: data.description,
          default_value: data.default_value,
          order_index: data.order_index,
          list_values: data.list_values
        };

        await fieldConfigService.updateField(editing.id, updates);
        toast.success('Campo actualizado');
      } else {
        // Si es un campo nuevo, usar upsert
        await fieldConfigService.upsert(targetGroup.entity, targetGroup.jsonColumn, [payload]);
        toast.success('Campo creado');
      }

      // Recargar todos los grupos para obtener los campos con IDs correctos
      await loadAllGroups();

      // Buscar el grupo actualizado y establecerlo como seleccionado
      const updatedGroups = await Promise.all(
        entityConfig.map(async (config) => {
          try {
            const fields = await fieldConfigService.listBy(config.entity, config.jsonColumn);
            return {
              ...config,
              fields: fields.map(field => ({ ...field, entity: config.entity, json_column: config.jsonColumn })),
              fieldCount: fields.length,
              isActive: true
            };
          } catch (e) {
            return {
              ...config,
              fields: [],
              fieldCount: 0,
              isActive: true
            };
          }
        })
      );

      const refreshedGroup = updatedGroups.find(g =>
        g.entity === targetGroup.entity && g.jsonColumn === targetGroup.jsonColumn
      );

      if (refreshedGroup) {
        setSelectedGroup(refreshedGroup);
      }

      // Trigger a refresh of useEsquemaCompleto hooks by dispatching a custom event
      window.dispatchEvent(new CustomEvent('fieldConfigChanged', {
        detail: {
          entity: targetGroup.entity,
          jsonColumn: targetGroup.jsonColumn,
          action: editing ? 'update' : 'create'
        }
      }));

      // Only reset editing state, keep modal open
      setEditing(null);
    } catch (e: any) {
      toast.error(e.message || 'Error guardando');
    }
  };

  const handleSaveGroupConfiguration = async (groupData: { displayName: string; description: string; isActive: boolean }) => {
    try {
      // Here you would implement the group configuration save logic
      // For now, we'll just update the local state and show a success message
      if (selectedGroup) {
        const updatedGroup = {
          ...selectedGroup,
          displayName: groupData.displayName,
          description: groupData.description,
          isActive: groupData.isActive
        };
        setSelectedGroup(updatedGroup);

        // Update the entityGroups state
        setEntityGroups(prev => prev.map(group =>
          group.entity === selectedGroup.entity && group.jsonColumn === selectedGroup.jsonColumn
            ? updatedGroup
            : group
        ));

        toast.success('Configuración guardada exitosamente');

        // Close modal after saving
        setShowForm(false);
        setEditing(null);
        setSelectedGroup(null);
      }
    } catch (e: any) {
      toast.error(e.message || 'Error guardando configuración del grupo');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Configuración</h1>
        {activeTab === 'campos' && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium w-full sm:w-auto"
          >
            <Plus size={16} />
            <span className="sm:inline">Crear Nuevo</span>
          </button>
        )}
      </div>

      {/* Navegación por pestañas */}
      <div className="mb-6">
        <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('campos')}
            className={`py-2 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'campos'
                ? 'border-blue-500 text-blue-600 bg-blue-50 sm:bg-transparent rounded sm:rounded-none'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-100 sm:hover:bg-transparent rounded sm:rounded-none'
            }`}
          >
            <span className="sm:hidden">📝 </span>Configuración Campos
          </button>
          <button
            onClick={() => setActiveTab('tabla')}
            className={`py-2 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'tabla'
                ? 'border-blue-500 text-blue-600 bg-blue-50 sm:bg-transparent rounded sm:rounded-none'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-100 sm:hover:bg-transparent rounded sm:rounded-none'
            }`}
          >
            <span className="sm:hidden">📊 </span>Configuración Tabla
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`py-2 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'categorias'
                ? 'border-blue-500 text-blue-600 bg-blue-50 sm:bg-transparent rounded sm:rounded-none'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-100 sm:hover:bg-transparent rounded sm:rounded-none'
            }`}
          >
            <span className="sm:hidden">🏷️ </span>Gestión Categorías
          </button>
        </nav>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editing ? 'Editar Campo' : selectedGroup ? `Agregar Campo a ${selectedGroup.displayName}` : 'Crear Nuevo Campo'}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditing(null); setSelectedGroup(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <FieldForm
                initial={editing || undefined}
                selectedGroup={selectedGroup}
                entityGroups={entityGroups}
                onCancel={() => { setShowForm(false); setEditing(null); setSelectedGroup(null); }}
                onSubmit={handleSubmit}
                onEditField={handleEditField}
                onDeleteField={handleDeleteField}
                onConfigureCondition={handleConfigureCondition}
                onSaveGroupConfiguration={handleSaveGroupConfiguration}
                onGroupUpdate={(updatedGroup: EntityGroup) => {
                  // Actualizar el grupo en el estado local
                  setEntityGroups(prev => prev.map(group =>
                    group.entity === updatedGroup.entity && group.jsonColumn === updatedGroup.jsonColumn
                      ? updatedGroup
                      : group
                  ));
                  setSelectedGroup(updatedGroup);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Condiciones */}
      {showConditionalConfig && configuringField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <ConditionalFieldConfig
              campo={configuringField}
              camposDisponibles={selectedGroup?.fields || []}
              onSave={handleSaveCondition}
              onCancel={handleCancelCondition}
            />
          </div>
        </div>
      )}

      {/* Contenido de las pestañas */}
      {activeTab === 'campos' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Vista de tabla para pantallas grandes */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NOMBRE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DESCRIPCIÓN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CAMPOS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ESTADO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entityGroups.map((group) => (
                  <tr key={`${group.entity}-${group.jsonColumn}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{group.displayName}</div>
                      <div className="text-xs text-gray-500">{group.entity}_{group.jsonColumn}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">{group.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{group.fieldCount} campos</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(group)}
                        className="text-blue-600 hover:text-blue-800 mr-4 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(group)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Vista de tarjetas para pantallas pequeñas y medianas */}
          <div className="lg:hidden space-y-4 p-4">
            {entityGroups.map((group) => (
              <div key={`${group.entity}-${group.jsonColumn}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{group.displayName}</h3>
                      <p className="text-xs text-gray-500 mt-1">{group.entity}_{group.jsonColumn}</p>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 ml-2">
                      Activo
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <p className="line-clamp-2">{group.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">{group.fieldCount} campos</span>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(group)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(group)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tabla' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TableColumnConfig empresaId={1} />
        </div>
      )}

      {activeTab === 'categorias' && (
        <CategoriasManager empresaId={1} />
      )}
    </div>
  );
};

export default ConfiguracionAdmin;
