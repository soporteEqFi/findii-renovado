import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Mostrar mensaje de error más específico
      if (error instanceof Error) {
        const errorCode = (error as any).errorCode;
        const errorMessage = (error as any).errorMessage || error.message;

        // Manejar errores específicos de usuarios temporales usando el código del backend
        if (errorCode === 'USER_INACTIVE') {
          // Usar el mensaje del backend si está disponible, sino usar uno por defecto
          setError(errorMessage || 'Tu cuenta temporal está desactivada. Contacta al administrador para activarla.');
        } else if (errorCode === 'USER_EXPIRED') {
          // Usar el mensaje del backend si está disponible, sino usar uno por defecto
          setError(errorMessage || 'Tu cuenta temporal ha expirado. Contacta al administrador para renovar el acceso.');
        } else if (errorMessage.includes('USER_INACTIVE') || errorMessage.includes('usuario_inactivo')) {
          setError(errorMessage || 'Tu cuenta temporal está desactivada. Contacta al administrador.');
        } else if (errorMessage.includes('USER_EXPIRED') || errorMessage.includes('usuario_expirado') || errorMessage.includes('Cuenta expirada')) {
          setError(errorMessage || 'Tu cuenta temporal ha expirado. Contacta al administrador para renovar el acceso.');
        } else if (errorMessage.includes('acceso') || errorMessage.includes('Access denied')) {
          setError('Credenciales inválidas. Por favor, verifique su email y contraseña.');
        } else if (errorMessage.includes('usuario') || errorMessage.includes('datos')) {
          setError('Error en la respuesta del servidor. Contacte al administrador.');
        } else if (errorMessage.includes('token')) {
          setError('Error de autenticación. Contacte al administrador.');
        } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          setError('Error de conexión. Verifique su conexión a internet.');
        } else {
          // Mostrar el mensaje del backend directamente si está disponible
          setError(errorMessage || 'Error al iniciar sesión. Por favor, intente nuevamente.');
        }
      } else {
        setError('Error desconocido. Por favor, intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Iniciar sesión
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;