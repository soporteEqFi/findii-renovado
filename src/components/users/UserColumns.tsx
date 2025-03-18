import { createColumnHelper } from '@tanstack/react-table';
import { Mail, User as UserIcon } from 'lucide-react';
import { User } from '../../types/user';

const columnHelper = createColumnHelper<User>();

export const columns = [
  columnHelper.accessor('nombre', {
    header: 'Nombre',
    cell: (info) => (
      <div className="flex items-center">
        <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
        <span className="font-medium">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('rol', {
    header: 'Rol',
    cell: (info) => {
      const roles = {
        admin: 'bg-purple-100 text-purple-800',
        rh: 'bg-blue-100 text-blue-800',
        banco: 'bg-green-100 text-green-800',
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
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => (
      <div className="flex items-center">
        <Mail className="w-4 h-4 mr-2 text-gray-500" />
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('cedula', {
    header: 'Cédula',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('empresa', {
    header: 'Empresa',
    cell: (info) => info.getValue(),
  }),
]; 