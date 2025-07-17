import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Phone,
  Mail,
  Calendar,
  MapPin,
  Award,
  Clock
} from 'lucide-react'
import { mockDoctors } from '../data/mockData'
import { Doctor } from '../types'
import { getStatusColor, getInitials } from '../utils'
import toast from 'react-hot-toast'

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [editingDoctor, setEditingDoctor] = useState<Partial<Doctor>>({})

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || doctor.department === departmentFilter
    const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const departments = Array.from(new Set(doctors.map(doctor => doctor.department)))

  const handleAddDoctor = () => {
    if (!editingDoctor.name || !editingDoctor.email || !editingDoctor.specialization) {
      toast.error('Please fill in all required fields')
      return
    }

    const newDoctor: Doctor = {
      id: Date.now().toString(),
      name: editingDoctor.name!,
      email: editingDoctor.email!,
      phone: editingDoctor.phone || '',
      specialization: editingDoctor.specialization!,
      department: editingDoctor.department || '',
      licenseNumber: editingDoctor.licenseNumber || '',
      experience: editingDoctor.experience || 0,
      education: editingDoctor.education || [],
      availability: editingDoctor.availability || {
        days: [],
        hours: ''
      },
      status: 'active',
      image: '/api/placeholder/150/150',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setDoctors([...doctors, newDoctor])
    setShowAddModal(false)
    setEditingDoctor({})
    toast.success('Doctor added successfully')
  }

  const handleEditDoctor = () => {
    if (!selectedDoctor || !editingDoctor.name || !editingDoctor.email || !editingDoctor.specialization) {
      toast.error('Please fill in all required fields')
      return
    }

    const updatedDoctors = doctors.map(doctor =>
      doctor.id === selectedDoctor.id
        ? { ...doctor, ...editingDoctor, updatedAt: new Date().toISOString() }
        : doctor
    )

    setDoctors(updatedDoctors)
    setShowEditModal(false)
    setSelectedDoctor(null)
    setEditingDoctor({})
    toast.success('Doctor updated successfully')
  }

  const handleDeleteDoctor = (doctorId: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      setDoctors(doctors.filter(doctor => doctor.id !== doctorId))
      toast.success('Doctor deleted successfully')
    }
  }

  const openEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setEditingDoctor(doctor)
    setShowEditModal(true)
  }

  const openViewModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowViewModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctors</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage doctor profiles and specializations
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
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
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Filters</span>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {getInitials(doctor.name)}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialization}</p>
                  <p className="text-sm text-gray-500">{doctor.department}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openViewModal(doctor)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(doctor)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  {doctor.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  {doctor.phone}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Award className="h-4 w-4 mr-2" />
                  {doctor.experience} years experience
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  {doctor.availability.hours}
                </div>
              </div>
              
              <div className="mt-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doctor.status)}`}>
                  {doctor.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Doctor</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={editingDoctor.name || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, name: e.target.value})}
                    className="mt-1 input"
                    placeholder="Dr. Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={editingDoctor.email || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, email: e.target.value})}
                    className="mt-1 input"
                    placeholder="doctor@hospital.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={editingDoctor.phone || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, phone: e.target.value})}
                    className="mt-1 input"
                    placeholder="+1-555-0123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization *</label>
                  <input
                    type="text"
                    value={editingDoctor.specialization || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, specialization: e.target.value})}
                    className="mt-1 input"
                    placeholder="Cardiology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    value={editingDoctor.department || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, department: e.target.value})}
                    className="mt-1 input"
                    placeholder="Cardiology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                  <input
                    type="number"
                    value={editingDoctor.experience || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, experience: parseInt(e.target.value) || 0})}
                    className="mt-1 input"
                    placeholder="5"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingDoctor({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDoctor}
                  className="btn btn-primary btn-md"
                >
                  Add Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Doctor</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={editingDoctor.name || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, name: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={editingDoctor.email || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, email: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization *</label>
                  <input
                    type="text"
                    value={editingDoctor.specialization || ''}
                    onChange={(e) => setEditingDoctor({...editingDoctor, specialization: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editingDoctor.status || 'active'}
                    onChange={(e) => setEditingDoctor({...editingDoctor, status: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedDoctor(null)
                    setEditingDoctor({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditDoctor}
                  className="btn btn-primary btn-md"
                >
                  Update Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Doctor Modal */}
      {showViewModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Doctor Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedDoctor.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedDoctor.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedDoctor.phone}</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Specialization:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedDoctor.specialization}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Department:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedDoctor.department}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Experience:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedDoctor.experience} years</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDoctor.status)}`}>
                    {selectedDoctor.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedDoctor(null)
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