import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnFiltersState,
  ColumnDef,
} from '@tanstack/react-table';
import { Customer } from '../../types/customer';
import { createDynamicColumns } from './DynamicCustomerColumns';
import { fetchColumnConfig, getDefaultColumns, detectAvailableColumns } from '../../services/columnConfigService';
import { Search, Calendar } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  onRowClick: (customer: Customer) => void;
  onStatusChange: (customer: Customer, newStatus: string) => void;
  totalRecords: number;
  empresaId?: number;
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
  totalRecords,
  empresaId = 1
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

  // Cargar configuración de columnas al montar el componente
  useEffect(() => {
    const loadColumnConfig = async () => {
      try {
        setIsLoadingColumns(true);
        
        // Solo proceder si tenemos datos de clientes
        if (!customers || customers.length === 0) {
          console.log('No hay datos de clientes, usando columnas por defecto');
          const defaultColumnNames = getDefaultColumns();
          const dynamicColumns = createDynamicColumns(defaultColumnNames);
          setColumns(dynamicColumns);
          return;
        }

        console.log('🔄 Cargando configuración de columnas para', customers.length, 'clientes');
        
        // Primero intentar obtener columnas desde la API de configuración
        let columnNames;
        try {
          columnNames = await fetchColumnConfig(empresaId, customers);
          console.log('✅ Columnas obtenidas desde API de configuración:', columnNames);
        } catch (configError) {
          console.warn('Error obteniendo configuración de columnas, detectando automáticamente:', configError);
          // Si falla la configuración, detectar automáticamente desde los datos procesados
          columnNames = detectAvailableColumns(customers);
          console.log('✅ Columnas detectadas automáticamente desde datos procesados:', columnNames);
        }
        
        const dynamicColumns = createDynamicColumns(columnNames);
        setColumns(dynamicColumns);
        console.log('🎯 Columnas dinámicas creadas:', dynamicColumns.length);
      } catch (error) {
        console.error('Error cargando columnas:', error);
        // Usar columnas por defecto en caso de error
        const defaultColumnNames = getDefaultColumns();
        const dynamicColumns = createDynamicColumns(defaultColumnNames);
        setColumns(dynamicColumns);
      } finally {
        setIsLoadingColumns(false);
      }
    };

    loadColumnConfig();
  }, [empresaId, customers]);

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
      updateStatus: onStatusChange,
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

  // Mostrar loading mientras se cargan las columnas
  if (isLoadingColumns) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando configuración de columnas...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="p-4 bg-white border-b">
        <div className="flex flex-wrap gap-4">
          {/* Búsqueda global */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-2 border rounded"
              />
            </div>
          </div>

          {/* Filtro de fecha */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border rounded px-2 py-1"
            />
            <span>-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row.original)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación simplificados */}
      <div className="px-6 py-4 flex items-center justify-between border-t">
        <div className="flex items-center gap-4">
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[10, 20, 30, 50].map(size => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>

          <span className="text-sm text-gray-700">
            Página {pageIndex + 1} de {Math.ceil(filteredData.length / pageSize)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {'<<'}
          </button>
          <button
            onClick={handlePreviousPage}
            disabled={pageIndex === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {'<'}
          </button>
          <button
            onClick={handleNextPage}
            disabled={pageIndex >= Math.ceil(filteredData.length / pageSize) - 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {'>'}
          </button>
          <button
            onClick={() => setPageIndex(Math.ceil(filteredData.length / pageSize) - 1)}
            disabled={pageIndex >= Math.ceil(filteredData.length / pageSize) - 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
};