import { useState, useEffect } from 'react';
import { Loader2, Plus, Download } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerFormDinamico } from '../components/customers/CustomerFormDinamico';
import { CustomerTable } from '../components/customers/CustomerTable';
import { Customer } from '../types/customer';
import { usePermissions } from '../utils/permissions';
import { buildApiUrl, API_CONFIG } from '../config/constants';
import { useTableConfig } from '../contexts/TableConfigContext';
import { useEditModal } from '../contexts/EditModalContext';

const Customers = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { refreshTrigger } = useTableConfig();
  const { openModal, setOnSaved } = useEditModal();
  const {
    customers,
    isLoading: customersLoading,
    // error,
    loadCustomers,
    // deleteCustomer,
    updateStatus
  } = useCustomers();
  const {
    canCreateCustomer,
    canDownloadSales
  } = usePermissions();

  // Estados locales
  // Eliminados estados del modal legacy CustomerDetails
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const tableKey = 0;

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadCustomers();
    }
  }, [isAuthenticated, authLoading, loadCustomers]);

  // Usar el sistema de permisos centralizado
  // Permisos disponibles: canEditCustomer, canDeleteCustomer (no usados directamente aquí)

  // Manejadores de eventos
  const handleRowClick = (customer: Customer) => {
    const idNum = customer.id != null ? Number(customer.id) : null;
    if (Number.isFinite(idNum as number)) {
      // Configurar el callback para recargar la página después de guardar
      setOnSaved(() => () => {
        window.location.reload();
      });
      openModal(idNum as number, 'Editar Registro');
    }
  };

  // Eliminados handlers específicos del modal legacy

  const handleStatusChange = async (customer: Customer, newStatus: string) => {
    try {
      const success = await updateStatus(customer, newStatus);

      if (!success) {
        console.error('Error al actualizar estado');
      }
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

      const empresaId = localStorage.getItem('empresa_id') || '1';
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.DESCARGAR_VENTAS}?empresa_id=${empresaId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar ventas');
      }

      // Obtener el blob de la respuesta
      const blob = await response.blob();

      // Detectar el tipo de archivo basado en el Content-Type
      const contentType = response.headers.get('content-type') || '';
      let fileName = 'ventas_realizadas';
      let fileExtension = '.csv';

      if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        fileExtension = '.xlsx';
      } else if (contentType.includes('application/vnd.ms-excel')) {
        fileExtension = '.xls';
      } else if (contentType.includes('text/csv')) {
        fileExtension = '.csv';
      }

      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);

      // Crear elemento anchor temporal
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName + fileExtension;

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
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Verificando autenticación...</span>
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
        <div className="p-4 lg:p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-800">Creditos</h1>
            <div className="flex items-center space-x-4">
              {/* Additional header content can go here */}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            {/* Botón de descargar ventas*/}
            {canDownloadSales() && (
              <button
                onClick={handleDownloadSales}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="sm:inline">Descargar Ventas</span>
              </button>
            )}
            {canCreateCustomer() && (
              <button
                onClick={() => setIsNewCustomerModalOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="sm:inline">Nuevo Cliente</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabla de Clientes */}
        {customersLoading && customers.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
            <span className="text-gray-600">Cargando datos...</span>
          </div>
        ) : (
          <CustomerTable
            key={tableKey}
            customers={customers}
            onRowClick={handleRowClick}
            onStatusChange={handleStatusChange}
            empresaId={1}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>

      {/* Modal legacy CustomerDetails eliminado */}
      {/* Modal de Edición Dinámica ahora se maneja globalmente */}

      {/* Modal de Nuevo Cliente */}
      <Modal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        title="Nuevo Cliente"
        size="xl"
      >
        <CustomerFormDinamico
          onSubmit={async () => {
            // Recargar la página después de crear un nuevo cliente
            window.location.reload();
          }}
          onCancel={() => setIsNewCustomerModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default Customers;