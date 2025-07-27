import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { User } from '../../types/user';
import { columns } from './UserColumns';
import { Search } from 'lucide-react';

interface UserTableProps {
  users: User[];
  onRowClick: (user: User) => void;
  totalRecords: number;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onRowClick,
  totalRecords
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = useMemo(() => {
    return users.filter(user => {
      // Filtro global
      if (globalFilter) {
        const searchTerm = globalFilter.toLowerCase();
        return Object.values(user).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });
  }, [users, globalFilter]);

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
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    pageCount: Math.ceil(filteredData.length / pageSize),
    manualPagination: true,
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

      {/* Controles de paginación */}
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
            Página {pageIndex + 1} de {Math.max(1, Math.ceil(filteredData.length / pageSize))}
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