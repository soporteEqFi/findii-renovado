import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_CONFIG } from '../../config/constants';

interface ColumnConfig {
  nombre: string;
  activo: boolean;
  orden: number;
  nombre_interno?: string;
}

interface TableColumnConfigProps {
  empresaId: number;
  onConfigurationChange?: () => void;
}

// Mapeo de campos disponibles basado en la estructura de datos proporcionada
const AVAILABLE_FIELDS = {
  // Campos del solicitante
  'nombres': 'Nombres',
  'primer_apellido': 'Primer Apellido',
  'segundo_apellido': 'Segundo Apellido',
  'numero_documento': 'Numero Documento',
  'tipo_identificacion': 'Tipo Identificacion',
  'correo': 'Correo',
  'fecha_nacimiento': 'Fecha Nacimiento',
  'genero': 'Genero',
  'celular': 'Celular',
  'estado_civil': 'Estado Civil',
  'fecha_expedicion': 'Fecha Expedicion',
  'lugar_nacimiento': 'Lugar Nacimiento',
  'nacionalidad': 'Nacionalidad',
  'nivel_estudio': 'Nivel Estudio',
  'personas_a_cargo': 'Personas A Cargo',
  'profesion': 'Profesion',
  'telefono': 'Telefono',

  // Campos de ubicación
  'ciudad_residencia': 'Ciudad Residencia',
  'departamento_residencia': 'Departamento Residencia',
  'direccion_residencia': 'Direccion Residencia',
  'tipo_vivienda': 'Tipo Vivienda',
  'paga_arriendo': 'Paga Arriendo',

  // Campos de actividad económica
  'tipo_actividad_economica': 'Tipo Actividad Economica',
  'codigo_ciuu_empresa': 'Codigo CIUU Empresa',
  'correo_electronico_empresa': 'Correo Electronico Empresa',
  'departamento_empresa': 'Departamento Empresa',
  'fecha_ingreso_empresa': 'Fecha Ingreso Empresa',
  'nit_empresa': 'NIT Empresa',
  'nombre_empresa': 'Nombre Empresa',
  'sector_economico_empresa': 'Sector Economico Empresa',
  'telefono_empresa': 'Telefono Empresa',
  'tipo_contrato': 'Tipo Contrato',
  'paga_impuestos_fuera': 'Paga Impuestos Fuera',

  // Campos financieros
  'arriendos': 'Arriendos',
  'declara_renta': 'Declara Renta',
  'gastos_financieros_mensuales': 'Gastos Financieros Mensuales',
  'gastos_personales_mensuales': 'Gastos Personales Mensuales',
  'honorarios': 'Honorarios',
  'ingreso_basico_mensual': 'Ingreso Basico Mensual',
  'ingreso_variable_mensual': 'Ingreso Variable Mensual',
  'ingresos_actividad_independiente': 'Ingresos Actividad Independiente',
  'ingresos_fijos_pension': 'Ingresos Fijos Pension',
  'ingresos_por_ventas': 'Ingresos Por Ventas',
  'ingresos_varios': 'Ingresos Varios',
  'otros_ingresos_mensuales': 'Otros Ingresos Mensuales',
  'total_activos': 'Total Activos',
  'total_egresos_mensuales': 'Total Egresos Mensuales',
  'total_ingresos_mensuales': 'Total Ingresos Mensuales',
  'total_pasivos': 'Total Pasivos',

  // Campos de solicitud
  'banco_nombre': 'Banco',
  'ciudad_solicitud': 'Ciudad Solicitud',
  'estado': 'Estado',
  'tipo_credito': 'Tipo Credito',
  'monto_solicitado': 'Monto Solicitado',
  'plazo_tiempo': 'Plazo Tiempo',

  // Campos de referencias
  'celular_referencia': 'Celular Referencia',
  'ciudad_referencia': 'Ciudad Referencia',
  'nombre_referencia': 'Nombre Referencia',
  'relacion_referencia': 'Relacion Referencia',
  'tipo_referencia': 'Tipo Referencia',

  // Campos del sistema
  'created_by_user_name': 'Creado por'
};

