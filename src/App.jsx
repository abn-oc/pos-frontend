import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getUserProfile } from './functions';

// Import your page components (you'll create these)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StoreManagement from './pages/StoreManagement';
import { BranchManagement } from './pages/BranchManagement';
import { ProductManagement } from './pages/ProductManagement';
import { InventoryManagement } from './pages/InventoryManagement';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { CustomerManagement } from './pages/CustomerManagement';
import { POS } from './pages/POS';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';
import { Refunds } from './pages/Refunds';
import { CategoryManagement } from './pages/CategoryManagement';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await getUserProfile();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  // Public Route Component (redirect to dashboard if already logged in)
  const PublicRoute = ({ children }) => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      );
    }

    if (user) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login setUser={setUser} />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register setUser={setUser} />
            </PublicRoute>
          } 
        />

        {/* Protected Routes - All Authenticated Users */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile user={user} setUser={setUser} />
            </ProtectedRoute>
          } 
        />

        {/* Store Management - Admin Only */}
        <Route 
          path="/stores" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STORE_ADMIN']}>
              <StoreManagement user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Branch Management - Store Admin/Manager */}
        <Route 
          path="/branches" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_ADMIN']}>
              <BranchManagement user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Employee Management */}
        <Route 
          path="/employees" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_BRANCH_MANAGER']}>
              <EmployeeManagement user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Product Management */}
        <Route 
          path="/products" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_BRANCH_MANAGER']}>
              <ProductManagement user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Category Management */}
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER']}>
              <CategoryManagement user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Inventory Management */}
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_BRANCH_MANAGER']}>
              <InventoryManagement user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Customer Management */}
        <Route 
          path="/customers" 
          element={
            <ProtectedRoute>
              <CustomerManagement user={user} />
            </ProtectedRoute>
          } 
        />

        {/* POS System - Cashiers and above */}
        <Route 
          path="/pos" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_BRANCH_CASHIER', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_STORE_ADMIN', 'ROLE_ADMIN']}>
              <POS user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Orders */}
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id" 
          element={
            <ProtectedRoute>
              <OrderDetails user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Refunds */}
        <Route 
          path="/refunds" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_BRANCH_CASHIER', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_STORE_ADMIN', 'ROLE_ADMIN']}>
              <Refunds user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;