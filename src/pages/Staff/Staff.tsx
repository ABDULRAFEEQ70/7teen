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
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Person,
  Phone,
  Email,
  Work,
  Schedule,
  Badge,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface Staff {
  id: string;
  name: string;
  role: 'Nurse' | 'Receptionist' | 'Technician' | 'Administrator' | 'Pharmacist' | 'Lab Technician';
  department: string;
  phone: string;
  email: string;
  hireDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  shift: 'Morning' | 'Afternoon' | 'Night' | 'Flexible';
  salary: number;
}

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([
    {
      id: '1',
      name: 'Emily Davis',
      role: 'Nurse',
      department: 'Emergency',
      phone: '+1 234-567-8900',
      email: 'emily.davis@hospital.com',
      hireDate: '2020-03-15',
      status: 'Active',
      shift: 'Morning',
      salary: 45000,
    },
    {
      id: '2',
      name: 'John Wilson',
      role: 'Receptionist',
      department: 'Administration',
      phone: '+1 234-567-8901',
      email: 'john.wilson@hospital.com',
      hireDate: '2019-08-20',
      status: 'Active',
      shift: 'Morning',
      salary: 35000,
    },
    {
      id: '3',
      name: 'Sarah Brown',
      role: 'Technician',
      department: 'Radiology',
      phone: '+1 234-567-8902',
      email: 'sarah.brown@hospital.com',
      hireDate: '2021-01-10',
      status: 'Active',
      shift: 'Afternoon',
      salary: 42000,
    },
    {
      id: '4',
      name: 'Michael Lee',
      role: 'Pharmacist',
      department: 'Pharmacy',
      phone: '+1 234-567-8903',
      email: 'michael.lee@hospital.com',
      hireDate: '2018-11-05',
      status: 'Active',
      shift: 'Flexible',
      salary: 55000,
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
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

  const handleOpenDialog = (staffMember?: Staff) => {
    if (staffMember) {
      setSelectedStaff(staffMember);
      setViewMode(true);
    } else {
      setSelectedStaff({
        id: '',
        name: '',
        role: 'Nurse',
        department: '',
        phone: '',
        email: '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        shift: 'Morning',
        salary: 0,
      });
      setViewMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
    setViewMode(false);
  };

  const handleSaveStaff = () => {
    if (selectedStaff) {
      if (viewMode) {
        setStaff(staff.map(s => s.id === selectedStaff.id ? selectedStaff : s));
        toast.success('Staff member updated successfully');
      } else {
        const newStaff = { ...selectedStaff, id: Date.now().toString() };
        setStaff([...staff, newStaff]);
        toast.success('Staff member added successfully');
      }
      handleCloseDialog();
    }
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
    toast.success('Staff member removed successfully');
  };

  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'All' || staffMember.role === roleFilter;
    const matchesDepartment = departmentFilter === 'All' || staffMember.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || staffMember.status === statusFilter;
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Nurse':
        return 'primary';
      case 'Receptionist':
        return 'secondary';
      case 'Technician':
        return 'info';
      case 'Administrator':
        return 'warning';
      case 'Pharmacist':
        return 'success';
      case 'Lab Technician':
        return 'error';
      default:
        return 'default';
    }
  };

  const roles = ['Nurse', 'Receptionist', 'Technician', 'Administrator', 'Pharmacist', 'Lab Technician'];
  const departments = ['Emergency', 'Administration', 'Radiology', 'Pharmacy', 'Laboratory', 'Cardiology', 'Neurology', 'Pediatrics'];
  const shifts = ['Morning', 'Afternoon', 'Night', 'Flexible'];

  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'Active').length;
  const totalSalary = staff.reduce((sum, s) => sum + s.salary, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Staff Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ fontWeight: 'bold' }}
        >
          Add Staff Member
        </Button>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Staff</Typography>
              <Typography variant="h4">{totalStaff}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Active Staff</Typography>
              <Typography variant="h4">{activeStaff}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Departments</Typography>
              <Typography variant="h4">{departments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Salary</Typography>
              <Typography variant="h4">${(totalSalary / 1000).toFixed(0)}K</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  {roles.map(role => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
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
              <Typography variant="body2" color="text.secondary">
                Total: {filteredStaff.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Staff Member</TableCell>
                <TableCell>Role & Department</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Hire Date</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((staffMember) => (
                  <TableRow key={staffMember.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {staffMember.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {staffMember.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${staffMember.salary.toLocaleString()}/year
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={staffMember.role}
                          color={getRoleColor(staffMember.role) as any}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {staffMember.department}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                          {staffMember.phone}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Email sx={{ fontSize: 16, mr: 0.5 }} />
                          {staffMember.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{staffMember.hireDate}</TableCell>
                    <TableCell>
                      <Chip label={staffMember.shift} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={staffMember.status}
                        color={getStatusColor(staffMember.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(staffMember)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(staffMember)}
                        color="secondary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteStaff(staffMember.id)}
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
          count={filteredStaff.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Staff Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {viewMode ? 'View/Edit Staff Member' : 'Add New Staff Member'}
        </DialogTitle>
        <DialogContent>
          {selectedStaff && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={selectedStaff.name}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, name: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedStaff.role}
                    label="Role"
                    onChange={(e) => setSelectedStaff({ ...selectedStaff, role: e.target.value as any })}
                    disabled={viewMode}
                  >
                    {roles.map(role => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={selectedStaff.department}
                    label="Department"
                    onChange={(e) => setSelectedStaff({ ...selectedStaff, department: e.target.value })}
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
                  label="Phone"
                  value={selectedStaff.phone}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, phone: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedStaff.email}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, email: e.target.value })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Hire Date"
                  value={selectedStaff.hireDate}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, hireDate: e.target.value })}
                  disabled={viewMode}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Shift</InputLabel>
                  <Select
                    value={selectedStaff.shift}
                    label="Shift"
                    onChange={(e) => setSelectedStaff({ ...selectedStaff, shift: e.target.value as any })}
                    disabled={viewMode}
                  >
                    {shifts.map(shift => (
                      <MenuItem key={shift} value={shift}>{shift}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary"
                  type="number"
                  value={selectedStaff.salary}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, salary: parseInt(e.target.value) })}
                  disabled={viewMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStaff.status}
                    label="Status"
                    onChange={(e) => setSelectedStaff({ ...selectedStaff, status: e.target.value as any })}
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
            <Button onClick={handleSaveStaff} variant="contained">
              Save Staff Member
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;