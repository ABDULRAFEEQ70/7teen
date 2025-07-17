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
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TextField as MuiTextField } from "@mui/material";

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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("doctor");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchStaff = async () => {
    try {
      const { data, headers } = await axios.get("http://localhost:4000/api/staff", {
        params: { page: page + 1, limit: pageSize, q: search },
      });
      setStaffList(data);
      setTotal(Number(headers["x-total-count"] || data.length));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search]);

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

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      valueGetter: (p) => `${p.row.first_name} ${p.row.last_name}`,
    },
    { field: "role", headerName: "Role", width: 120 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "email", headerName: "Email", flex: 1 },
  ];

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

      <Typography variant="h6" sx={{ mt: 4, mb:1 }}>
        Staff List
      </Typography>
      <MuiTextField
        size="small"
        placeholder="Search…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        sx={{ mb: 1 }}
      />
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={staffList}
          columns={columns}
          pagination
          paginationMode="server"
          rowCount={total}
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
}