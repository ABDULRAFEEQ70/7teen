import { useState } from "react";
import {
  TextField,
  Button,
  Stack,
  MenuItem,
  Alert,
} from "@mui/material";
import axios from "axios";

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
}

const initialData: PatientFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
};

function PatientForm() {
  const [formData, setFormData] = useState<PatientFormData>(initialData);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/patients", formData);
      setSuccess(true);
      setError("");
      setFormData(initialData);
    } catch (err) {
      console.error(err);
      setError("Failed to submit");
      setSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {success && <Alert severity="success">Patient registered!</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          select
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          fullWidth
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>
        <TextField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          multiline
          rows={2}
          fullWidth
        />
        <Button type="submit" variant="contained">
          Register Patient
        </Button>
      </Stack>
    </form>
  );
}

export default PatientForm;