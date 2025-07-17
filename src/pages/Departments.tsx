import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Building2,
  Users,
  Bed,
  UserCheck
} from 'lucide-react'
import { mockDepartments } from '../data/mockData'
import { Department } from '../types'
import { getStatusColor } from '../utils'
import toast from 'react-hot-toast'

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [editingDepartment, setEditingDepartment] = useState<Partial<Department>>({})

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || department.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddDepartment = () => {
    if (!editingDepartment.name || !editingDepartment.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const newDepartment: Department = {
      id: Date.now().toString(),
      name: editingDepartment.name!,
      description: editingDepartment.description!,
      headDoctor: editingDepartment.headDoctor || '',
      staffCount: editingDepartment.staffCount || 0,
      bedCount: editingDepartment.bedCount || 0,
      availableBeds: editingDepartment.availableBeds || 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setDepartments([...departments, newDepartment])
    setShowAddModal(false)
    setEditingDepartment({})
    toast.success('Department added successfully')
  }

  const handleEditDepartment = () => {
    if (!selectedDepartment || !editingDepartment.name || !editingDepartment.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const updatedDepartments = departments.map(department =>
      department.id === selectedDepartment.id
        ? { ...department, ...editingDepartment, updatedAt: new Date().toISOString() }
        : department
    )

    setDepartments(updatedDepartments)
    setShowEditModal(false)
    setSelectedDepartment(null)
    setEditingDepartment({})
    toast.success('Department updated successfully')
  }

  const handleDeleteDepartment = (departmentId: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setDepartments(departments.filter(department => department.id !== departmentId))
      toast.success('Department deleted successfully')
    }
  }

  const openEditModal = (department: Department) => {
    setSelectedDepartment(department)
    setEditingDepartment(department)
    setShowEditModal(true)
  }

  const openViewModal = (department: Department) => {
    setSelectedDepartment(department)
    setShowViewModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage hospital departments and their resources
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
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
              placeholder="Search departments..."
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
          </select>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Filters</span>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div key={department.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                    <p className="text-sm text-gray-500">{department.headDoctor}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openViewModal(department)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(department)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(department.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">{department.description}</p>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900">{department.staffCount}</span>
                  </div>
                  <p className="text-xs text-gray-500">Staff</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Bed className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900">{department.bedCount}</span>
                  </div>
                  <p className="text-xs text-gray-500">Total Beds</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">{department.availableBeds}</span>
                  </div>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>
              
              <div className="mt-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(department.status)}`}>
                  {department.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Department</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={editingDepartment.name || ''}
                    onChange={(e) => setEditingDepartment({...editingDepartment, name: e.target.value})}
                    className="mt-1 input"
                    placeholder="Department name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    value={editingDepartment.description || ''}
                    onChange={(e) => setEditingDepartment({...editingDepartment, description: e.target.value})}
                    className="mt-1 input"
                    rows={3}
                    placeholder="Department description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Head Doctor</label>
                  <input
                    type="text"
                    value={editingDepartment.headDoctor || ''}
                    onChange={(e) => setEditingDepartment({...editingDepartment, headDoctor: e.target.value})}
                    className="mt-1 input"
                    placeholder="Dr. Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Staff Count</label>
                    <input
                      type="number"
                      value={editingDepartment.staffCount || ''}
                      onChange={(e) => setEditingDepartment({...editingDepartment, staffCount: parseInt(e.target.value) || 0})}
                      className="mt-1 input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bed Count</label>
                    <input
                      type="number"
                      value={editingDepartment.bedCount || ''}
                      onChange={(e) => setEditingDepartment({...editingDepartment, bedCount: parseInt(e.target.value) || 0})}
                      className="mt-1 input"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingDepartment({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDepartment}
                  className="btn btn-primary btn-md"
                >
                  Add Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && selectedDepartment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Department</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={editingDepartment.name || ''}
                    onChange={(e) => setEditingDepartment({...editingDepartment, name: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    value={editingDepartment.description || ''}
                    onChange={(e) => setEditingDepartment({...editingDepartment, description: e.target.value})}
                    className="mt-1 input"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editingDepartment.status || 'active'}
                    onChange={(e) => setEditingDepartment({...editingDepartment, status: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedDepartment(null)
                    setEditingDepartment({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditDepartment}
                  className="btn btn-primary btn-md"
                >
                  Update Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Department Modal */}
      {showViewModal && selectedDepartment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Department Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedDepartment.name}</span>
                </div>
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Head Doctor:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedDepartment.headDoctor}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-sm text-gray-900">{selectedDepartment.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Staff Count:</span>
                    <p className="text-sm text-gray-900">{selectedDepartment.staffCount}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Total Beds:</span>
                    <p className="text-sm text-gray-900">{selectedDepartment.bedCount}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Available Beds:</span>
                    <p className="text-sm text-green-600">{selectedDepartment.availableBeds}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDepartment.status)}`}>
                      {selectedDepartment.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedDepartment(null)
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