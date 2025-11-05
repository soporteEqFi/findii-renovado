import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnFiltersState,
  ColumnDef,
} from '@tanstack/react-table';
import { Customer } from '../../types/customer';
import { createDynamicColumns } from './DynamicCustomerColumns';
import { fetchColumnConfig, getDefaultColumns, detectAvailableColumns } from '../../services/columnConfigService';
import { useEstados } from '../../hooks/useEstados';
import { Search } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  onRowClick: (customer: Customer) => void;
  onStatusChange: (customer: Customer, newStatus: string) => void;
  empresaId?: number;
  refreshTrigger?: number;
}

// Función para convertir fecha dd/mm/yyyy a Date
const parseDateFromDDMMYYYY = (dateString: string): Date | null => {
  if (!dateString) return null;

  // Verificar si la fecha está en formato dd/mm/yyyy
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);

  if (match) {
    const [, day, month, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Si no coincide con el formato esperado, intentar parsear como fecha ISO
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Función para normalizar una fecha a solo año, mes y día (sin hora)
const normalizeDate = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onRowClick,
  onStatusChange,
  empresaId = 1,
  refreshTrigger
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [columns, setColumns] = useState<ColumnDef<Customer>[]>([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(true);

  // Hook para obtener estados dinámicos
  const { estados, loading: loadingEstados } = useEstados(empresaId);

  // Cargar configuración de columnas al montar el componente
  useEffect(() => {
    const loadColumnConfig = async () => {
      try {
        setIsLoadingColumns(true);

        // Primero intentar obtener columnas desde la API de configuración
        let columnNames;
        try {
          columnNames = await fetchColumnConfig(empresaId, customers);
        } catch (configError) {
          console.warn('Error obteniendo configuración de columnas, detectando automáticamente:', configError);
          // Si falla la configuración y tenemos datos, detectar automáticamente
          if (customers && customers.length > 0) {
            columnNames = detectAvailableColumns(customers);
          } else {
            // Si no hay datos aún, usar columnas por defecto
            columnNames = getDefaultColumns();
          }
        }

        const dynamicColumns = createDynamicColumns(columnNames, estados);
        setColumns(dynamicColumns);
      } catch (error) {
        console.error('Error cargando columnas:', error);
        // Usar columnas por defecto en caso de error
        const defaultColumnNames = getDefaultColumns();
        const dynamicColumns = createDynamicColumns(defaultColumnNames, estados);
        setColumns(dynamicColumns);
      } finally {
        setIsLoadingColumns(false);
      }
    };

    // Solo cargar columnas si los estados ya están disponibles
    if (!loadingEstados) {
      loadColumnConfig();
    }
  }, [empresaId, customers, refreshTrigger, estados, loadingEstados]);

  const filteredData = useMemo(() => {
    return customers.filter(customer => {
      // Filtro por fecha
      if (dateRange.start && dateRange.end) {
        const customerDateObj = parseDateFromDDMMYYYY(customer.created_at || '');
        const startDateObj = new Date(dateRange.start);
        const endDateObj = new Date(dateRange.end);

        if (!customerDateObj) return false;

        const customerDate = normalizeDate(customerDateObj);
        const startDate = normalizeDate(startDateObj);
        const endDate = normalizeDate(endDateObj);

        if (customerDate < startDate || customerDate > endDate) {
          return false;
        }
      }

      // Filtro global
      if (globalFilter) {
        const searchTerm = globalFilter.toLowerCase();
        return Object.values(customer).some(value =>
          String(value).toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  }, [customers, dateRange, globalFilter]);

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pageIndex, pageSize]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      globalFilter,
      sorting: [],
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    pageCount: Math.ceil(filteredData.length / pageSize),
    manualPagination: true,
    meta: {
      updateStatus: async (customer: Customer, newStatus: string) => {
        onStatusChange(customer, newStatus);
      },
    },
  });

  const handlePreviousPage = () => {
    setPageIndex(old => Math.max(0, old - 1));
  };

  const handleNextPage = () => {
    setPageIndex(old => Math.min(Math.ceil(filteredData.length / pageSize) - 1, old + 1));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0);
  };

  // Mostrar loading mientras se cargan las columnas o los estados
  if (isLoadingColumns || loadingEstados) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">
          {loadingEstados ? 'Cargando estados disponibles...' : 'Cargando configuración de columnas...'}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda global */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Filtro de fecha */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <span className="hidden sm:inline dark:text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="relative">
        {/* Gradient indicators for horizontal scroll */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent z-10 pointer-events-none md:hidden"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent z-10 pointer-events-none md:hidden"></div>
        
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-100 uppercase tracking-wider whitespace-nowrap lg:px-6"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-100 lg:px-6"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controles de paginación simplificados */}
      <div className="px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-200 dark:border-gray-700 gap-4 bg-white dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {[10, 20, 30, 50].map(size => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>

          <span className="text-sm text-gray-700 dark:text-gray-300">
            Página {pageIndex + 1} de {Math.ceil(filteredData.length / pageSize)}
          </span>
        </div>

        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {'<<'}
          </button>
          <button
            onClick={handlePreviousPage}
            disabled={pageIndex === 0}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {'<'}
          </button>
          <button
            onClick={handleNextPage}
            disabled={pageIndex >= Math.ceil(filteredData.length / pageSize) - 1}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {'>'}
          </button>
          <button
            onClick={() => setPageIndex(Math.ceil(filteredData.length / pageSize) - 1)}
            disabled={pageIndex >= Math.ceil(filteredData.length / pageSize) - 1}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
};