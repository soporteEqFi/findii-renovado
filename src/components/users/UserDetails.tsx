import React, { useState, useEffect } from 'react';
import { User } from '../../types/user';
import { Loader2, MapPin, Building, CreditCard, Eye, EyeOff, X, Calendar, Clock } from 'lucide-react';
import { userService } from '../../services/userService';
import { isValidDateFormat, isValidDate, getDaysRemaining, formatDateTimeLocalToCustom, formatCustomToDateTimeLocal, getTimeRemaining } from '../../utils/dateValidation';

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
  const [validationErrors, setValidationErrors] = useState<{
    tiempo_conexion?: string;
    usuario_activo?: string;
  }>({});

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
  const handleInfoExtraChange = (field: string, value: string | boolean) => {
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

    // Si el campo está vacío (solo para strings), eliminarlo del objeto
    if (typeof value === 'string' && !value.trim()) {
      delete newInfoExtra[field];
    }

    // Limpiar error de validación cuando el usuario empieza a escribir
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof validationErrors];
        return newErrors;
      });
    }

    onInputChange('info_extra', JSON.stringify(newInfoExtra));
  };

  // Función para validar antes de guardar
  const validateBeforeSave = (): boolean => {
    console.log('🔐 validateBeforeSave INICIADO');
    const errors: { tiempo_conexion?: string; usuario_activo?: string } = {};

    // Obtener info_extra actualizado
    let infoExtra = editedUser.info_extra || {};
    if (typeof infoExtra === 'string') {
      try {
        infoExtra = JSON.parse(infoExtra);
      } catch {
        infoExtra = {};
      }
    }

    console.log('🔐 infoExtra antes de limpiar:', JSON.stringify(infoExtra, null, 2));

    const tiempoConexion = infoExtra.tiempo_conexion;
    const usuarioActivo = infoExtra.usuario_activo;

    // Si NO tiene tiempo_conexion, el usuario es permanente
    // Eliminar SOLO campos de usuario temporal antes de guardar
    // Preservar todos los demás campos (ciudad, banco_nombre, linea_credito, etc.)
    if (!tiempoConexion || tiempoConexion === '') {
      delete infoExtra.tiempo_conexion;
      delete infoExtra.usuario_activo;

      console.log('🔐 infoExtra después de limpiar campos temporales:', JSON.stringify(infoExtra, null, 2));
      console.log('🔐 Llamando a onInputChange para actualizar editedUser...');

      // Actualizar editedUser con info_extra limpio (sin campos temporales, pero preservando otros)
      onInputChange('info_extra', JSON.stringify(infoExtra));
    } else {
      // Si tiene tiempo_conexion, validar formato
      if (!isValidDateFormat(tiempoConexion)) {
        errors.tiempo_conexion = 'El formato debe ser DD/MM/YYYY HH:MM:SS';
      } else if (!isValidDate(tiempoConexion)) {
        errors.tiempo_conexion = 'La fecha y hora ingresadas no son válidas';
      }

      // Validar que usuario_activo sea boolean si está presente (es opcional)
      if (usuarioActivo !== undefined && typeof usuarioActivo !== 'boolean') {
        errors.usuario_activo = 'El estado del usuario debe ser activo o inactivo';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  // Interceptar onSave para validar antes
  const handleSave = () => {
    console.log('💾 handleSave en UserDetails - INICIADO');
    console.log('💾 editedUser.info_extra antes de validar:', editedUser.info_extra);

    if (!validateBeforeSave()) {
      console.log('❌ Validación falló, no se guarda');
      return;
    }

    console.log('✅ Validación pasó, llamando a onSave()');
    onSave();
  };

  // Función para obtener el estado del usuario
  // Lógica según backend:
  // - Permanente: no tiene tiempo_conexion ni usuario_activo
  // - Temporal activo: tiene tiempo_conexion y (usuario_activo es true o undefined)
  // - Temporal inactivo: tiene tiempo_conexion y usuario_activo es false
  // - Temporal expirado: tiene tiempo_conexion pero la fecha pasó
  const getUserStatus = (userData: User): { type: 'permanente' | 'temporal'; status: 'activo' | 'inactivo' | 'expirado' } => {
    const infoExtra = typeof userData.info_extra === 'string'
      ? JSON.parse(userData.info_extra)
      : userData.info_extra;

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
            const value = parsedJson?.[field];
            // Manejar valores boolean false correctamente
            if (value === false) return false;
            return value || '';
          } catch (error) {
            return '';
          }
        }
      }

      const value = infoExtra?.[field];
      // Manejar valores boolean false correctamente (false || '' devuelve '', necesitamos preservar false)
      if (value === false) return false;
      if (value === true) return true;
      return value || '';
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
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
              src="/logouser.png"
              alt={user.nombre}
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <span className="w-1 h-6 bg-blue-500 mr-3 rounded"></span>
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editedUser.nombre}
                  onChange={(e) => onInputChange('nombre', e.target.value)}
                />
              ) : (
                <p className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100">{user.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editedUser.correo}
                  onChange={(e) => onInputChange('correo', e.target.value)}
                />
              ) : (
                <p className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100">{user.correo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cédula</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editedUser.cedula}
                  onChange={(e) => onInputChange('cedula', e.target.value)}
                />
              ) : (
                <p className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100">{user.cedula}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rol</label>
              {isEditing ? (
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={editedUser.rol}
                  onChange={(e) => onInputChange('rol', e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="banco">Banco</option>
                  <option value="asesor">Asesor</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              ) : (
                <p className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100">{user.rol}</p>
              )}
            </div>

            {/* Campo de Supervisor - Solo visible para asesores */}
            {(editedUser.rol === 'asesor' || user.rol === 'asesor') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supervisor</label>
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
                  <p className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID</label>
              <p className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100">{user.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Creación</label>
              <p className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
            </div>
          </div>
        </div>

        {/* Estado del Usuario - Visualización */}
        {!isEditing && (
          <div className="mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-1 h-6 bg-blue-500 mr-3 rounded"></span>
              Estado del Usuario
            </h3>
            {(() => {
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
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado del Usuario</p>
                      <p className={`text-sm font-semibold ${
                        status.type === 'temporal' ? 'text-yellow-600' : 'text-gray-900'
                      }`}>
                        {statusMessage}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      status.status === 'activo' ? 'bg-green-100 text-green-800' :
                      status.status === 'inactivo' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {status.status === 'activo' ? 'Activo' :
                       status.status === 'inactivo' ? 'Inactivo' :
                       status.type === 'permanente' ? 'Permanente' :
                       'Expirado'}
                    </span>
                  </div>

                  {tiempoConexion && status.status === 'activo' && daysRemaining !== null && daysRemaining >= 0 && (() => {
                    const timeRemaining = getTimeRemaining(tiempoConexion);
                    return (
                      <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Clock className="w-5 h-5 mr-3 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Tiempo Restante</p>
                          <p className={`text-sm font-semibold ${
                            daysRemaining <= 7 ? 'text-red-600' :
                            daysRemaining <= 30 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {timeRemaining && timeRemaining.days > 0 ? (
                              <>
                                {timeRemaining.days} día{timeRemaining.days !== 1 ? 's' : ''}
                                {timeRemaining.hours > 0 && `, ${timeRemaining.hours} hora${timeRemaining.hours !== 1 ? 's' : ''}`}
                              </>
                            ) : timeRemaining && timeRemaining.hours > 0 ? (
                              <>
                                {timeRemaining.hours} hora{timeRemaining.hours !== 1 ? 's' : ''}
                                {timeRemaining.minutes > 0 && `, ${timeRemaining.minutes} minuto${timeRemaining.minutes !== 1 ? 's' : ''}`}
                              </>
                            ) : (
                              <>
                                {daysRemaining} día{daysRemaining !== 1 ? 's' : ''}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        )}

        {/* Usuario Temporal - Edición */}
        {isEditing && (
          <div className="mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-1 h-6 bg-blue-500 mr-3 rounded"></span>
              Usuario Temporal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha y Hora de Expiración
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="datetime-local"
                    className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      validationErrors.tiempo_conexion ? 'border-red-500' : ''
                    }`}
                    value={(() => {
                      const tiempoConexion = getInfoExtraValue('tiempo_conexion', editedUser);
                      if (!tiempoConexion) return '';
                      return formatCustomToDateTimeLocal(String(tiempoConexion));
                    })()}
                    onChange={(e) => {
                      const datetimeLocal = e.target.value;
                      if (datetimeLocal) {
                        // Convertir de datetime-local a formato DD/MM/YYYY HH:MM:SS
                        const customFormat = formatDateTimeLocalToCustom(datetimeLocal);
                        handleInfoExtraChange('tiempo_conexion', customFormat);
                      } else {
                        // Si se borra la fecha, eliminar tiempo_conexion y usuario_activo
                        // Esto convierte al usuario en permanente
                        const infoExtra = typeof editedUser.info_extra === 'string'
                          ? JSON.parse(editedUser.info_extra)
                          : editedUser.info_extra || {};
                        delete infoExtra.tiempo_conexion;
                        delete infoExtra.usuario_activo;
                        onInputChange('info_extra', JSON.stringify(infoExtra));
                      }
                    }}
                    min={(() => {
                      // Establecer mínimo como ahora
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = String(now.getMonth() + 1).padStart(2, '0');
                      const day = String(now.getDate()).padStart(2, '0');
                      const hours = String(now.getHours()).padStart(2, '0');
                      const minutes = String(now.getMinutes()).padStart(2, '0');
                      return `${year}-${month}-${day}T${hours}:${minutes}`;
                    })()}
                  />
                </div>
                {validationErrors.tiempo_conexion && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.tiempo_conexion}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Dejar vacío para usuario permanente. Si se completa, el usuario será temporal.
                </p>
                {getInfoExtraValue('tiempo_conexion', editedUser) && (
                  <p className="mt-1 text-xs text-gray-600 font-medium">
                    Formato guardado: {getInfoExtraValue('tiempo_conexion', editedUser)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado del Usuario
                </label>
                <select
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    validationErrors.usuario_activo ? 'border-red-500' : ''
                  }`}
                  value={(() => {
                    const value = getInfoExtraValue('usuario_activo', editedUser);
                    // Si el valor es undefined, null, o cadena vacía, retornar 'true' (activo por defecto)
                    if (value === undefined || value === null || value === '') return 'true';
                    // Si es boolean, convertirlo a string
                    if (typeof value === 'boolean') return String(value);
                    return String(value);
                  })()}
                  onChange={(e) => {
                    if (e.target.value === 'true') {
                      // Si se selecciona "Activo", eliminar AMBOS campos temporales (usuario permanente)
                      // Esto hace que el usuario sea permanente y activo por defecto
                      const infoExtra = typeof editedUser.info_extra === 'string'
                        ? JSON.parse(editedUser.info_extra)
                        : editedUser.info_extra || {};

                      console.log('🔄 Seleccionado "Activo" - eliminando campos temporales');
                      console.log('🔄 infoExtra antes:', JSON.stringify(infoExtra, null, 2));

                      // Eliminar ambos campos temporales para hacer usuario permanente
                      delete infoExtra.usuario_activo;
                      delete infoExtra.tiempo_conexion;

                      console.log('🔄 infoExtra después:', JSON.stringify(infoExtra, null, 2));

                      onInputChange('info_extra', JSON.stringify(infoExtra));
                    } else {
                      // Si se selecciona "Inactivo", establecer usuario_activo: false
                      console.log('🔄 Seleccionado "Inactivo" - estableciendo usuario_activo: false');
                      handleInfoExtraChange('usuario_activo', false);
                    }
                  }}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
                {validationErrors.usuario_activo && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.usuario_activo}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Selecciona el estado del usuario temporal. Si se borra la fecha, el usuario será permanente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        {(user.info_extra || editedUser.info_extra) && (
          <div className="mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-1 h-6 bg-blue-500 mr-3 rounded"></span>
              Información Adicional
            </h3>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ciudad</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={getInfoExtraValue('ciudad', editedUser)}
                    onChange={(e) => handleInfoExtraChange('ciudad', e.target.value)}
                    placeholder="Ej: Barranquilla"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banco</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={getInfoExtraValue('banco_nombre', editedUser)}
                    onChange={(e) => handleInfoExtraChange('banco_nombre', e.target.value)}
                    placeholder="Ej: Bancolombia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Línea de Crédito</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ciudad</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{getInfoExtraValue('ciudad', user)}</p>
                  </div>
                </div>
              )}

              {getInfoExtraValue('banco_nombre', user) && (
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                  <Building className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Banco</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{getInfoExtraValue('banco_nombre', user)}</p>
                  </div>
                </div>
              )}

              {getInfoExtraValue('linea_credito', user) && (
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Línea de Crédito</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{getInfoExtraValue('linea_credito', user)}</p>
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
                  !['ciudad', 'banco_nombre', 'linea_credito', 'usuario_activo', 'tiempo_conexion'].includes(key)
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
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
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
      <div className="px-8 py-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        {!isEditing && canEdit() && (
          <button
            type="button"
            onClick={onEdit}
            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm transition-all"
          >
            Editar
          </button>
        )}

        {isEditing && (
          <button
            type="button"
            onClick={handleSave}
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