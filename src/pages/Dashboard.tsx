import { useState } from 'react'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  Clock, 
  Bed, 
  Package, 
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { mockDashboardStats, mockAppointments, mockPatients, mockDoctors } from '../data/mockData'
import { formatCurrency, formatDate } from '../utils'

const monthlyData = [
  { name: 'Jan', patients: 120, revenue: 45000 },
  { name: 'Feb', patients: 135, revenue: 52000 },
  { name: 'Mar', patients: 110, revenue: 48000 },
  { name: 'Apr', patients: 145, revenue: 55000 },
  { name: 'May', patients: 160, revenue: 62000 },
  { name: 'Jun', patients: 175, revenue: 68000 },
]

const departmentData = [
  { name: 'Cardiology', value: 25, color: '#3B82F6' },
  { name: 'Neurology', value: 20, color: '#10B981' },
  { name: 'Pediatrics', value: 30, color: '#F59E0B' },
  { name: 'Emergency', value: 15, color: '#EF4444' },
  { name: 'Surgery', value: 10, color: '#8B5CF6' },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('month')

  const stats = [
    {
      name: 'Total Patients',
      value: mockDashboardStats.totalPatients.toLocaleString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Doctors',
      value: mockDashboardStats.totalDoctors,
      change: '+5%',
      changeType: 'increase' as const,
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      name: 'Total Appointments',
      value: mockDashboardStats.totalAppointments,
      change: '+8%',
      changeType: 'increase' as const,
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(mockDashboardStats.totalRevenue),
      change: '+15%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      name: 'Pending Appointments',
      value: mockDashboardStats.pendingAppointments,
      change: '-3%',
      changeType: 'decrease' as const,
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      name: 'Available Beds',
      value: mockDashboardStats.availableBeds,
      change: '+2',
      changeType: 'increase' as const,
      icon: Bed,
      color: 'bg-indigo-500'
    },
    {
      name: 'Low Stock Items',
      value: mockDashboardStats.lowStockItems,
      change: '+1',
      changeType: 'increase' as const,
      icon: Package,
      color: 'bg-red-500'
    },
    {
      name: 'Today Appointments',
      value: mockDashboardStats.todayAppointments,
      change: '+2',
      changeType: 'increase' as const,
      icon: Activity,
      color: 'bg-teal-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back! Here's what's happening with your hospital today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
            <option value="year">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                        )}
                        <span className="sr-only">{stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Patients Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue & Patients Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="patients" fill="#3B82F6" name="Patients" />
              <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Appointments</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mockAppointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500">{appointment.doctorName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.date}</p>
                    <p className="text-sm text-gray-500">{appointment.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Patients</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mockPatients.slice(0, 5).map((patient) => (
              <div key={patient.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}