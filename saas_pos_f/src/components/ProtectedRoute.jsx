import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their default dashboard based on their role
    if (role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN' || role === 'ROLE_OWNER') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === 'ROLE_BUSINESS_OWNER') {
      return <Navigate to="/business/dashboard" replace />;
    } else if (role === 'ROLE_CASHIER') {
      return <Navigate to="/pos/terminal" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};
