import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SubscriptionManagementPage } from './pages/admin/SubscriptionManagementPage';
import { BusinessDashboard } from './pages/business/BusinessDashboard';
import { PosTerminal } from './pages/pos/PosTerminal';

// Root index redirector
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN' || role === 'ROLE_OWNER') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (role === 'ROLE_BUSINESS_OWNER') {
    return <Navigate to="/business/dashboard" replace />;
  } else if (role === 'ROLE_CASHIER') {
    return <Navigate to="/pos/terminal" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Root dynamic redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Platform Owner (Super Admin) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_OWNER']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Subscription Plan & Tenant Lifecycle Management */}
          <Route
            path="/admin/subscriptions"
            element={
              <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ROLE_OWNER']}>
                <SubscriptionManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Business Owner Dashboard */}
          <Route
            path="/business/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ROLE_BUSINESS_OWNER']}>
                <BusinessDashboard />
              </ProtectedRoute>
            }
          />

          {/* Cashier POS Terminal */}
          <Route
            path="/pos/terminal"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CASHIER', 'ROLE_BUSINESS_OWNER', 'ROLE_OWNER', 'ROLE_SUPER_ADMIN', 'SUPER_ADMIN']}>
                <PosTerminal />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
