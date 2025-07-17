import { Container, Box, Typography } from "@mui/material";
import PatientForm from "./components/PatientForm";
import LoginForm from "./components/LoginForm";
import AppointmentForm from "./components/AppointmentForm";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import StaffPage from "./pages/StaffPage";
import RecordsPage from "./pages/RecordsPage";
import BillingPage from "./pages/BillingPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

function Protected({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Login
              </Typography>
              <LoginForm />
            </Box>
          </Container>
        }
      />

      <Route
        path="/"
        element={
          <Protected>
            <Layout>
              <Dashboard />
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/patients"
        element={
          <Protected>
            <Layout>
              <Container maxWidth="sm">
                <Box sx={{ my: 2 }}>
                  <Typography variant="h4" gutterBottom>
                    Patient Registration
                  </Typography>
                  <PatientForm />
                </Box>
              </Container>
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/appointments"
        element={
          <Protected>
            <Layout>
              <Container maxWidth="sm">
                <Box sx={{ my: 2 }}>
                  <Typography variant="h4" gutterBottom>
                    Book Appointment
                  </Typography>
                  <AppointmentForm />
                </Box>
              </Container>
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/staff"
        element={
          <Protected>
            <Layout>
              <StaffPage />
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/records"
        element={
          <Protected>
            <Layout>
              <RecordsPage />
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/billing"
        element={
          <Protected>
            <Layout>
              <BillingPage />
            </Layout>
          </Protected>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;