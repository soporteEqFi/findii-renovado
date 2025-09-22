import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { Mail, Phone, ChevronDown } from 'lucide-react';
import { Customer } from '../../types/customer';
import { usePermissions } from '../../utils/permissions';
import { useState } from 'react';
import { getColumnValue } from '../../services/columnConfigService';

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

// Componente para el estado con dropdown
const StatusCell = ({ info, estados }: { info: any; estados: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { canChangeStatus } = usePermissions();
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
        <div className="absolute right-0 z-50 mt-1 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200">
          <div className="py-1">
            {estados.map((estado) => (
              <button
                key={estado}
                className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 cursor-pointer transition-colors ${
                  estado.toLowerCase() === currentState.toLowerCase() ? 'bg-gray-50 font-medium' : ''
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
};

/**
 * Genera columnas dinámicamente basado en la configuración
 */
export const createDynamicColumns = (columnNames: string[], estados: string[] = []): ColumnDef<Customer>[] => {
  return columnNames.map((columnName) => {
    // Configuración especial para cada tipo de columna
    switch (columnName) {
      case 'Fecha':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'fecha',
          header: ({ column }) => (
            <div
              className="cursor-pointer flex items-center space-x-1"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <span>Fecha</span>
              {column.getIsSorted() === 'asc' ? ' ↑' : column.getIsSorted() === 'desc' ? ' ↓' : ''}
            </div>
          ),
          cell: (info) => formatDate(String(info.getValue() || '')),
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
        });

      case 'Nombre':
      case 'Nombres':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'nombre',
          header: columnName,
          cell: (info) => <span className="font-medium">{String(info.getValue() || '')}</span>,
          enableColumnFilter: true,
        });

      case 'Numero Documento':
      case 'Número Documento':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'numero_documento',
          header: columnName,
          cell: (info) => String(info.getValue() || ''),
          enableColumnFilter: true,
        });

      case 'Ciudad Residencia':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'ciudad_residencia',
          header: columnName,
          cell: (info) => String(info.getValue() || ''),
          enableColumnFilter: true,
        });

      case 'Correo':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'correo',
          header: columnName,
          cell: (info) => (
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              {String(info.getValue() || '')}
            </div>
          ),
        });

      case 'Celular':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'celular',
          header: columnName,
          cell: (info) => (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-500" />
              {String(info.getValue() || '')}
            </div>
          ),
        });

      case 'Tipo Credito':
      case 'Tipo credito':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'tipo_credito',
          header: columnName,
          cell: (info) => String(info.getValue() || ''),
          enableColumnFilter: true,
        });

      case 'Tipo Actividad Economica':
      case 'Tipo actividad economica':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'tipo_actividad_economica',
          header: columnName,
          cell: (info) => String(info.getValue() || ''),
          enableColumnFilter: true,
        });

      case 'Banco':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'banco',
          header: columnName,
          cell: (info) => String(info.getValue() || ''),
          enableColumnFilter: true,
        });

      case 'Ciudad Solicitud':
      case 'Ciudad solicitud':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'ciudad_solicitud',
          header: columnName,
          cell: (info) => String(info.getValue() || ''),
          enableColumnFilter: true,
        });

      case 'Estado':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'estado',
          header: columnName,
          cell: (info) => <StatusCell info={info} estados={estados} />,
        });

      case 'Teléfono':
      case 'Telefono':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'telefono',
          header: columnName,
          cell: (info) => (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-500" />
              {String(info.getValue() || '')}
            </div>
          ),
        });

      case 'Creado por':
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: 'created_by_user_name',
          header: columnName,
          cell: (info) => <span className="font-medium text-gray-700">{String(info.getValue() || '')}</span>,
          enableColumnFilter: true,
        });

      default:
        // Columna genérica para cualquier otro campo
        return columnHelper.accessor((row) => getColumnValue(row, columnName), {
          id: columnName.toLowerCase().replace(/\s+/g, '_'),
          header: columnName,
          cell: (info) => {
            const value = info.getValue();
            return value ? String(value) : '';
          },
          enableColumnFilter: true,
        });
    }
  });
};
