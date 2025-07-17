import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Droplets,
  User
} from 'lucide-react'
import { mockPatients } from '../data/mockData'
import { Patient } from '../types'
import { formatDate, calculateAge, getStatusColor, getInitials } from '../utils'
import toast from 'react-hot-toast'

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [editingPatient, setEditingPatient] = useState<Partial<Patient>>({})

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddPatient = () => {
    if (!editingPatient.name || !editingPatient.email || !editingPatient.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const newPatient: Patient = {
      id: Date.now().toString(),
      name: editingPatient.name!,
      email: editingPatient.email!,
      phone: editingPatient.phone!,
      dateOfBirth: editingPatient.dateOfBirth || '',
      gender: editingPatient.gender || 'other',
      address: editingPatient.address || '',
      bloodType: editingPatient.bloodType || '',
      emergencyContact: editingPatient.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
      medicalHistory: editingPatient.medicalHistory || [],
      allergies: editingPatient.allergies || [],
      insurance: editingPatient.insurance || {
        provider: '',
        policyNumber: '',
        expiryDate: ''
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setPatients([...patients, newPatient])
    setShowAddModal(false)
    setEditingPatient({})
    toast.success('Patient added successfully')
  }

  const handleEditPatient = () => {
    if (!selectedPatient || !editingPatient.name || !editingPatient.email || !editingPatient.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    const updatedPatients = patients.map(patient =>
      patient.id === selectedPatient.id
        ? { ...patient, ...editingPatient, updatedAt: new Date().toISOString() }
        : patient
    )

    setPatients(updatedPatients)
    setShowEditModal(false)
    setSelectedPatient(null)
    setEditingPatient({})
    toast.success('Patient updated successfully')
  }

  const handleDeletePatient = (patientId: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      setPatients(patients.filter(patient => patient.id !== patientId))
      toast.success('Patient deleted successfully')
    }
  }

  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient)
    setEditingPatient(patient)
    setShowEditModal(true)
  }

  const openViewModal = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowViewModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage patient records and information
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discharged">Discharged</option>
          </select>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Filters</span>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Patients ({filteredPatients.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age/Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood Type
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
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {getInitials(patient.name)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">ID: {patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.email}</div>
                    <div className="text-sm text-gray-500">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{calculateAge(patient.dateOfBirth)} years</div>
                    <div className="text-sm text-gray-500 capitalize">{patient.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-gray-900">{patient.bloodType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openViewModal(patient)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(patient)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
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

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Patient</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={editingPatient.name || ''}
                    onChange={(e) => setEditingPatient({...editingPatient, name: e.target.value})}
                    className="mt-1 input"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={editingPatient.email || ''}
                    onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                    className="mt-1 input"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    value={editingPatient.phone || ''}
                    onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                    className="mt-1 input"
                    placeholder="+1-555-0123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={editingPatient.dateOfBirth || ''}
                    onChange={(e) => setEditingPatient({...editingPatient, dateOfBirth: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={editingPatient.gender || 'other'}
                    onChange={(e) => setEditingPatient({...editingPatient, gender: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingPatient({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPatient}
                  className="btn btn-primary btn-md"
                >
                  Add Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Patient</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={editingPatient.name || ''}
                    onChange={(e) => setEditingPatient({...editingPatient, name: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={editingPatient.email || ''}
                    onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    value={editingPatient.phone || ''}
                    onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editingPatient.status || 'active'}
                    onChange={(e) => setEditingPatient({...editingPatient, status: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discharged">Discharged</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedPatient(null)
                    setEditingPatient({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditPatient}
                  className="btn btn-primary btn-md"
                >
                  Update Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Patient Modal */}
      {showViewModal && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedPatient.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedPatient.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedPatient.phone}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Age:</span>
                  <span className="ml-2 text-sm text-gray-900">{calculateAge(selectedPatient.dateOfBirth)} years</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Address:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedPatient.address}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPatient.status)}`}>
                    {selectedPatient.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedPatient(null)
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