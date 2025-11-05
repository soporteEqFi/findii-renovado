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
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          {/* Búsqueda global */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider"
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
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-100"
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
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {[10, 20, 30, 50].map(size => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>

          <span className="text-sm text-gray-700 dark:text-gray-300">
            Página {pageIndex + 1} de {Math.max(1, Math.ceil(filteredData.length / pageSize))}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {'<<'}
          </button>
          <button
            onClick={handlePreviousPage}
            disabled={pageIndex === 0}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {'<'}
          </button>
          <button
            onClick={handleNextPage}
            disabled={pageIndex >= Math.ceil(filteredData.length / pageSize) - 1}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {'>'}
          </button>
          <button
            onClick={() => setPageIndex(Math.ceil(filteredData.length / pageSize) - 1)}
            disabled={pageIndex >= Math.ceil(filteredData.length / pageSize) - 1}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
}; 