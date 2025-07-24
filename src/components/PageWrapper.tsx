import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface PageWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
  showLoading?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  requireAuth = true,
  requireRole,
  showLoading = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica autenticación
  if (isLoading && showLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin h-6 w-6" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  // Redirigir si requiere autenticación y no está autenticado
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir si requiere rol específico y no lo tiene
  if (requireRole && user?.rol !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 