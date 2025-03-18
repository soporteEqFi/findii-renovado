import React from 'react';
import { User } from '../../types/user';
import { Loader2 } from 'lucide-react';

interface UserDetailsProps {
  user: User;
  editedUser: User;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  canEdit: () => boolean;
  canDelete: () => boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onInputChange: (field: keyof User, value: string) => void;
}

export const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  editedUser,
  isEditing,
  isLoading,
  error,
  canEdit,
  canDelete,
  onEdit,
  onSave,
  onDelete,
  onInputChange,
}) => {
  if (!user) return <div>No user selected</div>;

  return (
    <div className="space-y-6">
      {/* Avatar/Imagen */}
      <div className="flex justify-center">
        <div className="relative">
          <img
            src={user.imagen_aliado || 'https://via.placeholder.com/150'}
            alt={user.nombre}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* User details form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          {isEditing ? (
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editedUser.nombre}
              onChange={(e) => onInputChange('nombre', e.target.value)}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{user.nombre}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          {isEditing ? (
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editedUser.email}
              onChange={(e) => onInputChange('email', e.target.value)}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cédula</label>
          {isEditing ? (
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editedUser.cedula}
              onChange={(e) => onInputChange('cedula', e.target.value)}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{user.cedula}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Empresa</label>
          {isEditing ? (
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editedUser.empresa}
              onChange={(e) => onInputChange('empresa', e.target.value)}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{user.empresa}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          {isEditing ? (
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editedUser.rol}
              onChange={(e) => onInputChange('rol', e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="rh">RH</option>
              <option value="banco">Banco</option>
            </select>
          ) : (
            <p className="mt-1 text-sm text-gray-900">{user.rol}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Imagen (URL)</label>
          {isEditing ? (
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editedUser.imagen_aliado || ''}
              onChange={(e) => onInputChange('imagen_aliado', e.target.value)}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{user.imagen_aliado || 'No disponible'}</p>
          )}
        </div>

        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editedUser.password}
              onChange={(e) => onInputChange('password', e.target.value)}
              placeholder="Dejar en blanco para mantener"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        {!isEditing && canEdit() && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Editar
          </button>
        )}

        {isEditing && (
          <>
            <button
              type="button"
              onClick={onSave}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </>
        )}

        {canDelete() && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}; 