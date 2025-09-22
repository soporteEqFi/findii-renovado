import React, { useState, useEffect } from 'react';
import { User } from '../../types/user';
import { Loader2, MapPin, Building, CreditCard } from 'lucide-react';
import { userService } from '../../services/userService';

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
  onInputChange: (field: keyof User, value: string | number | null) => void;
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
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);

  // Cargar supervisores al montar el componente
  useEffect(() => {
    const loadSupervisors = async () => {
      setLoadingSupervisors(true);
      try {
        const supervisorsData = await userService.getSupervisors();
        setSupervisors(supervisorsData);
      } catch (error) {
        console.error('Error cargando supervisores:', error);
      } finally {
        setLoadingSupervisors(false);
      }
    };

    loadSupervisors();
  }, []);

  if (!user) return <div>No se seleccionó ningún usuario</div>;

  // Función para manejar cambios en info_extra
  const handleInfoExtraChange = (field: string, value: string) => {
    if (!editedUser) return;

    const currentInfoExtra = editedUser.info_extra || {};
    const newInfoExtra = {
      ...currentInfoExtra,
      [field]: value
    };

    // Si el campo está vacío, eliminarlo del objeto
    if (!value.trim()) {
      delete newInfoExtra[field];
    }

    onInputChange('info_extra', JSON.stringify(newInfoExtra));
  };

  // Función para obtener el valor de info_extra de forma segura
  const getInfoExtraValue = (field: string, userData: User) => {
    try {
      const infoExtra = typeof userData.info_extra === 'string'
        ? JSON.parse(userData.info_extra)
        : userData.info_extra;
      return infoExtra?.[field] || '';
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar/Imagen */}
      <div className="flex justify-center">
        <div className="relative">
          <img
            src="https://via.placeholder.com/150"
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
              className="mt-1 p-2 block w-full rounded-md border-2 border-black-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
              value={editedUser.nombre}
              onChange={(e) => onInputChange('nombre', e.target.value)}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded border">{user.nombre}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Correo</label>
          {isEditing ? (
            <input
              type="email"
              className="mt-1 p-2 block w-full rounded-md border-2 border-black-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
              value={editedUser.correo}
              onChange={(e) => onInputChange('correo', e.target.value)}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded border">{user.correo}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cédula</label>
          {isEditing ? (
            <input
              type="text"
              className="mt-1 p-2 block w-full rounded-md border-2 border-black-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
              value={editedUser.cedula}
              onChange={(e) => onInputChange('cedula', e.target.value)}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded border">{user.cedula}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          {isEditing ? (
            <select
              className="mt-1 p-2 block w-full rounded-md border-2 border-black-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
              value={editedUser.rol}
              onChange={(e) => onInputChange('rol', e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="banco">Banco</option>
              <option value="asesor">Asesor</option>
              <option value="supervisor">Supervisor</option>
            </select>
          ) : (
            <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded border">{user.rol}</p>
          )}
        </div>

        {/* Campo de Supervisor - Solo visible para asesores */}
        {(editedUser.rol === 'asesor' || user.rol === 'asesor') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Supervisor</label>
            {isEditing ? (
              <select
                className="mt-1 p-2 block w-full rounded-md border-2 border-black-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                value={editedUser.reports_to_id || ''}
                onChange={(e) => onInputChange('reports_to_id', e.target.value ? parseInt(e.target.value) : null)}
                disabled={loadingSupervisors}
              >
                <option value="">Sin supervisor</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                {user.reports_to_id ?
                  supervisors.find(s => s.id === user.reports_to_id)?.nombre || `ID: ${user.reports_to_id}`
                  : 'Sin supervisor'
                }
              </p>
            )}
            {loadingSupervisors && (
              <p className="mt-1 text-sm text-gray-500">Cargando supervisores...</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">ID</label>
          <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded border">{user.id}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
          <p className="mt-1 text-sm text-gray-600 p-2 bg-gray-50 rounded border">
            {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'No disponible'}
          </p>
        </div>
      </div>

      {/* Información adicional */}
      {(user.info_extra || editedUser.info_extra) && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                <div className="mt-1 relative">
                  <MapPin className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="pl-8 p-2 block w-full rounded-md border-2 border-black-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    value={getInfoExtraValue('ciudad', editedUser)}
                    onChange={(e) => handleInfoExtraChange('ciudad', e.target.value)}
                    placeholder="Ej: Barranquilla"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Banco</label>
                <div className="mt-1 relative">
                  <Building className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="pl-8 p-2 block w-full rounded-md border-2 border-black-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    value={getInfoExtraValue('banco_nombre', editedUser)}
                    onChange={(e) => handleInfoExtraChange('banco_nombre', e.target.value)}
                    placeholder="Ej: Bancolombia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Línea de Crédito</label>
                <div className="mt-1 relative">
                  <CreditCard className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    className="pl-8 p-2 block w-full rounded-md border-2 border-black-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    value={getInfoExtraValue('linea_credito', editedUser)}
                    onChange={(e) => handleInfoExtraChange('linea_credito', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="hipotecario">Hipotecario</option>
                    <option value="consumo">Consumo</option>
                    <option value="comercial">Comercial</option>
                    <option value="microcredito">Microcrédito</option>
                    <option value="libranza">Libranza</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getInfoExtraValue('ciudad', user) && (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Ciudad</p>
                    <p className="text-sm font-medium text-gray-900">{getInfoExtraValue('ciudad', user)}</p>
                  </div>
                </div>
              )}

              {getInfoExtraValue('banco_nombre', user) && (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Building className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Banco</p>
                    <p className="text-sm font-medium text-gray-900">{getInfoExtraValue('banco_nombre', user)}</p>
                  </div>
                </div>
              )}

              {getInfoExtraValue('linea_credito', user) && (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Línea de Crédito</p>
                    <p className="text-sm font-medium text-gray-900">{getInfoExtraValue('linea_credito', user)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mostrar otros campos de info_extra si existen */}
          {!isEditing && user.info_extra && (
            (() => {
              try {
                const infoExtra = typeof user.info_extra === 'string'
                  ? JSON.parse(user.info_extra)
                  : user.info_extra;

                const otherFields = Object.keys(infoExtra).filter(key =>
                  !['ciudad', 'banco_nombre', 'linea_credito'].includes(key)
                );

                if (otherFields.length > 0) {
                  return (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Otros Campos</h4>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(
                            Object.fromEntries(
                              otherFields.map(key => [key, infoExtra[key]])
                            ),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  );
                }
                return null;
              } catch {
                return null;
              }
            })()
          )}
        </div>
      )}

      {isEditing && (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                      <input
              type="password"
              className="mt-1 p-2 block w-full rounded-md border-2 border-black-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
              value={editedUser.contraseña || ''}
              onChange={(e) => onInputChange('contraseña', e.target.value)}
              placeholder="Dejar en blanco para mantener la actual"
            />
        </div>
      )}

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