import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.tsx';
import { DashboardLayout } from './layouts/DashboardLayout.tsx';
import { LoadingSpinner } from './components/common/LoadingSpinner.tsx';

// Performance Optimization: Route-based Code Splitting via React.lazy
const LandingPage = lazy(() => import('./pages/LandingPage.tsx').then((m) => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage.tsx').then((m) => ({ default: m.DashboardPage })));
const MedicationsPage = lazy(() => import('./pages/MedicationsPage.tsx').then((m) => ({ default: m.MedicationsPage })));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage.tsx').then((m) => ({ default: m.AppointmentsPage })));
const HealthRecordsPage = lazy(() => import('./pages/HealthRecordsPage.tsx').then((m) => ({ default: m.HealthRecordsPage })));
const VaultPage = lazy(() => import('./pages/VaultPage.tsx').then((m) => ({ default: m.VaultPage })));
const CareActivitiesPage = lazy(() => import('./pages/CareActivitiesPage.tsx').then((m) => ({ default: m.CareActivitiesPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage.tsx').then((m) => ({ default: m.ReportsPage })));
const ElderlyProfilePage = lazy(() => import('./pages/ElderlyProfilePage.tsx').then((m) => ({ default: m.ElderlyProfilePage })));
const CareCirclePage = lazy(() => import('./pages/CareCirclePage.tsx').then((m) => ({ default: m.CareCirclePage })));
const EmergencyPage = lazy(() => import('./pages/EmergencyPage.tsx').then((m) => ({ default: m.EmergencyPage })));
const LoginPage = lazy(() => import('./pages/auth/LoginPage.tsx').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.tsx').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage.tsx').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage.tsx').then((m) => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage.tsx').then((m) => ({ default: m.VerifyEmailPage })));
const JoinProfilePage = lazy(() => import('./pages/auth/JoinProfilePage.tsx').then((m) => ({ default: m.JoinProfilePage })));

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9FF]">
        <LoadingSpinner message="Authenticating CareNest secure session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9FF]">
          <LoadingSpinner message="Loading CareNest healthcare portal..." />
        </div>
      }
    >
      <Routes>
        {/* 1. Public CareNest Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Public Authentication Suite */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/join-profile" element={<JoinProfilePage />} />
        <Route path="/join" element={<Navigate to="/join-profile" replace />} />

        {/* 3. Protected Healthcare Application Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/medications" element={<MedicationsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/records" element={<HealthRecordsPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/activities" element={<CareActivitiesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ElderlyProfilePage />} />
          <Route path="/circle" element={<CareCirclePage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
        </Route>

        {/* 4. Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
