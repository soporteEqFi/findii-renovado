import React from 'react';
import { Pencil, Trash2, Settings } from 'lucide-react';
import { FieldDefinition } from '../../types/fieldDefinition';

interface Props {
  items: FieldDefinition[];
  loading: boolean;
  onEdit: (item: FieldDefinition) => void;
  onDelete: (item: FieldDefinition) => void;
  onConfigureCondition: (item: FieldDefinition) => void;
}

const FieldTable: React.FC<Props> = ({ items, loading, onEdit, onDelete, onConfigureCondition }) => {
  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entidad</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Columna JSON</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requerido</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condición</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-gray-500">Sin registros</td>
            </tr>
          )}
          {items.map((it) => (
            <tr key={`${it.entity}-${it.json_column}-${it.key}`}>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{it.entity}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{it.json_column}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">{it.key}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{it.type}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{it.required ? 'Sí' : 'No'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                {it.conditional_on ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Condicional
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Siempre
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-sm max-w-[280px] truncate" title={it.description}>{it.description}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                <button onClick={() => onEdit(it)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 mr-2">
                  <Pencil size={16} /> Editar
                </button>
                <button onClick={() => onConfigureCondition(it)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 mr-2">
                  <Settings size={16} /> Condición
                </button>
                <button onClick={() => onDelete(it)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">
                  <Trash2 size={16} /> Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FieldTable;
