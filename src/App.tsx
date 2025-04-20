import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Users from './pages/Users';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import CreditTypeAdmin from './pages/CreditTypeAdmin';

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

// Componente para proteger rutas que requieren rol de administrador
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
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
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta pública de login */}
            <Route path="/login" element={<Login />} />
            
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

              {/* Ruta para la administración de tipos de crédito (solo admin) */}
              <Route path="credit-types" element={
                <AdminRoute>
                  <CreditTypeAdmin />
                </AdminRoute>
              } />

            </Route>
            
            {/* Ruta para manejar URLs no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      {/* <div>
        <a href="/users" className="text-blue-500 underline">Ir a Usuarios</a>
      </div> */}
    </>
  );
}

export default App;