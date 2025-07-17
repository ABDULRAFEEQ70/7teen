import { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import axios from "axios";

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  email: string;
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("doctor");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchStaff = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/staff");
      setStaffList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/staff", {
        firstName,
        lastName,
        role,
        phone,
        email,
      });
      setSuccess(true);
      setError("");
      setFirstName("");
      setLastName("");
      setRole("doctor");
      setPhone("");
      setEmail("");
      fetchStaff();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to add staff");
      setSuccess(false);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Staff Management
      </Typography>
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2} maxWidth={400}>
          {success && <Alert severity="success">Staff added</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            fullWidth
          >
            <MenuItem value="doctor">Doctor</MenuItem>
            <MenuItem value="nurse">Nurse</MenuItem>
            <MenuItem value="lab">Lab Tech</MenuItem>
          </TextField>
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained">
            Add Staff
          </Button>
        </Stack>
      </form>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Staff List
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {staffList.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                {s.first_name} {s.last_name}
              </TableCell>
              <TableCell>{s.role}</TableCell>
              <TableCell>{s.phone}</TableCell>
              <TableCell>{s.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}