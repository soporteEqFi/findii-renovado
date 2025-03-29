import React, { useEffect, useState } from 'react';
import { CreditType } from '../types/creditTypes';
import { CreditTypeForm } from '../components/admin/CreditTypeForm';
import { getCreditTypes, createCreditType, updateCreditType, deleteCreditType } from '../services/creditTypeService';
import toast from 'react-hot-toast';

export const CreditTypeAdmin: React.FC = () => {
  const [creditTypes, setCreditTypes] = useState<CreditType[]>([]);
  const [selectedCreditType, setSelectedCreditType] = useState<CreditType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCreditTypes();
  }, []);

  const loadCreditTypes = async () => {
    setIsLoading(true);
    try {
      const data = await getCreditTypes();
      setCreditTypes(data);
      console.log(data);
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
    if (window.confirm('¿Está seguro de que desea eliminar este tipo de crédito?')) {
      try {
        await deleteCreditType(id);
        await loadCreditTypes();
        toast.success('Tipo de crédito eliminado con éxito');
      } catch (error) {
        toast.error('Error al eliminar el tipo de crédito');
        console.error(error);
      }
    }
  };

  const handleSave = async (creditType: CreditType) => {
    try {
      if (selectedCreditType) {
        await updateCreditType(creditType);
        toast.success('Tipo de crédito actualizado con éxito');
      } else {
        await createCreditType(creditType);
        toast.success('Tipo de crédito creado con éxito');
      }
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
                      creditType.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {creditType.is_active ? 'Activo' : 'Inactivo'}
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
                      onClick={() => handleDelete(creditType.id)}
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