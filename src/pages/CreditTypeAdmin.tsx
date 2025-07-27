import React, { useEffect, useState } from 'react';
import { CreditType } from '../types/creditTypes';
import { CreditTypeForm } from '../components/admin/CreditTypeForm';
import { getCreditTypes, createCreditType, updateCreditType, deleteCreditType, clearCreditTypesCache } from '../services/creditTypeService';
import toast from 'react-hot-toast';

export const CreditTypeAdmin: React.FC = () => {
  const [creditTypes, setCreditTypes] = useState<CreditType[]>([]);
  const [selectedCreditType, setSelectedCreditType] = useState<CreditType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('=== CREDIT TYPE ADMIN: useEffect ejecutado ===');
    console.log('Componente montado, cargando tipos de crédito...');
    loadCreditTypes();
  }, []);

  const loadCreditTypes = async () => {
    setIsLoading(true);
    try {
      const cedula = localStorage.getItem('cedula');
      if (!cedula) {
        toast.error('No se encontró la cédula en localStorage');
        return;
      }
      
      console.log('=== CARGANDO TIPOS DE CRÉDITO ===');
      console.log('Cédula:', cedula);
      
      // Limpiar el caché para forzar recarga
      clearCreditTypesCache(cedula);
      console.log('Caché limpiado');
      
      const data = await getCreditTypes(cedula);
      console.log('Datos obtenidos del backend:', data);
      console.log('Cantidad de tipos de crédito:', data.length);
      
      // Verificar que cada tipo de crédito tenga un ID válido
      data.forEach((creditType, index) => {
        console.log(`Tipo de crédito ${index}:`, {
          id: creditType.id,
          name: creditType.name,
          displayName: creditType.displayName,
          hasValidId: creditType.id && creditType.id.length > 0
        });
      });
      
      setCreditTypes(data);
      console.log('Estado actualizado con nuevos datos');
    } catch (error) {
      toast.error('Error al cargar los tipos de crédito');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedCreditType(null);
    setIsEditing(true);
  };

  const handleEdit = (creditType: CreditType) => {
    setSelectedCreditType(creditType);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    console.log('=== INICIANDO ELIMINACIÓN DE TIPO DE CRÉDITO ===');
    console.log('ID a eliminar:', id);
    console.log('Tipo del ID:', typeof id);
    console.log('ID es válido:', id && id.length > 0);
    
    if (!id || id.length === 0) {
      toast.error('ID de tipo de crédito inválido');
      return;
    }
    
    if (window.confirm('¿Está seguro de que desea eliminar este tipo de crédito? Esta acción no se puede deshacer.')) {
      try {
        console.log('Confirmación aceptada, procediendo con la eliminación...');
        await deleteCreditType(id);
        
        console.log('Eliminación exitosa, limpiando caché...');
        const cedula = localStorage.getItem('cedula');
        if (cedula) {
          clearCreditTypesCache(cedula);
        }
        
        console.log('Recargando lista de tipos de crédito...');
        await loadCreditTypes();
        
        toast.success('Tipo de crédito eliminado con éxito');
        console.log('=== ELIMINACIÓN COMPLETADA ===');
      } catch (error) {
        console.error('Error durante la eliminación:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast.error(`Error al eliminar el tipo de crédito: ${errorMessage}`);
      }
    } else {
      console.log('Eliminación cancelada por el usuario');
    }
  };

  const handleSave = async (creditType: CreditType) => {
    const cedula = localStorage.getItem('cedula');
    if (!cedula) {
      toast.error('No se encontró la cédula en localStorage');
      return;
    }
    
    try {
      if (selectedCreditType) {
        console.log('Actualizando tipo de crédito:', creditType);
        await updateCreditType(creditType);
        toast.success('Tipo de crédito actualizado con éxito');
      } else {
        console.log('Creando nuevo tipo de crédito:', creditType, 'con cédula:', cedula);
        await createCreditType(creditType, cedula);
        toast.success('Tipo de crédito creado con éxito');
      }
      
      // Limpiar el caché y recargar los datos
      clearCreditTypesCache(cedula);
      await loadCreditTypes();
      
      setIsEditing(false);
      setSelectedCreditType(null);
    } catch (error) {
      toast.error('Error al guardar el tipo de crédito');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            {selectedCreditType ? 'Editar Tipo de Crédito' : 'Crear Nuevo Tipo de Crédito'}
          </h1>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
        
        <CreditTypeForm 
          initialCreditType={selectedCreditType || undefined} 
          onSave={handleSave} 
        />
      </div>
    );
  }

  return (

    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tipos de Crédito</h1>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600"
        >
          Crear Nuevo
        </button>
      </div>
      
      {creditTypes.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {creditTypes.map((creditType) => (
                <tr key={creditType.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{creditType.displayName}</div>
                    <div className="text-sm text-gray-500">{creditType.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{creditType.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{creditType.fields.length} campos</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      creditType.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {creditType.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(creditType)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        console.log('Botón eliminar clickeado para:', creditType.displayName);
                        console.log('ID del tipo de crédito:', creditType.id);
                        handleDelete(creditType.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay tipos de crédito configurados.</p>
          <button
            onClick={handleCreateNew}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Crear el Primero
          </button>
        </div>
      )}
    </div>
  );
}; 

export default CreditTypeAdmin;