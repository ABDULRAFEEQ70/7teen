import { Container, Box, Typography } from "@mui/material";
import PatientForm from "./components/PatientForm";

function App() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Patient Registration
        </Typography>
        <PatientForm />
      </Box>
    </Container>
  );
}

export default App;