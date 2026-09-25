import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Permission } from './types';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import POS from './pages/POS';
import Purchases from './pages/Purchases';
import InventoryMovements from './pages/InventoryMovements';
import Reports from './pages/Reports';
import UsersPage from './pages/Users';

function ProtectedRoute({ children, permission }: { children: React.ReactNode; permission: Permission }) {
  const { isAuthenticated, hasPermission } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasPermission(permission)) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Access Denied</p>
          <p className="text-gray-500 text-sm mt-1">You don't have permission to view this page.</p>
        </div>
      </div>
    </Layout>
  );
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute permission="view_dashboard"><Dashboard /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute permission="view_products"><Products /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute permission="view_products"><Categories /></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute permission="view_suppliers"><Suppliers /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute permission="view_sales"><Customers /></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute permission="process_sales"><POS /></ProtectedRoute>} />
      <Route path="/purchases" element={<ProtectedRoute permission="view_suppliers"><Purchases /></ProtectedRoute>} />
      <Route path="/movements" element={<ProtectedRoute permission="view_audit_logs"><InventoryMovements /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute permission="view_reports"><Reports /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute permission="manage_users"><UsersPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
