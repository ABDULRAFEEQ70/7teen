import { Container, Box, Typography } from "@mui/material";
import PatientForm from "./components/PatientForm";
import LoginForm from "./components/LoginForm";
import AppointmentForm from "./components/AppointmentForm";
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
        path="/"
        element={
          <Protected>
            <Container maxWidth="sm">
              <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Patient Registration
                </Typography>
                <PatientForm />
              </Box>
            </Container>
          </Protected>
        }
      />
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
        path="/appointments"
        element={
          <Protected>
            <Container maxWidth="sm">
              <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Book Appointment
                </Typography>
                <AppointmentForm />
              </Box>
            </Container>
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