import {
  Typography,
  Stack,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface RecordRow {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  staff_first_name: string;
  staff_last_name: string;
  description: string;
  created_at: string;
}

interface Option {
  id: number;
  label: string;
}

interface FormData {
  patientId: number;
  staffId: number;
  description: string;
}

const schema = yup.object({
  patientId: yup.number().required(),
  staffId: yup.number().required(),
  description: yup.string().min(5).required(),
});

export default function RecordsPage() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Option[]>([]);
  const [staff, setStaff] = useState<Option[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { patientId: 0, staffId: 0, description: "" },
    resolver: yupResolver(schema),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, headers } = await axios.get("http://localhost:4000/api/records", {
        params: { page: page + 1, limit: pageSize, q: search },
      });
      setRows(data);
      setTotal(Number(headers["x-total-count"] || data.length));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search]);

  const loadSelects = async () => {
    const [pRes, sRes] = await Promise.all([
      axios.get("http://localhost:4000/api/patients", { params: { limit: 1000 } }),
      axios.get("http://localhost:4000/api/staff", { params: { limit: 1000 } }),
    ]);
    setPatients(
      pRes.data.map((p: any) => ({ id: p.id, label: `${p.first_name} ${p.last_name}` }))
    );
    setStaff(
      sRes.data.map((s: any) => ({ id: s.id, label: `${s.first_name} ${s.last_name}` }))
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      await axios.post("http://localhost:4000/api/records", data);
      setSuccess("Record added");
      setError("");
      setOpen(false);
      reset();
      fetchData();
    } catch (e: any) {
      if (e.response?.data?.errors) {
        setError(e.response.data.errors.map((er: any) => er.msg).join(", "));
      } else {
        setError("Failed");
      }
      setSuccess("");
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "patient",
      headerName: "Patient",
      flex: 1,
      valueGetter: (p) => `${p.row.patient_first_name} ${p.row.patient_last_name}`,
    },
    {
      field: "staff",
      headerName: "Staff",
      flex: 1,
      valueGetter: (p) => `${p.row.staff_first_name} ${p.row.staff_last_name}`,
    },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "created_at", headerName: "Date", width: 150 },
  ];

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Medical Records
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => { loadSelects(); setOpen(true); }}>
        Add Record
      </Button>

      {loading ? (
        <CircularProgress />
      ) : (
        <div style={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            paginationMode="server"
            rowCount={total}
            page={page}
            pageSize={pageSize}
            onPageChange={(n) => setPage(n)}
            onPageSizeChange={(n) => { setPageSize(n); setPage(0); }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Medical Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Controller
              name="patientId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Patient"
                  error={!!errors.patientId}
                  helperText={errors.patientId?.message}
                  fullWidth
                >
                  {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="staffId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Staff"
                  error={!!errors.staffId}
                  helperText={errors.staffId?.message}
                  fullWidth
                >
                  {staff.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  fullWidth
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}