import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EjemploCampoArchivo } from '../components/ejemplos/EjemploCampoArchivo';
import { TestCampoArchivo } from '../components/ejemplos/TestCampoArchivo';

const TestPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Página de Prueba</h1>

      {/* Información del usuario */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Información del Usuario</h2>
        <div className="space-y-2">
          <p><strong>Nombre:</strong> {user?.nombre || 'N/A'}</p>
          <p><strong>Rol:</strong> {user?.rol || 'N/A'}</p>
          <p><strong>Empresa:</strong> {user?.empresa || 'N/A'}</p>
          <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Estado de Autenticación</h3>
          <p>Usuario autenticado: {user ? 'Sí' : 'No'}</p>
          <p>Token en localStorage: {localStorage.getItem('access_token') ? 'Sí' : 'No'}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Navegación</h3>
          <p>Esta página funciona correctamente si puedes verla.</p>
          <p>Ruta actual: /test</p>
        </div>
      </div>

      {/* Prueba del campo de archivo dinámico */}
      <TestCampoArchivo />

      {/* Ejemplo completo del campo de archivo */}
      <EjemploCampoArchivo />
    </div>
  );
};

export default TestPage;
