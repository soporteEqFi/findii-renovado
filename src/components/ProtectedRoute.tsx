import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  requiredRole?: 'admin' | 'manager' | 'user';
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for required role if specified
  if (requiredRole && user && user.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">
          You don't have the required permissions to access this page.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute; 