import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Customer } from '../../types/customer';
import { columns } from './CustomerColumns';
import { Search, Calendar } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  onRowClick: (customer: Customer) => void;
  onStatusChange: (customer: Customer, newStatus: string) => Promise<void>;
  totalRecords: number;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onRowClick,
  onStatusChange,
  totalRecords
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>({});
  const [modifiedStatuses, setModifiedStatuses] = useState<Record<number, string>>({});

  const parseFecha = (fechaStr: string) => {
    if (!fechaStr) return 0;
    const [dia, mes, anio] = fechaStr.split('/').map(Number);
    return new Date(anio, mes - 1, dia).getTime();
  };

  const filteredData = useMemo(() => {
    return customers.filter(customer => {
      // Filtro por fecha
      if (dateRange.start && dateRange.end) {
        const customerDate = parseFecha(customer.created_at);
        const startDate = new Date(dateRange.start).getTime();
        const endDate = new Date(dateRange.end).getTime();
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

  const dataWithModifiedStatus = useMemo(() => {
    return filteredData.map(customer => ({
      ...customer,
      estado: modifiedStatuses[customer.id_solicitante] || customer.estado
    }));
  }, [filteredData, modifiedStatuses]);

  const sortedData = useMemo(() => {
    return [...dataWithModifiedStatus].sort((a, b) => {
      const fechaA = parseFecha(a.created_at || '');
      const fechaB = parseFecha(b.created_at || '');
      return fechaB - fechaA; // Orden descendente (más recientes primero)
    });
  }, [dataWithModifiedStatus]);

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pageIndex, pageSize]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
      globalFilter,
      sorting: [{ id: 'created_at', desc: true }],
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
        try {
          setModifiedStatuses(prev => ({
            ...prev,
            [customer.id_solicitante]: newStatus
          }));
          
          await onStatusChange(customer, newStatus);
        } catch (error) {
          setModifiedStatuses(prev => {
            const updated = { ...prev };
            delete updated[customer.id_solicitante];
            return updated;
          });
          console.error('Error en tabla al actualizar estado:', error);
          throw error;
        }
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