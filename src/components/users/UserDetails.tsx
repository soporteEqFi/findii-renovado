import React, { useState, useEffect } from 'react';
import { User } from '../../types/user';
import { Loader2, MapPin, Building, CreditCard, Eye, EyeOff, X } from 'lucide-react';
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
  onClose?: () => void;
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
  onClose,
}) => {
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    let currentInfoExtra = editedUser.info_extra || {};

    // 🔧 VALIDACIÓN: Detectar objetos corruptos con claves numéricas
    if (typeof currentInfoExtra === 'object' && currentInfoExtra !== null) {
      const keys = Object.keys(currentInfoExtra);
      const hasNumericKeys = keys.some(key => /^\d+$/.test(key));

      if (hasNumericKeys) {
        // Intentar reconstruir el JSON válido a partir de las claves numéricas
        try {
          const reconstructedJson = Object.values(currentInfoExtra).join('');
          const parsedJson = JSON.parse(reconstructedJson);
          currentInfoExtra = parsedJson;
        } catch (error) {
          currentInfoExtra = {}; // Solo si no se puede reconstruir
        }
      }
    }

    // Si es string, parsearlo
    if (typeof currentInfoExtra === 'string') {
      try {
        currentInfoExtra = JSON.parse(currentInfoExtra);
      } catch (error) {
        currentInfoExtra = {};
      }
    }

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
      let infoExtra = typeof userData.info_extra === 'string'
        ? JSON.parse(userData.info_extra)
        : userData.info_extra;

      // 🔧 VALIDACIÓN: Detectar objetos corruptos con claves numéricas
      if (typeof infoExtra === 'object' && infoExtra !== null) {
        const keys = Object.keys(infoExtra);
        const hasNumericKeys = keys.some(key => /^\d+$/.test(key));

        if (hasNumericKeys) {
          // Intentar reconstruir el JSON válido a partir de las claves numéricas
          try {
            const reconstructedJson = Object.values(infoExtra).join('');
            const parsedJson = JSON.parse(reconstructedJson);
            return parsedJson?.[field] || '';
          } catch (error) {
            return '';
          }
        }
      }

      return infoExtra?.[field] || '';
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header con fondo azul oscuro */}
      <div className="px-8 py-6 bg-gradient-to-r from-slate-800 to-slate-900 relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none transition-colors"
          >
            <X size={24} />
          </button>
        )}
        <h2 className="text-2xl font-bold text-white">Detalles del Usuario</h2>
        <p className="text-slate-300 text-sm mt-1">
          {isEditing ? 'Edita la información del usuario' : 'Información del usuario'}
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Avatar/Imagen */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src="https://via.placeholder.com/150"
              alt={user.nombre}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Información Personal */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-1 h-6 bg-blue-500 mr-3 rounded"></span>
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editedUser.nombre}
                  onChange={(e) => onInputChange('nombre', e.target.value)}
                />
              ) : (
                <p className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">{user.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editedUser.correo}
                  onChange={(e) => onInputChange('correo', e.target.value)}
                />
              ) : (
                <p className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">{user.correo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cédula</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editedUser.cedula}
                  onChange={(e) => onInputChange('cedula', e.target.value)}
                />
              ) : (
                <p className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">{user.cedula}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              {isEditing ? (
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editedUser.rol}
                  onChange={(e) => onInputChange('rol', e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="banco">Banco</option>
                  <option value="asesor">Asesor</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              ) : (
                <p className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">{user.rol}</p>
              )}
            </div>

            {/* Campo de Supervisor - Solo visible para asesores */}
            {(editedUser.rol === 'asesor' || user.rol === 'asesor') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor</label>
                {isEditing ? (
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50"
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
                  <p className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">ID</label>
              <p className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">{user.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Creación</label>
              <p className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {(user.info_extra || editedUser.info_extra) && (
          <div className="mb-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-1 h-6 bg-blue-500 mr-3 rounded"></span>
              Información Adicional
            </h3>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={getInfoExtraValue('ciudad', editedUser)}
                    onChange={(e) => handleInfoExtraChange('ciudad', e.target.value)}
                    placeholder="Ej: Barranquilla"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banco</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={getInfoExtraValue('banco_nombre', editedUser)}
                    onChange={(e) => handleInfoExtraChange('banco_nombre', e.target.value)}
                    placeholder="Ej: Bancolombia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Línea de Crédito</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Sección de cambio de contraseña */}
      {isEditing && (
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-1 h-6 bg-blue-500 mr-3 rounded"></span>
            Cambiar Contraseña
            <span className="ml-2 text-sm font-normal text-gray-500">(Opcional)</span>
          </h3>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={editedUser.contraseña || ''}
                onChange={(e) => onInputChange('contraseña', e.target.value)}
                placeholder="Dejar en blanco para no cambiar"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Footer con botones */}
      <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
        {!isEditing && canEdit() && (
          <button
            type="button"
            onClick={onEdit}
            className="px-6 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-white hover:shadow-sm transition-all"
          >
            Editar
          </button>
        )}

        {isEditing && (
          <button
            type="button"
            onClick={onSave}
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        )}

        {canDelete() && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isLoading}
            className="px-6 py-2.5 text-white font-medium bg-red-600 rounded-lg hover:bg-red-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};