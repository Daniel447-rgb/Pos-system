import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import Products from './components/products/Products';
import POS from './components/pos/POS';
import Inventory from './components/inventory/Inventory';
import SalesHistory from './components/sales/SalesHistory';
import Customers from './components/customers/Customers';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#00e5a0', secondary: '#050b14' },
            },
            error: {
              iconTheme: { primary: '#ff4d6d', secondary: '#050b14' },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/pos" element={
            <PrivateRoute>
              <Layout><POS /></Layout>
            </PrivateRoute>
          } />
          <Route path="/products" element={
            <PrivateRoute>
              <Layout><Products /></Layout>
            </PrivateRoute>
          } />
          <Route path="/inventory" element={
            <PrivateRoute>
              <Layout><Inventory /></Layout>
            </PrivateRoute>
          } />
          <Route path="/sales" element={
            <PrivateRoute>
              <Layout><SalesHistory /></Layout>
            </PrivateRoute>
          } />
          <Route path="/customers" element={
            <PrivateRoute>
              <Layout><Customers /></Layout>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
