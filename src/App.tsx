import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
// import TestPage from './pages/TestPage'; // Ocultado
import TermsAndConditions from './pages/TermsAndConditions';
import AcuerdoFirma from './pages/AcuerdoFirma';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TableConfigProvider } from './contexts/TableConfigContext';
import { Toaster } from 'react-hot-toast';
import { CreditTracking } from './components/tracking/CreditTracking';
import ConfiguracionAdmin from './pages/ConfiguracionAdmin';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para proteger rutas que requieren rol de administrador o supervisor
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.rol !== 'admin' && user?.rol !== 'supervisor') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <AuthProvider>
        <TableConfigProvider>
          <BrowserRouter>
          <Routes>
            {/* Ruta pública de login */}
            <Route path="/login" element={<Login />} />

            {/* Ruta pública de seguimiento */}
            <Route path="/seguimiento" element={<CreditTracking />} />

            {/* Ruta pública de términos y condiciones */}
            <Route path="/terminos-condiciones" element={<TermsAndConditions />} />

            {/* Ruta pública de acuerdo de firma */}
            <Route path="/acuerdo-firma" element={<AcuerdoFirma />} />

            {/* Rutas protegidas dentro del Layout */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Ruta principal (índice) muestra Customers */}
              <Route index element={<Customers />} />

              {/* Rutas solo para administradores */}
              <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />

              {/* Rutas accesibles para todos los usuarios autenticados */}
              {/* <Route path="customers" element={<Customers />} /> */}
              {/* <Route path="settings" element={<div>Settings (Coming Soon)</div>} /> */}
              <Route path="profile" element={<Profile />} />
              <Route path="statistics" element={<Statistics />} />
              {/* <Route path="test" element={<TestPage />} /> */} {/* Ocultado */}

              {/* Ruta para la administración de configuración de campos (solo admin) */}
              <Route path="config" element={
                <AdminRoute>
                  <ConfiguracionAdmin />
                </AdminRoute>
              } />

            </Route>

            {/* Ruta para manejar URLs no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </TableConfigProvider>
      </AuthProvider>
      {/* <div>
        <a href="/users" className="text-blue-500 underline">Ir a Usuarios</a>
      </div> */}
    </>
  );
}

export default App;