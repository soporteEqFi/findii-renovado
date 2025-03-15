import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Customer } from '../../types/customer';
import { columns } from './CustomerColumns';

interface CustomerTableProps {
  customers: Customer[];
  onRowClick: (customer: Customer) => void;
  onStatusChange: (customer: Customer, newStatus: string) => void;
  totalRecords: number;
  key?: string; // Añadimos esta prop para forzar el re-render
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onRowClick,
  onStatusChange,
  totalRecords,
  key
}) => {
  console.log('CustomerTable customers:', customers); // Para debugging
  const [pageSize, setPageSize] = useState(10);
  const [tableData, setTableData] = useState(customers);

  // Actualizamos tableData cuando customers cambia
  useEffect(() => {
    setTableData(customers);
  }, [customers]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    meta: {
      updateStatus: async (customer: Customer, newStatus: string) => {
        await onStatusChange(customer, newStatus);
        // Actualizamos el estado local de la tabla
        setTableData(prev => 
          prev.map(c => 
            c.id_solicitante === customer.id_solicitante 
              ? { ...c, estado: newStatus }
              : c
          )
        );
      },
    },
  });

  if (!customers.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay clientes para mostrar
      </div>
    );
  }

  return (
    <div>
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
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-2">
            Filas por página:
          </span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              table.setPageSize(Number(e.target.value));
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            {[10, 20, 30, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Página{' '}
            <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> de{' '}
            <span className="font-medium">{table.getPageCount()}</span>
          </span>
          <div className="flex space-x-1">
            <button
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {'<<'}
            </button>
            <button
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </button>
            <button
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </button>
            <button
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {'>>'}
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-700">
          Mostrando {table.getRowModel().rows.length} de {totalRecords} registros
        </div>
      </div>
    </div>
  );
};