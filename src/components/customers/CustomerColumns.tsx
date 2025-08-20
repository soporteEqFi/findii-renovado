import { createColumnHelper } from '@tanstack/react-table';
import { Mail, Phone, ChevronDown } from 'lucide-react';
import { Customer } from '../../types/customer';
import { usePermissions } from '../../utils/permissions';
import { CREDIT_STATUSES } from '../../config/constants';
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
  if (!dateString) return '';
  // Si ya está en formato dd/mm/yyyy, devolverlo tal como está
  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  if (ddmmyyyyRegex.test(dateString)) return dateString;
  // Si es una fecha ISO o en otro formato, convertirla
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Si no es una fecha válida, devolver el string original
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
    sortingFn: (rowA, rowB, columnId) => {
      // Función para parsear fechas en formato dd/mm/yyyy o ISO
      const parseFecha = (fechaStr: string) => {
        if (!fechaStr) return 0;
        // Si ya está en formato dd/mm/yyyy
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = fechaStr.match(dateRegex);
        if (match) {
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
        }
        // Si es una fecha ISO
        const date = new Date(fechaStr);
        return isNaN(date.getTime()) ? 0 : date.getTime();
      };
      const fechaA = parseFecha(rowA.getValue(columnId));
      const fechaB = parseFecha(rowB.getValue(columnId));
      return fechaA < fechaB ? -1 : fechaA > fechaB ? 1 : 0;
    },
    enableSorting: true,
  }),

  columnHelper.accessor('nombre_completo', {
    header: 'Nombre',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('numero_documento', {
    header: 'Número Documento',
    cell: (info) => info.getValue(),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('correo_electronico', {
    header: 'Correo',
    cell: (info) => (
      <div className="flex items-center">
        <Mail className="w-4 h-4 mr-2 text-gray-500" />
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('estado', {
    header: 'Estado',
    cell: (info) => {
      const [isOpen, setIsOpen] = useState(false);
      const { canChangeStatus } = usePermissions();
      const estados = CREDIT_STATUSES;
      const colorClasses = {
        'Pendiente': 'bg-yellow-100 text-yellow-800',
        'En estudio': 'bg-blue-100 text-blue-800',
        'Pendiente información adicional': 'bg-orange-100 text-orange-800',
        'Aprobado': 'bg-green-100 text-green-800',
        'Desembolsado': 'bg-purple-100 text-purple-800',
        'Pagado': 'bg-emerald-100 text-emerald-800',
        'Negado': 'bg-red-100 text-red-800',
        'Desistido': 'bg-gray-100 text-gray-800'
      };

      const currentState = info.getValue() || 'Pendiente';
      const customer = info.row.original;



      // Función para mapear el estado visual al estado que se envía al backend
      const mapEstadoToBackend = (estadoVisual: string): string => {
        switch (estadoVisual.toLowerCase()) {
          case 'negado':
            return 'Negado';
          case 'rechazado':
            return 'Negado';
          case 'en estudio':
            return 'En estudio';
          case 'pendiente información adicional':
            return 'Pendiente información adicional';
          case 'aprobado':
            return 'Aprobado';
          case 'desembolsado':
            return 'Desembolsado';
          case 'pagado':
            return 'Pagado';
          case 'desistido':
            return 'Desistido';
          default:
            return estadoVisual;
        }
      };

      const handleStatusChange = async (newStatus: string) => {
        try {
          // Mapear el estado visual al estado que se envía al backend
          const estadoBackend = mapEstadoToBackend(newStatus);
          await info.table.options.meta?.updateStatus(customer, estadoBackend);
          setIsOpen(false);
        } catch (error) {
          console.error('Error en columna al cambiar estado:', error);
        }
      };

      // Solo mostrar el dropdown si el usuario tiene permisos para cambiar estado
      if (!canChangeStatus()) {
        return (
          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
            colorClasses[currentState as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'
          }`}>
            {info.getValue() || 'Pendiente'}
          </span>
        );
      }

      return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer ${
              colorClasses[currentState as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
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
                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 cursor-pointer ${
                      estado.toLowerCase() === currentState.toLowerCase() ? 'bg-gray-50' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(estado);
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