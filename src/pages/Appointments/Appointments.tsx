import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Event,
  Person,
  LocalHospital,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: 'Consultation' | 'Follow-up' | 'Emergency' | 'Surgery';
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes: string;
  phone: string;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      patientName: 'John Doe',
      doctorName: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      date: '2024-01-20',
      time: '09:00',
      type: 'Consultation',
      status: 'Scheduled',
      notes: 'Regular checkup',
      phone: '+1 234-567-8900',
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      doctorName: 'Dr. Michael Chen',
      department: 'Neurology',
      date: '2024-01-20',
      time: '10:30',
      type: 'Follow-up',
      status: 'Confirmed',
      notes: 'Post-surgery follow-up',
      phone: '+1 234-567-8901',
    },
    {
      id: '3',
      patientName: 'Mike Johnson',
      doctorName: 'Dr. Emily Davis',
      department: 'Pediatrics',
      date: '2024-01-21',
      time: '14:00',
      type: 'Emergency',
      status: 'Completed',
      notes: 'Emergency consultation',
      phone: '+1 234-567-8902',
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setViewMode(true);
    } else {
      setSelectedAppointment({
        id: '',
        patientName: '',
        doctorName: '',
        department: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        type: 'Consultation',
        status: 'Scheduled',
        notes: '',
        phone: '',
      });
      setViewMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
    setViewMode(false);
  };

  const handleSaveAppointment = () => {
    if (selectedAppointment) {
      if (viewMode) {
        setAppointments(appointments.map(a => a.id === selectedAppointment.id ? selectedAppointment : a));
        toast.success('Appointment updated successfully');
      } else {
        const newAppointment = { ...selectedAppointment, id: Date.now().toString() };
        setAppointments([...appointments, newAppointment]);
        toast.success('Appointment scheduled successfully');
      }
      handleCloseDialog();
    }
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
    toast.success('Appointment cancelled successfully');
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setAppointments(appointments.map(a => 
      a.id === id ? { ...a, status: newStatus as any } : a
    ));
    toast.success(`Appointment status updated to ${newStatus}`);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || appointment.status === statusFilter;
    const matchesType = typeFilter === 'All' || appointment.type === typeFilter;
    const matchesDate = !dateFilter || appointment.date === dateFilter;
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'primary';
      case 'Confirmed':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Consultation':
        return 'primary';
      case 'Follow-up':
        return 'secondary';
      case 'Emergency':
        return 'error';
      case 'Surgery':
        return 'warning';
      default:
        return 'default';
    }
  };

  const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Surgery', 'Emergency', 'Oncology'];
  const doctors = ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Davis', 'Dr. Robert Wilson'];

  const todayAppointments = filteredAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]);
  const upcomingAppointments = filteredAppointments.filter(a => a.date > new Date().toISOString().split('T')[0]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Appointments Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ fontWeight: 'bold' }}
        >
          Schedule Appointment
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Today's Appointments</Typography>
              <Typography variant="h4">{todayAppointments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Upcoming</Typography>
              <Typography variant="h4">{upcomingAppointments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Completed</Typography>
              <Typography variant="h4">
                {filteredAppointments.filter(a => a.status === 'Completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Pending</Typography>
              <Typography variant="h4">
                {filteredAppointments.filter(a => a.status === 'Scheduled').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Appointments" />
          <Tab label="Today" />
          <Tab label="Upcoming" />
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Consultation">Consultation</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Surgery">Surgery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Total: {filteredAppointments.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((appointment) => (
                  <TableRow key={appointment.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {appointment.patientName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {appointment.patientName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {appointment.doctorName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.department}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Event sx={{ fontSize: 16, mr: 0.5 }} />
                          {appointment.date}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                          {appointment.time}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.type}
                        color={getTypeColor(appointment.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(appointment)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(appointment)}
                        color="secondary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAppointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Appointment Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {viewMode ? 'View/Edit Appointment' : 'Schedule New Appointment'}
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient Name"
                  value={selectedAppointment.patientName}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, patientName: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedAppointment.phone}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, phone: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={selectedAppointment.doctorName}
                    label="Doctor"
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, doctorName: e.target.value })}
                    disabled={viewMode}
                  >
                    {doctors.map(doctor => (
                      <MenuItem key={doctor} value={doctor}>{doctor}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={selectedAppointment.department}
                    label="Department"
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, department: e.target.value })}
                    disabled={viewMode}
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={selectedAppointment.date}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, date: e.target.value })}
                  disabled={viewMode}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Time"
                  value={selectedAppointment.time}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, time: e.target.value })}
                  disabled={viewMode}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={selectedAppointment.type}
                    label="Type"
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, type: e.target.value as any })}
                    disabled={viewMode}
                  >
                    <MenuItem value="Consultation">Consultation</MenuItem>
                    <MenuItem value="Follow-up">Follow-up</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                    <MenuItem value="Surgery">Surgery</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedAppointment.status}
                    label="Status"
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, status: e.target.value as any })}
                    disabled={viewMode}
                  >
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={selectedAppointment.notes}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {!viewMode && (
            <Button onClick={handleSaveAppointment} variant="contained">
              Schedule Appointment
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;