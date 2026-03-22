import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ReturnsPage from './pages/ReturnsPage';
import ReturnDetailPage from './pages/ReturnDetailPage';
import InventoryPage from './pages/InventoryPage';
import InStoreSalePage from './pages/InStoreSalePage';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

const AuthenticatedLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 250 }}>
      <Header />
      <main style={{ flex: 1, padding: 24, backgroundColor: 'transparent', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <DashboardPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <OrdersPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <OrderDetailPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/returns"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ReturnsPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/returns/:returnId"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ReturnDetailPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <InventoryPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/in-store-sales"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <InStoreSalePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
