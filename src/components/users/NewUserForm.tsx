import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { CreateUserData, User } from '../../types/user';
import { userService } from '../../services/userService';
import { isValidDateFormat, isValidDate, isFutureDate, formatDateTimeLocalToCustom, formatCustomToDateTimeLocal } from '../../utils/dateValidation';

interface NewUserFormProps {
  onSubmit: (userData: CreateUserData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const NewUserForm: React.FC<NewUserFormProps> = ({
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    correo: '',
    contraseña: '',
    nombre: '',
    rol: '',
    cedula: '',
    reports_to_id: null,
    info_extra: {
      ciudad: '',
      banco_nombre: '',
      linea_credito: ''
    }
  });

  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [isTemporalUser, setIsTemporalUser] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones para usuarios temporales
    const errors: { tiempo_conexion?: string; usuario_activo?: string } = {};

    if (isTemporalUser) {
      // Validar que tiempo_conexion esté presente
      const tiempoConexion = formData.info_extra?.tiempo_conexion || '';
      if (!tiempoConexion) {
        errors.tiempo_conexion = 'La fecha y hora de expiración es requerida para usuarios temporales';
      } else {
        // Validar formato (acepta DD/MM/YYYY o DD/MM/YYYY HH:MM:SS)
        if (!isValidDateFormat(tiempoConexion)) {
          errors.tiempo_conexion = 'El formato debe ser DD/MM/YYYY HH:MM:SS';
        } else if (!isValidDate(tiempoConexion)) {
          errors.tiempo_conexion = 'La fecha y hora ingresadas no son válidas';
        } else if (!isFutureDate(tiempoConexion)) {
          errors.tiempo_conexion = 'La fecha y hora de expiración deben ser futuras';
        }
      }

      // Validar que usuario_activo sea boolean si está presente (es opcional)
      if (formData.info_extra?.usuario_activo !== undefined && typeof formData.info_extra.usuario_activo !== 'boolean') {
        errors.usuario_activo = 'El estado del usuario debe ser activo o inactivo';
      }
    }

    // Si hay errores, no enviar
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    // Preparar info_extra
    const infoExtra = formData.info_extra || {};

    // Si es usuario temporal, asegurar que tiempo_conexion esté presente
    if (isTemporalUser) {
      infoExtra.tiempo_conexion = formData.info_extra?.tiempo_conexion || '';
      // usuario_activo es opcional, solo agregarlo si tiene valor
      if (formData.info_extra?.usuario_activo !== undefined) {
        infoExtra.usuario_activo = formData.info_extra.usuario_activo;
      } else {
        // Si no se especifica, no agregar el campo (el backend asume activo por defecto)
        delete infoExtra.usuario_activo;
      }
    } else {
      // Si no es temporal, eliminar estos campos
      delete infoExtra.usuario_activo;
      delete infoExtra.tiempo_conexion;
    }

    // Limpiar info_extra si todos los campos están vacíos
    const hasInfoExtra = Object.values(infoExtra).some(value => {
      if (typeof value === 'boolean') return true;
      return value && String(value).trim() !== '';
    });

    const dataToSubmit = {
      ...formData,
      info_extra: hasInfoExtra ? infoExtra : undefined
    };

    await onSubmit(dataToSubmit);
  };

