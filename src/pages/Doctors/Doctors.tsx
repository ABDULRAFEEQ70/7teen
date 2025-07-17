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
  Rating,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  LocalHospital,
  Phone,
  Email,
  Schedule,
  Star,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
  experience: number;
  rating: number;
  status: 'Active' | 'Inactive' | 'On Leave';
  schedule: string;
  patientsCount: number;
}

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiologist',
      department: 'Cardiology',
      phone: '+1 234-567-8900',
      email: 'sarah.johnson@hospital.com',
      experience: 15,
      rating: 4.8,
      status: 'Active',
      schedule: 'Mon-Fri 9AM-5PM',
      patientsCount: 45,
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialization: 'Neurologist',
      department: 'Neurology',
      phone: '+1 234-567-8901',
      email: 'michael.chen@hospital.com',
      experience: 12,
      rating: 4.9,
      status: 'Active',
      schedule: 'Mon-Fri 8AM-4PM',
      patientsCount: 38,
    },
    {
      id: '3',
      name: 'Dr. Emily Davis',
      specialization: 'Pediatrician',
      department: 'Pediatrics',
      phone: '+1 234-567-8902',
      email: 'emily.davis@hospital.com',
      experience: 8,
      rating: 4.7,
      status: 'On Leave',
      schedule: 'Mon-Fri 10AM-6PM',
      patientsCount: 52,
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [viewMode, setViewMode] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (doctor?: Doctor) => {
    if (doctor) {
      setSelectedDoctor(doctor);
      setViewMode(true);
    } else {
      setSelectedDoctor({
        id: '',
        name: '',
        specialization: '',
        department: '',
        phone: '',
        email: '',
        experience: 0,
        rating: 0,
        status: 'Active',
        schedule: '',
        patientsCount: 0,
      });
      setViewMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDoctor(null);
    setViewMode(false);
  };

  const handleSaveDoctor = () => {
    if (selectedDoctor) {
      if (viewMode) {
        setDoctors(doctors.map(d => d.id === selectedDoctor.id ? selectedDoctor : d));
        toast.success('Doctor updated successfully');
      } else {
        const newDoctor = { ...selectedDoctor, id: Date.now().toString() };
        setDoctors([...doctors, newDoctor]);
        toast.success('Doctor added successfully');
      }
      handleCloseDialog();
    }
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctors(doctors.filter(d => d.id !== id));
    toast.success('Doctor deleted successfully');
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || doctor.status === statusFilter;
    const matchesDepartment = departmentFilter === 'All' || doctor.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warning';
      case 'On Leave':
        return 'error';
      default:
        return 'default';
    }
  };

  const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Surgery', 'Emergency', 'Oncology'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Doctors Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ fontWeight: 'bold' }}
        >
          Add Doctor
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  label="Department"
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                Total: {filteredDoctors.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDoctors
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((doctor) => (
                  <TableRow key={doctor.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {doctor.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {doctor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doctor.department}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={doctor.specialization} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                          {doctor.phone}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Email sx={{ fontSize: 16, mr: 0.5 }} />
                          {doctor.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{doctor.experience} years</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={doctor.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          ({doctor.rating})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doctor.status}
                        color={getStatusColor(doctor.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                        {doctor.schedule}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(doctor)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(doctor)}
                        color="secondary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDoctor(doctor.id)}
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
          count={filteredDoctors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Doctor Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {viewMode ? 'View/Edit Doctor' : 'Add New Doctor'}
        </DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={selectedDoctor.name}
                  onChange={(e) => setSelectedDoctor({ ...selectedDoctor, name: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specialization"
                  value={selectedDoctor.specialization}
                  onChange={(e) => setSelectedDoctor({ ...selectedDoctor, specialization: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={selectedDoctor.department}
                    label="Department"
                    onChange={(e) => setSelectedDoctor({ ...selectedDoctor, department: e.target.value })}
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
                  label="Experience (years)"
                  type="number"
                  value={selectedDoctor.experience}
                  onChange={(e) => setSelectedDoctor({ ...selectedDoctor, experience: parseInt(e.target.value) })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedDoctor.phone}
                  onChange={(e) => setSelectedDoctor({ ...selectedDoctor, phone: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedDoctor.email}
                  onChange={(e) => setSelectedDoctor({ ...selectedDoctor, email: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Schedule"
                  value={selectedDoctor.schedule}
                  onChange={(e) => setSelectedDoctor({ ...selectedDoctor, schedule: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedDoctor.status}
                    label="Status"
                    onChange={(e) => setSelectedDoctor({ ...selectedDoctor, status: e.target.value as any })}
                    disabled={viewMode}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="On Leave">On Leave</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {!viewMode && (
            <Button onClick={handleSaveDoctor} variant="contained">
              Save Doctor
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Doctors;