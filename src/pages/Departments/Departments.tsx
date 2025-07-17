import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People,
  LocalHospital,
  Business,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  description: string;
  head: string;
  phone: string;
  email: string;
  location: string;
  staffCount: number;
  patientCount: number;
  status: 'Active' | 'Inactive';
  specialties: string[];
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: '1',
      name: 'Cardiology',
      description: 'Specialized in heart and cardiovascular system treatment',
      head: 'Dr. Sarah Johnson',
      phone: '+1 234-567-8900',
      email: 'cardiology@hospital.com',
      location: 'Floor 2, Wing A',
      staffCount: 15,
      patientCount: 45,
      status: 'Active',
      specialties: ['Cardiac Surgery', 'Interventional Cardiology', 'Electrophysiology'],
    },
    {
      id: '2',
      name: 'Neurology',
      description: 'Treatment of disorders of the nervous system',
      head: 'Dr. Michael Chen',
      phone: '+1 234-567-8901',
      email: 'neurology@hospital.com',
      location: 'Floor 3, Wing B',
      staffCount: 12,
      patientCount: 38,
      status: 'Active',
      specialties: ['Stroke Treatment', 'Epilepsy', 'Movement Disorders'],
    },
    {
      id: '3',
      name: 'Pediatrics',
      description: 'Medical care for infants, children, and adolescents',
      head: 'Dr. Emily Davis',
      phone: '+1 234-567-8902',
      email: 'pediatrics@hospital.com',
      location: 'Floor 1, Wing C',
      staffCount: 18,
      patientCount: 52,
      status: 'Active',
      specialties: ['General Pediatrics', 'Neonatology', 'Pediatric Surgery'],
    },
    {
      id: '4',
      name: 'Emergency Medicine',
      description: 'Emergency medical care and trauma treatment',
      head: 'Dr. Robert Wilson',
      phone: '+1 234-567-8903',
      email: 'emergency@hospital.com',
      location: 'Ground Floor, Emergency Wing',
      staffCount: 25,
      patientCount: 120,
      status: 'Active',
      specialties: ['Trauma Care', 'Critical Care', 'Emergency Surgery'],
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [viewMode, setViewMode] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setSelectedDepartment(department);
      setViewMode(true);
    } else {
      setSelectedDepartment({
        id: '',
        name: '',
        description: '',
        head: '',
        phone: '',
        email: '',
        location: '',
        staffCount: 0,
        patientCount: 0,
        status: 'Active',
        specialties: [],
      });
      setViewMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDepartment(null);
    setViewMode(false);
  };

  const handleSaveDepartment = () => {
    if (selectedDepartment) {
      if (viewMode) {
        setDepartments(departments.map(d => d.id === selectedDepartment.id ? selectedDepartment : d));
        toast.success('Department updated successfully');
      } else {
        const newDepartment = { ...selectedDepartment, id: Date.now().toString() };
        setDepartments([...departments, newDepartment]);
        toast.success('Department added successfully');
      }
      handleCloseDialog();
    }
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    toast.success('Department deleted successfully');
  };

  const totalStaff = departments.reduce((sum, dept) => sum + dept.staffCount, 0);
  const totalPatients = departments.reduce((sum, dept) => sum + dept.patientCount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Departments Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ fontWeight: 'bold' }}
        >
          Add Department
        </Button>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Departments</Typography>
              <Typography variant="h4">{departments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Staff</Typography>
              <Typography variant="h4">{totalStaff}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Patients</Typography>
              <Typography variant="h4">{totalPatients}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Active Departments</Typography>
              <Typography variant="h4">
                {departments.filter(d => d.status === 'Active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Departments Grid */}
      <Grid container spacing={3}>
        {departments.map((department) => (
          <Grid item xs={12} md={6} lg={4} key={department.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <Business />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {department.name}
                    </Typography>
                    <Chip
                      label={department.status}
                      color={department.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {department.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <LocalHospital sx={{ fontSize: 16, mr: 0.5 }} />
                    <strong>Head:</strong> {department.head}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                    {department.phone}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Email sx={{ fontSize: 16, mr: 0.5 }} />
                    {department.email}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                    {department.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {department.staffCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Staff
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="secondary">
                      {department.patientCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patients
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Specialties:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {department.specialties.map((specialty, index) => (
                      <Chip
                        key={index}
                        label={specialty}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(department)}
                  color="primary"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteDepartment(department.id)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Department Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {viewMode ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
        <DialogContent>
          {selectedDepartment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department Name"
                  value={selectedDepartment.name}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, name: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department Head"
                  value={selectedDepartment.head}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, head: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={selectedDepartment.description}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, description: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedDepartment.phone}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, phone: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedDepartment.email}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, email: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={selectedDepartment.location}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, location: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Staff Count"
                  type="number"
                  value={selectedDepartment.staffCount}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, staffCount: parseInt(e.target.value) })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient Count"
                  type="number"
                  value={selectedDepartment.patientCount}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, patientCount: parseInt(e.target.value) })}
                  disabled={viewMode}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {!viewMode && (
            <Button onClick={handleSaveDepartment} variant="contained">
              Save Department
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Departments;