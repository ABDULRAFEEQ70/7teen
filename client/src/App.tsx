import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/patients/Patients';
import PatientDetails from './pages/patients/PatientDetails';
import Doctors from './pages/doctors/Doctors';
import Appointments from './pages/appointments/Appointments';
import MedicalRecords from './pages/medical-records/MedicalRecords';
import Inventory from './pages/inventory/Inventory';
import Billing from './pages/billing/Billing';
import Settings from './pages/Settings';
import LoadingSpinner from './components/ui/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
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
        
        {/* Patient Routes */}
        <Route
          path="patients"
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="patients/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist', 'patient']}>
              <PatientDetails />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route path="doctors" element={<Doctors />} />

        {/* Appointment Routes */}
        <Route path="appointments" element={<Appointments />} />

        {/* Medical Records Routes */}
        <Route
          path="medical-records"
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
              <MedicalRecords />
            </ProtectedRoute>
          }
        />

        {/* Inventory Routes */}
        <Route
          path="inventory"
          element={
            <ProtectedRoute allowedRoles={['admin', 'nurse']}>
              <Inventory />
            </ProtectedRoute>
          }
        />

        {/* Billing Routes */}
        <Route
          path="billing"
          element={
            <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
              <Billing />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#059669',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#DC2626',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
