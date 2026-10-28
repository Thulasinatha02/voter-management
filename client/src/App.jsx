import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wards from './pages/Wards';
import Families from './pages/Families';
import FamilyForm from './pages/FamilyForm';
import FamilyDetails from './pages/FamilyDetails';
import Members from './pages/Members';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 text-xs">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="wards" element={<Wards />} />
            <Route path="families" element={<Families />} />
            <Route path="families/new" element={<FamilyForm />} />
            <Route path="families/:id" element={<FamilyDetails />} />
            <Route path="members" element={<Members />} />
            <Route path="reports" element={<Reports />} />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'auditor']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
