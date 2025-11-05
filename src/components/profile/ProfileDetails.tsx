import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface UserInfo {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  cedula: string;
  empresa?: string;
  imagen_aliado?: string | null;
  apellido?: string;
  usuario?: string;
  info_extra?: any;
  contraseña?: string;
}

interface ProfileDetailsProps {
  userInfo: UserInfo;
  open: boolean;
  onClose: () => void;
  onSave: (updatedInfo: Partial<UserInfo> & { contraseña?: string }) => void;
}

const ProfileDetails = ({ userInfo, open, onClose, onSave }: ProfileDetailsProps) => {
  const [formData, setFormData] = useState<UserInfo>(userInfo);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setFormData(userInfo);
    // Limpiar campos de contraseña al abrir/cerrar modal
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  }, [userInfo, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validar contraseñas si se están cambiando
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
        return;
      }
      if (newPassword.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      // Incluir la nueva contraseña en los datos a guardar
      onSave({ ...formData, contraseña: newPassword });
    } else {
      // Guardar sin cambiar contraseña
      onSave(formData);
    }
    
    // Limpiar y cerrar
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header con gradiente */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-xl">
          <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
          <p className="text-slate-300 text-sm mt-1">Actualiza tu información personal</p>
        </div>

        <div className="px-8 py-6">
          {/* Información Personal - Grid de 2 columnas */}
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
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cédula
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-not-allowed text-gray-500 dark:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa || ''}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-not-allowed text-gray-500 dark:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Sección de cambio de contraseña */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <span className="w-1 h-6 bg-blue-500 mr-3 rounded"></span>
              Cambiar Contraseña
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">(Opcional)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Dejar en blanco para no cambiar"
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Confirmar nueva contraseña"
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {passwordError}
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="px-8 py-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;