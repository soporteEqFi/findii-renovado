import { createColumnHelper } from '@tanstack/react-table';
import { Mail, User as UserIcon, Calendar, MapPin, Building } from 'lucide-react';
import { User } from '../../types/user';

const columnHelper = createColumnHelper<User>();

// Función helper para obtener info_extra de forma segura
const getInfoExtraValue = (user: User, field: string): string => {
  try {
    const infoExtra = typeof user.info_extra === 'string'
      ? JSON.parse(user.info_extra)
      : user.info_extra;
    return infoExtra?.[field] || '';
  } catch {
    return '';
  }
};

export const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => (
      <span className="text-sm text-gray-500">#{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('nombre', {
    header: 'Nombre',
    cell: (info) => (
      <div className="flex items-center">
        <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
        <span className="font-medium">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('correo', {
    header: 'Correo',
    cell: (info) => (
      <div className="flex items-center">
        <Mail className="w-4 h-4 mr-2 text-gray-500" />
        <span className="text-sm">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('cedula', {
    header: 'Cédula',
    cell: (info) => (
      <span className="text-sm text-gray-600">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('rol', {
    header: 'Rol',
    cell: (info) => {
      const roles = {
        admin: 'bg-purple-100 text-purple-800',
        banco: 'bg-green-100 text-green-800',
        asesor: 'bg-blue-100 text-blue-800',
        supervisor: 'bg-yellow-100 text-yellow-800',
        default: 'bg-gray-100 text-gray-800'
      };

      const role = info.getValue();
      const colorClass = roles[role as keyof typeof roles] || roles.default;

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {role}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'info_extra',
    header: 'Información Adicional',
    cell: (info) => {
      const user = info.row.original;
      const ciudad = getInfoExtraValue(user, 'ciudad');
      const banco = getInfoExtraValue(user, 'banco_nombre');

      if (!ciudad && !banco) {
        return <span className="text-sm text-gray-400">Sin información adicional</span>;
      }

      return (
        <div className="space-y-1">
          {ciudad && (
            <div className="flex items-center text-xs text-gray-600">
              <MapPin className="w-3 h-3 mr-1" />
              {ciudad}
            </div>
          )}
          {banco && (
            <div className="flex items-center text-xs text-gray-600">
              <Building className="w-3 h-3 mr-1" />
              {banco}
            </div>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('created_at', {
    header: 'Fecha de Creación',
    cell: (info) => {
      const date = info.getValue();
      return (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-sm text-gray-600">
            {date ? new Date(date).toLocaleDateString('es-ES') : 'N/A'}
          </span>
        </div>
      );
    },
  }),
];