import { createColumnHelper } from '@tanstack/react-table';
import { Mail, Phone, ChevronDown } from 'lucide-react';
import { Customer } from '../../types/customer';
import { usePermissions } from '../../utils/permissions';

// Definimos el tipo para meta
declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    updateStatus: (customer: Customer, newStatus: string) => void;
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
    cell: (info) => formatDate(info.getValue() || ''),
    sortingFn: 'datetime',
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
      const { canChangeStatus } = usePermissions();
      const estados = ['Pendiente', 'Aprobado', 'Rechazado', 'Radicado'];
      const colorClasses = {
        pendiente: 'bg-yellow-100 text-yellow-800',
        aprobado: 'bg-green-100 text-green-800',
        rechazado: 'bg-red-100 text-red-800',
        radicado: 'bg-blue-100 text-blue-800'
      };

      const currentState = info.getValue()?.toLowerCase() || '';
      const customer = info.row.original;

      return (
        <div className="relative group">
          <button
            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
              colorClasses[currentState as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (canChangeStatus()) {
                const dropdown = e.currentTarget.nextElementSibling;
                if (dropdown) {
                  dropdown.classList.toggle('hidden');
                }
              }
            }}
          >
            {info.getValue()}
            {canChangeStatus() && <ChevronDown className="w-4 h-4 ml-1" />}
          </button>
          {canChangeStatus() && (
            <div className="hidden absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {estados.map((estado) => (
                  <button
                    key={estado}
                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                      estado.toLowerCase() === currentState ? 'bg-gray-50' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const updateData = {
                        estado: estado,
                        solicitante_id: customer.id_solicitante,
                        numero_documento: customer.numero_documento
                      };
                      info.table.options.meta?.updateStatus(customer, estado);
                      e.currentTarget.parentElement?.parentElement?.classList.add('hidden');
                    }}
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