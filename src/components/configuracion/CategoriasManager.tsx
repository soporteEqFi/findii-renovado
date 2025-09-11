import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { categoriasService } from '../../services/categoriasService';
import {
  CategoriaListItem,
  CreateCategoriaRequest,
  detectConfigFormat,
  ConfigFormat
} from '../../types/categoria';

interface CategoriasManagerProps {
  empresaId?: number;
}

const CategoriasManager: React.FC<CategoriasManagerProps> = () => {
  const [categorias, setCategorias] = useState<CategoriaListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingCategoria, setEditingCategoria] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCategoriaRequest>({
    configuracion: [],
    descripcion: ''
  });
  const [originalConfig, setOriginalConfig] = useState<any>(null);
  const [configFormat, setConfigFormat] = useState<ConfigFormat>('simple_array');
  const [showAdvancedEditor, setShowAdvancedEditor] = useState<boolean>(false);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriasService.getCategorias();
      // Validar que la respuesta sea un array
      if (Array.isArray(data)) {
        setCategorias(data);
      } else {
        console.error('Respuesta inesperada del servidor:', data);
        setCategorias([]);
        setError('Formato de respuesta inesperado del servidor');
      }
    } catch (error: any) {
      console.error('Error cargando categorías:', error);
      setCategorias([]);
      setError(error.message || 'Error cargando categorías');

      // Si es un error 404, probablemente el endpoint no existe aún
      if (error.message?.includes('404')) {
        setError('El endpoint de categorías no está disponible. Asegúrate de que el backend esté implementado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategoria(null);
    setFormData({ configuracion: [], descripcion: '' });
    setConfigFormat('simple_array');
    setShowAdvancedEditor(false);
    setShowForm(true);
  };

  const handleEdit = async (categoria: string) => {
    setLoadingDetails(categoria);
    try {
      const categoriaData = await categoriasService.getCategoria(categoria);
      setEditingCategoria(categoria);

      // Preservar los datos originales tal como vienen del servidor
      setOriginalConfig(categoriaData.configuracion);
      setFormData({
        configuracion: categoriaData.configuracion,
        descripcion: categoriaData.descripcion
      });

      // Detectar formato automáticamente
      const format = detectConfigFormat(categoriaData.configuracion);
      setConfigFormat(format);
      setShowAdvancedEditor(format === 'complex');

      setShowForm(true);
    } catch (error: any) {
      toast.error(error.message || 'Error cargando categoría');
    } finally {
      setLoadingDetails(null);
    }
  };

  const handleDelete = async (categoria: string) => {
    if (!confirm(`¿Eliminar la categoría "${categoria}"?`)) return;

    try {
      await categoriasService.deleteCategoria(categoria);
      toast.success('Categoría eliminada');
      loadCategorias();
    } catch (error: any) {
      toast.error(error.message || 'Error eliminando categoría');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar datos
    if (!formData.descripcion.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    const validation = categoriasService.validateConfiguracion(formData.configuracion);
    if (!validation.isValid) {
      toast.error(`Errores de validación: ${validation.errors.join(', ')}`);
      return;
    }

    try {
      if (editingCategoria) {
        // Actualizar categoría existente
        await categoriasService.updateCategoria(editingCategoria, formData);
        toast.success('Categoría actualizada');
      } else {
        // Crear nueva categoría - necesitamos el nombre de la categoría
        const categoriaName = prompt('Ingrese el nombre de la categoría:');
        if (!categoriaName?.trim()) {
          toast.error('El nombre de la categoría es requerido');
          return;
        }

        await categoriasService.createCategoria(categoriaName.trim(), formData);
        toast.success('Categoría creada');
      }

      setShowForm(false);
      setEditingCategoria(null);
      loadCategorias();
    } catch (error: any) {
      toast.error(error.message || 'Error guardando categoría');
    }
  };

  const handleConfigFormatChange = (format: ConfigFormat) => {
    setConfigFormat(format);

    // Solo convertir si realmente es necesario y preservar los datos originales
    setFormData(prev => {
      const currentConfig = prev.configuracion;

      // Si ya estamos en el formato correcto, no convertir
      if (format === 'simple_array' && Array.isArray(currentConfig) && currentConfig.every(item => typeof item === 'string')) {
        return prev;
      }

      // Si estamos editando y tenemos datos originales, usar esos como base
      const baseConfig = editingCategoria && originalConfig ? originalConfig : currentConfig;

      // Solo convertir si es necesario
      switch (format) {
        case 'simple_array':
          return {
            ...prev,
            configuracion: categoriasService.convertToSimpleArray(baseConfig)
          };
        case 'complex':
          setShowAdvancedEditor(true);
          return {
            ...prev,
            configuracion: baseConfig
          };
        default:
          return prev;
      }
    });
  };

  const addSimpleItem = () => {
    setFormData(prev => ({
      ...prev,
      configuracion: [...(prev.configuracion as string[]), '']
    }));
  };

  const updateSimpleItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      configuracion: (prev.configuracion as string[]).map((item, i) =>
        i === index ? value : item
      )
    }));
  };

  const removeSimpleItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      configuracion: (prev.configuracion as string[]).filter((_, i) => i !== index)
    }));
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando categorías...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Gestión de Categorías</h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar categorías</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadCategorias}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Gestión de Categorías</h2>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CATEGORÍA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DESCRIPCIÓN
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
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay categorías configuradas
                </td>
              </tr>
            ) : (
              categorias.map((categoria, index) => (
                <tr key={categoria.categoria} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{categoria.categoria}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md">{categoria.descripcion}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      categoria.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {categoria.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(categoria.categoria)}
                        disabled={loadingDetails === categoria.categoria}
                        className={`font-medium flex items-center gap-1 ${
                          loadingDetails === categoria.categoria
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                        title="Editar"
                      >
                        {loadingDetails === categoria.categoria ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                            Cargando...
                          </>
                        ) : (
                          <>
                            <Edit size={16} />
                            Editar
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(categoria.categoria)}
                        className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editingCategoria ? `Editar Categoría: ${editingCategoria}` : 'Crear Nueva Categoría'}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditingCategoria(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción de la categoría"
                    required
                  />
                </div>

                {/* Selector de formato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato de Configuración
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          value="simple_array"
                          checked={configFormat === 'simple_array'}
                          onChange={() => handleConfigFormatChange('simple_array')}
                          className="mr-2"
                        />
                        <span className="font-medium">Lista Simple</span>
                      </div>
                      <p className="text-xs text-gray-600 ml-6">
                        Array de strings simples. Ideal para listas como ciudades, tipos de documento, bancos, etc.
                      </p>
                    </label>

                    <label className="flex flex-col p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          value="complex"
                          checked={configFormat === 'complex'}
                          onChange={() => handleConfigFormatChange('complex')}
                          className="mr-2"
                        />
                        <span className="font-medium">Configuración Compleja</span>
                      </div>
                      <p className="text-xs text-gray-600 ml-6">
                        Estructura JSON libre. Para configuraciones muy específicas, anidadas o con múltiples propiedades.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Editor según formato */}
                {configFormat === 'simple_array' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Elementos de la Lista
                    </label>
                    <div className="space-y-2">
                      {(formData.configuracion as string[]).map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateSimpleItem(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Elemento ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeSimpleItem(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addSimpleItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Agregar Elemento
                      </button>
                    </div>
                  </div>
                )}


                {configFormat === 'complex' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuración JSON
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedEditor(!showAdvancedEditor)}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-1"
                      >
                        {showAdvancedEditor ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showAdvancedEditor ? 'Ocultar' : 'Mostrar'} Editor JSON
                      </button>
                    </div>
                    {showAdvancedEditor ? (
                      <textarea
                        value={JSON.stringify(formData.configuracion, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setFormData(prev => ({ ...prev, configuracion: parsed }));
                          } catch (error) {
                            // No actualizar si el JSON es inválido
                          }
                        }}
                        className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="Ingrese la configuración en formato JSON"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          Configuración compleja detectada. Use el editor JSON para modificarla.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingCategoria(null); }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingCategoria ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasManager;
