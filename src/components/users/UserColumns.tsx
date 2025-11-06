import { createColumnHelper } from '@tanstack/react-table';
import { Mail, User as UserIcon, Calendar, MapPin, Building, Users, Clock } from 'lucide-react';
import { User } from '../../types/user';
import { isValidDate, getDaysRemaining } from '../../utils/dateValidation';

const columnHelper = createColumnHelper<User>();

// Función helper para obtener info_extra de forma segura
const getInfoExtraValue = (user: User, field: string): string => {
  try {
    const infoExtra = typeof user.info_extra === 'string'
      ? JSON.parse(user.info_extra)
      : user.info_extra;
    const value = infoExtra?.[field];
    if (typeof value === 'boolean') {
      return String(value);
    }
    return value || '';
  } catch {
    return '';
  }
};

// Función para obtener el estado del usuario
// Lógica según backend:
// - Permanente: no tiene tiempo_conexion ni usuario_activo
// - Temporal activo: tiene tiempo_conexion y (usuario_activo es true o undefined)
// - Temporal inactivo: tiene tiempo_conexion y usuario_activo es false
// - Temporal expirado: tiene tiempo_conexion pero la fecha pasó
const getUserStatus = (user: User): { type: 'permanente' | 'temporal'; status: 'activo' | 'inactivo' | 'expirado' } => {
  try {
    const infoExtra = typeof user.info_extra === 'string'
      ? JSON.parse(user.info_extra)
      : user.info_extra;

    // Si no tiene tiempo_conexion, es usuario permanente
    if (!infoExtra?.tiempo_conexion) {
      return { type: 'permanente', status: 'activo' };
    }

    const tiempoConexion = infoExtra.tiempo_conexion;
    const usuarioActivo = infoExtra.usuario_activo; // Puede ser undefined, true o false

    // Validar fecha
    if (!isValidDate(tiempoConexion)) {
      return { type: 'temporal', status: 'inactivo' };
    }

    // Verificar si está expirado (fecha pasó)
    const daysRemaining = getDaysRemaining(tiempoConexion);
    if (daysRemaining === null || daysRemaining < 0) {
      return { type: 'temporal', status: 'expirado' };
    }

    // Si tiene usuario_activo: false, es inactivo
    if (usuarioActivo === false) {
      return { type: 'temporal', status: 'inactivo' };
    }

    // Si usuario_activo es true o undefined, es activo
    return { type: 'temporal', status: 'activo' };
  } catch {
    return { type: 'permanente', status: 'activo' };
  }
};

export const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => (
      <span className="text-sm text-gray-700 dark:text-gray-100">#{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('nombre', {
    header: 'Nombre',
    cell: (info) => (
      <div className="flex items-center">
        <UserIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
        <span className="font-medium text-gray-900 dark:text-gray-100">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('correo', {
    header: 'Correo',
    cell: (info) => (
      <div className="flex items-center">
        <Mail className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
        <span className="text-sm text-gray-900 dark:text-gray-100">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('cedula', {
    header: 'Cédula',
    cell: (info) => (
      <span className="text-sm text-gray-800 dark:text-gray-100">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('rol', {
    header: 'Rol',
    cell: (info) => {
      const roles = {
        admin: 'bg-purple-200 text-purple-900 dark:bg-purple-600 dark:text-white',
        banco: 'bg-green-200 text-green-900 dark:bg-green-600 dark:text-white',
        asesor: 'bg-blue-200 text-blue-900 dark:bg-blue-600 dark:text-white',
        supervisor: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-600 dark:text-white',
        default: 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white'
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
    id: 'estado',
    header: 'Estado',
    cell: (info) => {
      const user = info.row.original;
      const status = getUserStatus(user);
      const infoExtra = typeof user.info_extra === 'string'
        ? JSON.parse(user.info_extra)
        : user.info_extra;
      const tiempoConexion = infoExtra?.tiempo_conexion;
      const daysRemaining = tiempoConexion ? getDaysRemaining(tiempoConexion) : null;

      // Mensajes según especificación del backend
      let statusMessage = '';
      if (status.type === 'permanente') {
        statusMessage = 'Usuario permanente';
      } else if (status.status === 'activo') {
        statusMessage = `Activo hasta: ${tiempoConexion}`;
      } else if (status.status === 'inactivo') {
        statusMessage = 'Cuenta desactivada';
      } else if (status.status === 'expirado') {
        statusMessage = `Expirado desde: ${tiempoConexion}`;
      }

      return (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status.status === 'activo' ? 'bg-green-200 text-green-900 dark:bg-green-600 dark:text-white' :
              status.status === 'inactivo' ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' :
              status.type === 'permanente' ? 'bg-blue-200 text-blue-900 dark:bg-blue-600 dark:text-white' :
              'bg-red-200 text-red-900 dark:bg-red-600 dark:text-white'
            }`}>
              {status.type === 'permanente' ? 'Permanente' :
               status.status === 'activo' ? 'Activo' :
               status.status === 'inactivo' ? 'Inactivo' :
               'Expirado'}
            </span>
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
            {statusMessage}
          </p>
          {tiempoConexion && status.status === 'activo' && daysRemaining !== null && daysRemaining >= 0 && (
            <div className="flex items-center text-xs mt-1">
              <Clock className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" />
              <span className={daysRemaining <= 7 ? 'text-red-500 dark:text-red-400 font-medium' : daysRemaining <= 30 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300'}>
                {daysRemaining} día{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
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
        return <span className="text-sm text-gray-400 dark:text-gray-300">Sin información adicional</span>;
      }

      return (
        <div className="space-y-1">
          {ciudad && (
            <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
              <MapPin className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" />
              {ciudad}
            </div>
          )}
          {banco && (
            <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
              <Building className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" />
              {banco}
            </div>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('reports_to_nombre', {
    header: 'Supervisor',
    cell: (info) => {
      const reportsToNombre = info.getValue();
      return (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-800 dark:text-gray-100">
            {reportsToNombre || 'Sin supervisor'}
          </span>
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
          <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-800 dark:text-gray-100">
            {date ? new Date(date).toLocaleDateString('es-ES') : 'N/A'}
          </span>
        </div>
      );
    },
  }),
];