export const TableColumnConfig: React.FC<TableColumnConfigProps> = ({ empresaId, onConfigurationChange }) => {
  const [columnas, setColumnas] = useState<ColumnConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [selectedField, setSelectedField] = useState('');

  useEffect(() => {
    cargarColumnas();
  }, [empresaId]);

  const cargarColumnas = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLUMNAS_TABLA}?empresa_id=${empresaId}`, {
        headers: {
          'X-Empresa-Id': empresaId.toString(),
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.ok) {
        setColumnas(result.data.columnas || []);
      } else {
        throw new Error(result.error || 'Error cargando columnas');
      }
    } catch (error) {
      console.error('Error cargando columnas:', error);
      toast.error('Error cargando configuración de columnas');
    } finally {
      setLoading(false);
    }
  };

  const guardarConfiguracion = async (nuevasColumnas: ColumnConfig[]) => {
    setGuardando(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLUMNAS_TABLA}?empresa_id=${empresaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-Id': empresaId.toString()
        },
        body: JSON.stringify({ columnas: nuevasColumnas })
      });

      const result = await response.json();
      if (result.ok) {
        setColumnas(nuevasColumnas);
        alert('Configuración guardada exitosamente');
        onConfigurationChange?.();
        return true;
      } else {
        throw new Error(result.error || 'Error guardando configuración');
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración');
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const toggleColumnaActiva = async (index: number) => {
    const nuevasColumnas = [...columnas];
    nuevasColumnas[index].activo = !nuevasColumnas[index].activo;
    const success = await guardarConfiguracion(nuevasColumnas);
    if (success) {
      onConfigurationChange?.();
    }
  };

  const eliminarColumna = async (index: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta columna?')) {
      const nuevasColumnas = columnas.filter((_, i) => i !== index);
      // Reordenar índices
      nuevasColumnas.forEach((col, i) => col.orden = i);
      const success = await guardarConfiguracion(nuevasColumnas);
      if (success) {
        onConfigurationChange?.();
      }
    }
  };

  const agregarColumna = async () => {
    if (!selectedField) {
      toast.error('Por favor selecciona un campo');
      return;
    }

    const nombreMostrar = AVAILABLE_FIELDS[selectedField as keyof typeof AVAILABLE_FIELDS];
    if (!nombreMostrar) {
      toast.error('Campo no válido');
      return;
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLUMNAS_TABLA}/agregar?empresa_id=${empresaId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Empresa-Id': empresaId.toString()
        },
        body: JSON.stringify({
          nombre: nombreMostrar,
          nombre_interno: selectedField,
          activo: true,
          orden: columnas.length
        })
      });

      const result = await response.json();
      if (result.ok) {
        await cargarColumnas(); // Recargar la lista
        setSelectedField('');
        setShowAddColumn(false);
        toast.success('Columna agregada exitosamente');
        onConfigurationChange?.();
      } else {
        throw new Error(result.error || 'Error agregando columna');
      }
    } catch (error) {
      console.error('Error agregando columna:', error);
      toast.error('Error al agregar la columna');
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(columnas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar el orden
    items.forEach((item, index) => {
      item.orden = index;
    });

    setColumnas(items);
    const success = await guardarConfiguracion(items);
    if (success) {
      onConfigurationChange?.();
    }
  };

  // Filtrar campos disponibles que no están ya agregados
  const camposDisponibles = Object.entries(AVAILABLE_FIELDS).filter(
    ([key, _]) => !columnas.some(col => col.nombre_interno === key)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Cargando configuración de tabla...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Configuración Tabla</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configura las columnas que se muestran en la tabla principal
          </p>
        </div>
        <button
          onClick={() => setShowAddColumn(true)}
          disabled={guardando || camposDisponibles.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <Plus size={16} />
          <span className="sm:inline">Agregar Columna</span>
        </button>
      </div>

      {/* Formulario para agregar nueva columna */}
      {showAddColumn && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nueva Columna</h3>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campo Disponible
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar campo...</option>
                {camposDisponibles.map(([key, displayName]) => (
                  <option key={key} value={key}>
                    {displayName} ({key})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={agregarColumna}
                disabled={!selectedField || guardando}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setShowAddColumn(false);
                  setSelectedField('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de columnas con drag & drop */}
      <div className="max-h-[60vh] overflow-y-auto">
        {columnas.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="columnas">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {columnas.map((columna, index) => (
                    <Draggable
                      key={`columna-${index}`}
                      draggableId={`columna-${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-white border rounded-lg transition-all ${
                            snapshot.isDragging ? 'shadow-lg rotate-1' : 'shadow-sm'
                          }`}
                        >
                          {/* Mobile layout */}
                          <div className="flex items-center justify-between w-full sm:hidden">
                            <div className="flex items-center gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                              >
                                <GripVertical size={18} />
                              </div>
                              <button
                                onClick={() => toggleColumnaActiva(index)}
                                disabled={guardando}
                                className={`p-1 rounded transition-colors ${
                                  columna.activo
                                    ? 'text-green-600 hover:text-green-700'
                                    : 'text-gray-400 hover:text-gray-500'
                                }`}
                              >
                                {columna.activo ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                #{columna.orden}
                              </span>
                              <button
                                onClick={() => eliminarColumna(index)}
                                disabled={guardando}
                                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Desktop layout */}
                          <div className="hidden sm:flex sm:items-center sm:gap-4 sm:w-full">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                            >
                              <GripVertical size={20} />
                            </div>

                            <div className="flex items-center">
                              <button
                                onClick={() => toggleColumnaActiva(index)}
                                disabled={guardando}
                                className={`p-1 rounded transition-colors ${
                                  columna.activo
                                    ? 'text-green-600 hover:text-green-700'
                                    : 'text-gray-400 hover:text-gray-500'
                                }`}
                              >
                                {columna.activo ? <Eye size={18} /> : <EyeOff size={18} />}
                              </button>
                            </div>

                            <div className="flex-1">
                              <div className={`font-medium ${!columna.activo ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {columna.nombre}
                              </div>
                              {columna.nombre_interno && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Nombre interno: {columna.nombre_interno}
                                </div>
                              )}
                            </div>

                            <div className="text-sm text-gray-500">
                              Orden: {columna.orden}
                            </div>

                            <button
                              onClick={() => eliminarColumna(index)}
                              disabled={guardando}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Column info for mobile */}
                          <div className="w-full sm:hidden">
                            <div className={`font-medium text-sm ${!columna.activo ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {columna.nombre}
                            </div>
                            {columna.nombre_interno && (
                              <div className="text-xs text-gray-500 mt-1">
                                Nombre interno: {columna.nombre_interno}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg mb-2">No hay columnas configuradas</div>
            <div className="text-sm">Agrega columnas para personalizar la tabla principal</div>
          </div>
        )}
      </div>

      {guardando && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Guardando cambios...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableColumnConfig;
