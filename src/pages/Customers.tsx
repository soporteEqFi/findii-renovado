import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Download, UserCog } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerFormDinamico as CustomerForm } from '../components/customers/CustomerFormDinamico';
import { CustomerDetails } from '../components/customers/CustomerDetails';
import { CustomerTable } from '../components/customers/CustomerTable';
import { Customer } from '../types/customer';
import { usePermissions } from '../utils/permissions';
import { buildApiUrl, API_CONFIG } from '../config/constants';
import { Link } from 'react-router-dom';

const Customers = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    customers,
    isLoading,
    error,
    totalRecords,
    loadCustomers,
    deleteCustomer,
    updateStatus
  } = useCustomers();
  const {
    canCreateCustomer,
    canEditCustomer,
    canDeleteCustomer,
    canDownloadSales
  } = usePermissions();

  // Estados locales
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadCustomers();
    }
  }, [isAuthenticated]);

  // Usar el sistema de permisos centralizado
  const canEdit = canEditCustomer;
  const canDelete = canDeleteCustomer;

  // Manejadores de eventos
  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditedCustomer(customer);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (canEdit()) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    // CustomerDetails realiza la actualización directamente.
    // Aquí solo recargamos los datos y salimos del modo edición.
    try {
      await loadCustomers();
      setIsEditing(false);
    } catch (error) {
      console.error('Error post-save:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer || !canDelete() || !selectedCustomer.id) return;
    try {
      await deleteCustomer(selectedCustomer.id);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleInputChange = (field: keyof Customer, value: string) => {
    if (!editedCustomer) return;
    setEditedCustomer({ ...editedCustomer, [field]: value });
  };

  const handleStatusChange = async (customer: Customer, newStatus: string) => {
    try {
      // Obtener la cédula del asesor
      const cedula = localStorage.getItem('cedula') || '';

      if (!cedula) {
        throw new Error('No se encontró la información del asesor');
      }

      console.log('Enviando cambio de estado al backend:', {
        estado: newStatus,
        solicitante_id: customer.id_solicitante,
        numero_documento: customer.numero_documento,
        cedula: cedula
      });

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EDIT_STATUS), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          estado: newStatus,
          solicitante_id: customer.id_solicitante,
          numero_documento: customer.numero_documento,
          cedula: cedula
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error del servidor:', errorData);
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }

      console.log('Estado actualizado exitosamente');

      // Recargar los datos para reflejar el cambio
      await loadCustomers();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  };

  const handleDownloadSales = async () => {
    try {
      // Obtener la cédula del asesor
      const cedula = localStorage.getItem('cedula') || '';

      if (!cedula) {
        throw new Error('No se encontró la información del asesor');
      }

      const response = await fetch(buildApiUrl('/descargar-ventas/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          cedula: cedula
        })
      });

      if (!response.ok) {
        throw new Error('Error al descargar ventas');
      }

      // Obtener el blob de la respuesta
      const blob = await response.blob();

      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);

      // Crear elemento anchor temporal
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ventas_realizadas.csv'; // Nombre del archivo a descargar

      // Añadir al DOM, hacer clic y remover
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Liberar el objeto URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar ventas:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  // Renderizado condicional para estados de carga y autenticación
  if (authLoading || (isLoading && !isModalOpen)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Veriificar si el usuario ha iniciado sesión.
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
        <p className="text-gray-600">Please log in to view customer information.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Creditos</h1>
          <div className="flex items-center space-x-4">
            {/* {canEdit() && (
              <Link
                to="/users"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <UserCog className="w-4 h-4 mr-2" />
                Gestionar Usuarios
              </Link>
            )} */}

            {user && (
              <span className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{user.nombre}</span>
                {user.rol && (
                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {user.rol}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Botón Nuevo Cliente */}
        <div className="flex justify-end p-4 bg-gray-50 border-b gap-4">
            {/* Botón de descargar ventas*/}
            {canDownloadSales() && (
              <button
                onClick={handleDownloadSales}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Ventas
            </button>
            )}
          {canCreateCustomer() && (
            <button
              onClick={() => setIsNewCustomerModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </button>
          )}
        </div>

        {/* Tabla de Clientes */}
        <CustomerTable
          key={tableKey}
          customers={customers}
          onRowClick={handleRowClick}
          onStatusChange={handleStatusChange}
          totalRecords={totalRecords}
        />
      </div>

      {/* Modal de Detalles */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
        }}
        title="Customer Details"
        size="xl"
      >
        <CustomerDetails
          customer={selectedCustomer!}
          editedCustomer={editedCustomer!}
          isEditing={isEditing}
          isLoading={isLoading}
          error={error}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={handleEdit}
          onSave={handleSave}
          // onDelete={handleDelete}
          onCustomerDelete={(solicitanteId) => {
            // La eliminación ya fue manejada en CustomerDetails
            loadCustomers(); // Recargar la lista de clientes
            setIsModalOpen(false); // Cerrar el modal
          }}
          onInputChange={handleInputChange}
        />
      </Modal>

      {/* Modal de Nuevo Cliente */}
      <Modal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        title="Nuevo Cliente"
        size="xl"
      >
        <CustomerForm
          onSubmit={async () => {
            await loadCustomers();
            setIsNewCustomerModalOpen(false);
          }}
          onCancel={() => setIsNewCustomerModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>
    </>
  );
};

export default Customers;