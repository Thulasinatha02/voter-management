import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './layouts/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wards from './pages/Wards';
import Families from './pages/Families';
import FamilyForm from './pages/FamilyForm';
import FamilyDetails from './pages/FamilyDetails';
import Members from './pages/Members';
import Parties from './pages/Parties';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles, requiredPermission }) => {
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

  // Superadmin always has full access
  if (user.role === 'superadmin') {
    return children;
  }

  // If a granular permission is required:
  // If the user has that permission enabled, allow access immediately!
  if (requiredPermission) {
    if (user.permissions && user.permissions[requiredPermission] === true) {
      return children;
    }
    // If user lacks the granular permission, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Fallback to role-based check if no specific permission required
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <LanguageProvider>
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
              <Route
                path="wards"
                element={
                  <ProtectedRoute requiredPermission="wardManagement" allowedRoles={['superadmin', 'ward_officer', 'auditor']}>
                    <Wards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="families"
                element={
                  <ProtectedRoute requiredPermission="familyManagement">
                    <Families />
                  </ProtectedRoute>
                }
              />
              <Route
                path="families/new"
                element={
                  <ProtectedRoute requiredPermission="familyManagement">
                    <FamilyForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="families/:id"
                element={
                  <ProtectedRoute requiredPermission="familyManagement">
                    <FamilyDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="members"
                element={
                  <ProtectedRoute requiredPermission="memberManagement">
                    <Members />
                  </ProtectedRoute>
                }
              />
              <Route
                path="parties"
                element={
                  <ProtectedRoute requiredPermission="partyManagement">
                    <Parties />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute requiredPermission="wardReports" allowedRoles={['superadmin', 'ward_officer', 'auditor']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredPermission="userManagement" allowedRoles={['superadmin']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit-logs"
                element={
                  <ProtectedRoute requiredPermission="auditLogs" allowedRoles={['superadmin', 'auditor']}>
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
    </LanguageProvider>
  );
}

export default App;
