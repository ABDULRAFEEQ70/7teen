import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People,
  LocalHospital,
  Event,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Person,
  Schedule,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Mock data for charts
  const patientData = [
    { name: 'Jan', patients: 120, appointments: 180 },
    { name: 'Feb', patients: 140, appointments: 200 },
    { name: 'Mar', patients: 160, appointments: 220 },
    { name: 'Apr', patients: 180, appointments: 240 },
    { name: 'May', patients: 200, appointments: 260 },
    { name: 'Jun', patients: 220, appointments: 280 },
  ];

  const departmentData = [
    { name: 'Cardiology', value: 25, color: '#8884d8' },
    { name: 'Emergency', value: 20, color: '#82ca9d' },
    { name: 'Pediatrics', value: 18, color: '#ffc658' },
    { name: 'Surgery', value: 15, color: '#ff7300' },
    { name: 'Neurology', value: 12, color: '#00C49F' },
    { name: 'Others', value: 10, color: '#FFBB28' },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      message: 'New appointment scheduled with Dr. Johnson',
      time: '2 minutes ago',
      status: 'scheduled',
    },
    {
      id: 2,
      type: 'patient',
      message: 'Patient John Doe admitted to Emergency',
      time: '15 minutes ago',
      status: 'admitted',
    },
    {
      id: 3,
      type: 'doctor',
      message: 'Dr. Smith completed surgery successfully',
      time: '1 hour ago',
      status: 'completed',
    },
    {
      id: 4,
      type: 'billing',
      message: 'Payment received for patient ID #12345',
      time: '2 hours ago',
      status: 'paid',
    },
  ];

  const statsCards = [
    {
      title: 'Total Patients',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: <People />,
      color: '#1976d2',
    },
    {
      title: 'Active Doctors',
      value: '45',
      change: '+5%',
      trend: 'up',
      icon: <LocalHospital />,
      color: '#2e7d32',
    },
    {
      title: 'Today\'s Appointments',
      value: '89',
      change: '-3%',
      trend: 'down',
      icon: <Event />,
      color: '#ed6c02',
    },
    {
      title: 'Monthly Revenue',
      value: '$125K',
      change: '+18%',
      trend: 'up',
      icon: <AttachMoney />,
      color: '#9c27b0',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'admitted':
        return 'warning';
      case 'completed':
        return 'success';
      case 'paid':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Schedule />;
      case 'admitted':
        return <Person />;
      case 'completed':
        return <CheckCircle />;
      case 'paid':
        return <AttachMoney />;
      default:
        return <Warning />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Dashboard Overview
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${card.color}15, ${card.color}05)`,
                border: `1px solid ${card.color}20`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: `${card.color}20`,
                      color: card.color,
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {card.trend === 'up' ? (
                    <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                  ) : (
                    <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                  )}
                  <Typography
                    variant="body2"
                    color={card.trend === 'up' ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 'medium' }}
                  >
                    {card.change} from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts and Activities */}
      <Grid container spacing={3}>
        {/* Patient Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Patient & Appointment Trends
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="#1976d2"
                  strokeWidth={3}
                  name="Patients"
                />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#2e7d32"
                  strokeWidth={3}
                  name="Appointments"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Department Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${theme.palette[getStatusColor(activity.status)].main}20` }}>
                      {getStatusIcon(activity.status)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.message}
                    secondary={activity.time}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Chip
                    label={activity.status}
                    color={getStatusColor(activity.status) as any}
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;