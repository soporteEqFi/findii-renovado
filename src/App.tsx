import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Customers from './pages/Customers';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Customers />} />
              <Route path="dashboard" element={<div>Dashboard (Coming Soon)</div>} />
              <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
            </Route>
          </Route>
          
          {/* Admin only routes example */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<div>Admin Panel (Coming Soon)</div>} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;