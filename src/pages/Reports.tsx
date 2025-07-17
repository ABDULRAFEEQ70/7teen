import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Package,
  Download,
  Filter
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { mockDashboardStats, mockPatients, mockDoctors, mockAppointments, mockBills } from '../data/mockData'
import { formatCurrency } from '../utils'

const monthlyRevenue = [
  { month: 'Jan', revenue: 45000, patients: 120 },
  { month: 'Feb', revenue: 52000, patients: 135 },
  { month: 'Mar', revenue: 48000, patients: 110 },
  { month: 'Apr', revenue: 55000, patients: 145 },
  { month: 'May', revenue: 62000, patients: 160 },
  { month: 'Jun', revenue: 68000, patients: 175 },
]

const departmentStats = [
  { name: 'Cardiology', patients: 25, revenue: 15000 },
  { name: 'Neurology', patients: 20, revenue: 12000 },
  { name: 'Pediatrics', patients: 30, revenue: 18000 },
  { name: 'Emergency', patients: 15, revenue: 9000 },
  { name: 'Surgery', patients: 10, revenue: 6000 },
]

const appointmentTypes = [
  { name: 'Consultation', value: 45, color: '#3B82F6' },
  { name: 'Follow Up', value: 25, color: '#10B981' },
  { name: 'Emergency', value: 15, color: '#EF4444' },
  { name: 'Routine', value: 15, color: '#F59E0B' },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Reports() {
  const [timeRange, setTimeRange] = useState('month')
  const [reportType, setReportType] = useState('overview')

  const stats = [
    {
      name: 'Total Patients',
      value: mockDashboardStats.totalPatients.toLocaleString(),
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(mockDashboardStats.totalRevenue),
      change: '+15%',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      name: 'Total Appointments',
      value: mockDashboardStats.totalAppointments,
      change: '+8%',
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      name: 'Low Stock Items',
      value: mockDashboardStats.lowStockItems,
      change: '+1',
      icon: Package,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive hospital analytics and insights
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
            <option value="year">Last year</option>
          </select>
          <button className="btn btn-outline btn-md">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
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
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        <span className="sr-only">Increased by</span>
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
        {/* Revenue & Patients Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Revenue & Patients Trend</h3>
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Revenue ($)" />
              <Area yAxisId="right" type="monotone" dataKey="patients" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Patients" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Performance */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Department Performance</h3>
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentStats}>
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
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Types Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Appointment Types</h3>
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={appointmentTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {appointmentTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Monthly Revenue Trend</h3>
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Detailed Reports</h3>
            <div className="flex space-x-2">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="overview">Overview</option>
                <option value="patients">Patient Reports</option>
                <option value="financial">Financial Reports</option>
                <option value="inventory">Inventory Reports</option>
              </select>
              <button className="btn btn-primary btn-sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{mockPatients.length}</div>
              <div className="text-sm text-gray-500">Total Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{mockDoctors.length}</div>
              <div className="text-sm text-gray-500">Total Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{mockAppointments.length}</div>
              <div className="text-sm text-gray-500">Total Appointments</div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Recent Activity</h4>
            <div className="space-y-3">
              {mockAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                    <div className="text-sm text-gray-500">{appointment.doctorName} - {appointment.type}</div>
                  </div>
                  <div className="text-sm text-gray-500">{appointment.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}