import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Download, UserCog } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerForm } from '../components/customers/CustomerForm';
import { CustomerDetails } from '../components/customers/CustomerDetails';
import { CustomerTable } from '../components/customers/CustomerTable';
import { Customer } from '../types/customer';
import { usePermissions } from '../utils/permissions';
import { Link } from 'react-router-dom';

const Customers = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    customers,
    isLoading,
    error,
    totalRecords,
    loadCustomers,
    updateCustomer,
    deleteCustomer,
    updateStatus,
    setCustomers
  } = useCustomers();
  const { canCreateCustomer } = usePermissions();

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

  // Definir los permisos para cada usuario.
  const canEdit = () => user && ['admin', 'manager'].includes(user.role);
  const canDelete = () => user && user.role === 'admin';
  const canDownloadSales = () => user && ['admin'].includes(user.role);

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
    if (!editedCustomer) return;
    try {
      const updatedCustomer = await updateCustomer(editedCustomer);
      setSelectedCustomer(updatedCustomer);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer || !canDelete()) return;
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
      const response = await fetch('http://127.0.0.1:5000/editar-estado/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: newStatus,
          solicitante_id: customer.id_solicitante,
          numero_documento: customer.numero_documento
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      // No necesitamos hacer nada más aquí, el estado visual ya se actualizó en la tabla
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  };

  const handleDownloadSales = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/descargar-ventas/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
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
          <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
          <div className="flex items-center space-x-4">
            {canEdit() && (
              <Link 
                to="/users"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <UserCog className="w-4 h-4 mr-2" />
                Gestionar Usuarios
              </Link>
            )}
            
            {user && (
              <span className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{user.name}</span>
                {user.role && (
                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {user.role}
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
        maxWidth="max-w-4xl"
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
          onDelete={handleDelete}
          onInputChange={handleInputChange}
        />
      </Modal>
      
      {/* Modal de Nuevo Cliente */}
      <Modal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        title="Nuevo Cliente"
        maxWidth="max-w-6xl"
      >
        <CustomerForm
          onSubmit={() => {
            loadCustomers();
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