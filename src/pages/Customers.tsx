import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerForm } from '../components/customers/CustomerForm';
import { CustomerDetails } from '../components/customers/CustomerDetails';
import { CustomerTable } from '../components/customers/CustomerTable';
import { Customer } from '../types/customer';

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

  // Funciones de permisos
  const canEdit = () => user && ['admin', 'manager'].includes(user.role);
  const canDelete = () => user && user.role === 'admin';

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
      const updateData = {
        estado: newStatus,
        solicitante_id: customer.id_solicitante,
        numero_documento: customer.numero_documento
      };

      const response = await fetch('http://127.0.0.1:5000/editar-estado/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el estado');
      }

      // Actualiza el estado global de customers
      setCustomers(prevCustomers => 
        prevCustomers.map(c => 
          c.id_solicitante === customer.id_solicitante 
            ? { ...c, estado: newStatus }
            : c
        )
      );

      // Fuerza un re-render de la tabla
      setTableKey(prev => prev + 1);

    } catch (error) {
      console.error('Error al actualizar el estado:', error);
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
          <div className="flex items-center">
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
        <div className="p-4 bg-gray-50 border-b">
          {canEdit() && (
            <button
              onClick={() => setIsNewCustomerModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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