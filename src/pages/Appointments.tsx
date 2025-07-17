import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  User,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { mockAppointments, mockPatients, mockDoctors } from '../data/mockData'
import { Appointment } from '../types'
import { formatDate, getStatusColor, getStatusBadge } from '../utils'
import toast from 'react-hot-toast'

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Partial<Appointment>>({})

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    const matchesDate = !dateFilter || appointment.date === dateFilter
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'no_show':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const handleAddAppointment = () => {
    if (!editingAppointment.patientName || !editingAppointment.doctorName || !editingAppointment.date || !editingAppointment.time) {
      toast.error('Please fill in all required fields')
      return
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientId: '1', // This would be selected from a dropdown in a real app
      doctorId: '1', // This would be selected from a dropdown in a real app
      patientName: editingAppointment.patientName!,
      doctorName: editingAppointment.doctorName!,
      date: editingAppointment.date!,
      time: editingAppointment.time!,
      type: editingAppointment.type || 'consultation',
      status: 'scheduled',
      notes: editingAppointment.notes || '',
      symptoms: editingAppointment.symptoms || '',
      diagnosis: editingAppointment.diagnosis || '',
      prescription: editingAppointment.prescription || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setAppointments([...appointments, newAppointment])
    setShowAddModal(false)
    setEditingAppointment({})
    toast.success('Appointment scheduled successfully')
  }

  const handleEditAppointment = () => {
    if (!selectedAppointment || !editingAppointment.patientName || !editingAppointment.doctorName || !editingAppointment.date || !editingAppointment.time) {
      toast.error('Please fill in all required fields')
      return
    }

    const updatedAppointments = appointments.map(appointment =>
      appointment.id === selectedAppointment.id
        ? { ...appointment, ...editingAppointment, updatedAt: new Date().toISOString() }
        : appointment
    )

    setAppointments(updatedAppointments)
    setShowEditModal(false)
    setSelectedAppointment(null)
    setEditingAppointment({})
    toast.success('Appointment updated successfully')
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setAppointments(appointments.filter(appointment => appointment.id !== appointmentId))
      toast.success('Appointment deleted successfully')
    }
  }

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    const updatedAppointments = appointments.map(appointment =>
      appointment.id === appointmentId
        ? { ...appointment, status: newStatus as any, updatedAt: new Date().toISOString() }
        : appointment
    )
    setAppointments(updatedAppointments)
    toast.success('Appointment status updated')
  }

  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setEditingAppointment(appointment)
    setShowEditModal(true)
  }

  const openViewModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowViewModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="mt-1 text-sm text-gray-600">
            Schedule and manage patient appointments
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Filters</span>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Appointments ({filteredAppointments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient & Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">{appointment.doctorName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                    <div className="text-sm text-gray-500">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {appointment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(appointment.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openViewModal(appointment)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(appointment)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Appointment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient Name *</label>
                  <select
                    value={editingAppointment.patientName || ''}
                    onChange={(e) => setEditingAppointment({...editingAppointment, patientName: e.target.value})}
                    className="mt-1 input"
                  >
                    <option value="">Select Patient</option>
                    {mockPatients.map(patient => (
                      <option key={patient.id} value={patient.name}>{patient.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doctor Name *</label>
                  <select
                    value={editingAppointment.doctorName || ''}
                    onChange={(e) => setEditingAppointment({...editingAppointment, doctorName: e.target.value})}
                    className="mt-1 input"
                  >
                    <option value="">Select Doctor</option>
                    {mockDoctors.map(doctor => (
                      <option key={doctor.id} value={doctor.name}>{doctor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date *</label>
                  <input
                    type="date"
                    value={editingAppointment.date || ''}
                    onChange={(e) => setEditingAppointment({...editingAppointment, date: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time *</label>
                  <input
                    type="time"
                    value={editingAppointment.time || ''}
                    onChange={(e) => setEditingAppointment({...editingAppointment, time: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={editingAppointment.type || 'consultation'}
                    onChange={(e) => setEditingAppointment({...editingAppointment, type: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="emergency">Emergency</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={editingAppointment.notes || ''}
                    onChange={(e) => setEditingAppointment({...editingAppointment, notes: e.target.value})}
                    className="mt-1 input"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingAppointment({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAppointment}
                  className="btn btn-primary btn-md"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Appointment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editingAppointment.status || 'scheduled'}
                    onChange={(e) => setEditingAppointment({...editingAppointment, status: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={editingAppointment.notes || ''}
                    onChange={(e) => setEditingAppointment({...editingAppointment, notes: e.target.value})}
                    className="mt-1 input"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                  <textarea
                    value={editingAppointment.diagnosis || ''}
                    onChange={(e) => setEditingAppointment({...editingAppointment, diagnosis: e.target.value})}
                    className="mt-1 input"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prescription</label>
                  <textarea
                    value={editingAppointment.prescription || ''}
                    onChange={(e) => setEditingAppointment({...editingAppointment, prescription: e.target.value})}
                    className="mt-1 input"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedAppointment(null)
                    setEditingAppointment({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditAppointment}
                  className="btn btn-primary btn-md"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Patient:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedAppointment.patientName}</span>
                </div>
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Doctor:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedAppointment.doctorName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Date:</span>
                  <span className="ml-2 text-sm text-gray-900">{formatDate(selectedAppointment.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Time:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedAppointment.time}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-sm text-gray-900 capitalize">{selectedAppointment.type}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Notes:</span>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedAppointment(null)
                  }}
                  className="btn btn-primary btn-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}