  const handleInputChange = (field: keyof CreateUserData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInfoExtraChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      info_extra: {
        ...prev.info_extra,
        [field]: value
      }
    }));

    // Limpiar error de validación cuando el usuario empieza a escribir
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof validationErrors];
        return newErrors;
      });
    }
  };

  const handleTemporalUserToggle = (checked: boolean) => {
    setIsTemporalUser(checked);
    setValidationErrors({});

    if (!checked) {
      // Limpiar campos de usuario temporal si se desactiva
      setFormData(prev => ({
        ...prev,
        info_extra: {
          ...prev.info_extra,
          usuario_activo: undefined,
          tiempo_conexion: undefined
        }
      }));
    } else {
      // Inicializar valores por defecto si se activa
      setFormData(prev => ({
        ...prev,
        info_extra: {
          ...prev.info_extra,
          usuario_activo: true,
          tiempo_conexion: ''
        }
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campos principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
          <input
            type="text"
            required
            className="mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cédula *</label>
          <input
            type="text"
            required
            className="mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
            value={formData.cedula}
            onChange={(e) => handleInputChange('cedula', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo *</label>
          <input
            type="email"
            required
            className="mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
            value={formData.correo}
            onChange={(e) => handleInputChange('correo', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña *</label>
          <input
            type="password"
            required
            className="mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
            value={formData.contraseña}
            onChange={(e) => handleInputChange('contraseña', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol *</label>
          <select
            required
            className="mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
            value={formData.rol}
            onChange={(e) => handleInputChange('rol', e.target.value)}
          >
            <option value="">Seleccionar...</option>
            <option value="admin">Admin</option>
            <option value="banco">Banco</option>
            <option value="supervisor">Supervisor</option>
            <option value="asesor">Asesor</option>
          </select>
        </div>

        {/* Campo de Supervisor - Solo visible para asesores */}
        {formData.rol === 'asesor' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supervisor (Opcional)</label>
            <select
              className="mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800"
              value={formData.reports_to_id || ''}
              onChange={(e) => handleInputChange('reports_to_id', e.target.value ? parseInt(e.target.value) : null)}
              disabled={loadingSupervisors}
            >
              <option value="">Sin supervisor</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor.id} value={supervisor.id}>
                  {supervisor.nombre}
                </option>
              ))}
            </select>
            {loadingSupervisors && (
              <p className="mt-1 text-sm text-gray-500">Cargando supervisores...</p>
            )}
          </div>
        )}
      </div>

      {/* Usuario Temporal */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Usuario Temporal</h3>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isTemporalUser}
              onChange={(e) => handleTemporalUserToggle(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Crear como usuario temporal
            </span>
          </label>
        </div>

        {isTemporalUser && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha y Hora de Expiración *
              </label>
              <input
                type="datetime-local"
                className={`mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  validationErrors.tiempo_conexion ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                value={(() => {
                  const tiempoConexion = formData.info_extra?.tiempo_conexion || '';
                  if (!tiempoConexion) return '';
                  return formatCustomToDateTimeLocal(tiempoConexion);
                })()}
                onChange={(e) => {
                  const datetimeLocal = e.target.value;
                  if (datetimeLocal) {
                    // Convertir de datetime-local a formato DD/MM/YYYY HH:MM:SS
                    const customFormat = formatDateTimeLocalToCustom(datetimeLocal);
                    handleInfoExtraChange('tiempo_conexion', customFormat);
                  } else {
                    handleInfoExtraChange('tiempo_conexion', '');
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
              {validationErrors.tiempo_conexion && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.tiempo_conexion}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                La fecha y hora deben ser futuras
              </p>
              {formData.info_extra?.tiempo_conexion && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Formato guardado: {formData.info_extra.tiempo_conexion}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado del Usuario (Opcional)
              </label>
              <select
                className={`mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  validationErrors.usuario_activo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                value={formData.info_extra?.usuario_activo === undefined ? '' : String(formData.info_extra.usuario_activo)}
                onChange={(e) => {
                  if (e.target.value === '') {
                    handleInfoExtraChange('usuario_activo', undefined as any);
                  } else {
                    handleInfoExtraChange('usuario_activo', e.target.value === 'true');
                  }
                }}
              >
                <option value="">Activo (por defecto)</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
              {validationErrors.usuario_activo && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.usuario_activo}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Si no se especifica, el usuario será activo por defecto
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Información Adicional (Opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ciudad</label>
            <input
              type="text"
              className="mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
              value={formData.info_extra?.ciudad || ''}
              onChange={(e) => handleInfoExtraChange('ciudad', e.target.value)}
              placeholder="Ej: Barranquilla"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banco</label>
            <input
              type="text"
              className="mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
              value={formData.info_extra?.banco_nombre || ''}
              onChange={(e) => handleInfoExtraChange('banco_nombre', e.target.value)}
              placeholder="Ej: Bancolombia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Línea de Crédito</label>
            <select
              className="mt-1 p-2 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
              value={formData.info_extra?.linea_credito || ''}
              onChange={(e) => handleInfoExtraChange('linea_credito', e.target.value)}
            >
              <option value="">Seleccionar...</option>
              <option value="hipotecario">Hipotecario</option>
              <option value="vehicular">Vehicular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Usuario'
          )}
        </button>
      </div>
    </form>
  );
};