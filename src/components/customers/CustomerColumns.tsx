import { createColumnHelper } from '@tanstack/react-table';
import { Mail, Phone, ChevronDown } from 'lucide-react';
import { Customer } from '../../types/customer';
import { usePermissions } from '../../utils/permissions';
import { useState } from 'react';

// Definimos el tipo para meta
declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    updateStatus: (customer: Customer, newStatus: string) => Promise<void>;
  }
}

const columnHelper = createColumnHelper<Customer>();

// Función auxiliar para formatear la fecha
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

export const columns = [
  columnHelper.accessor('created_at', {
    header: ({ column }) => {
      return (
        <div
          className="cursor-pointer flex items-center space-x-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Fecha</span>
          {column.getIsSorted() === 'asc' ? ' ↑' : column.getIsSorted() === 'desc' ? ' ↓' : ''}
        </div>
      );
    },
    cell: (info) => info.getValue() || '',
    sortingFn: (rowA, rowB, columnId) => {
      // Función para parsear fechas en formato dd/mm/yyyy
      const parseFecha = (fechaStr: string) => {
        if (!fechaStr) return 0;
        const [dia, mes, anio] = fechaStr.split('/').map(Number);
        return new Date(anio, mes - 1, dia).getTime();
      };
      
      const fechaA = parseFecha(rowA.getValue(columnId));
      const fechaB = parseFecha(rowB.getValue(columnId));
      return fechaA < fechaB ? -1 : fechaA > fechaB ? 1 : 0;
    },
    enableSorting: true,
  }),
  
  columnHelper.accessor('nombre', {
    header: 'Nombre',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('numero_documento', {
    header: 'Número Documento',
    cell: (info) => info.getValue(),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('correo', {
    header: 'Correo',
    cell: (info) => (
      <div className="flex items-center">
        <Mail className="w-4 h-4 mr-2 text-gray-500" />
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('numero_celular', {
    header: 'Número Celular',
    cell: (info) => (
      <div className="flex items-center">
        <Phone className="w-4 h-4 mr-2 text-gray-500" />
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('ciudad_gestion', {
    header: 'Ciudad Gestión',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('producto_solicitado', {
    header: 'Producto Solicitado',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('banco', {
    header: 'Banco',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('estado', {
    header: 'Estado',
    cell: (info) => {
      const [isOpen, setIsOpen] = useState(false);
      const estados = ['Pendiente', 'Aprobado', 'Rechazado', 'Radicado'];
      const colorClasses = {
        Pendiente: 'bg-yellow-100 text-yellow-800',
        Aprobado: 'bg-green-100 text-green-800',
        Rechazado: 'bg-red-100 text-red-800',
        Radicado: 'bg-blue-100 text-blue-800'
      };

      const currentState = info.getValue() || 'Pendiente';
      const customer = info.row.original;

      const handleStatusChange = async (newStatus: string) => {
        try {
          console.log('Iniciando cambio de estado:', { 
            id_solicitante: customer.id_solicitante,
            numero_documento: customer.numero_documento,
            newStatus 
          });
          await info.table.options.meta?.updateStatus(customer, newStatus);
          setIsOpen(false);
        } catch (error) {
          console.error('Error en columna al cambiar estado:', error);
        }
      };

      return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
              colorClasses[currentState as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {info.getValue() || 'Pendiente'}
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} />
          </button>
          {isOpen && (
            <div className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {estados.map((estado) => (
                  <button
                    key={estado}
                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                      estado.toLowerCase() === currentState ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => handleStatusChange(estado)}
                  >
                    {estado}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    },
  }),
];