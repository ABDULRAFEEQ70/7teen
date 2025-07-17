import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Stack,
  Alert,
  MenuItem,
} from "@mui/material";
import axios from "axios";

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
}

function AppointmentForm() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState<number | "">("");
  const [doctorName, setDoctorName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/patients");
        setPatients(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/appointments", {
        patientId,
        doctorName,
        appointmentDate,
        reason,
      });
      setSuccess(true);
      setError("");
      setPatientId("");
      setDoctorName("");
      setAppointmentDate("");
      setReason("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create appointment");
      setSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {success && <Alert severity="success">Appointment booked!</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          select
          label="Patient"
          value={patientId}
          onChange={(e) => setPatientId(Number(e.target.value))}
          required
          fullWidth
        >
          {patients.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.first_name} {p.last_name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Doctor Name"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Appointment Date"
          type="datetime-local"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
        />
        <TextField
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          multiline
          rows={2}
          fullWidth
        />
        <Button type="submit" variant="contained">
          Book Appointment
        </Button>
      </Stack>
    </form>
  );
}

export default AppointmentForm;