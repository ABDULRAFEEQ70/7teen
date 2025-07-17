import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Mail,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react'
import { mockStaff } from '../data/mockData'
import { Staff as StaffType } from '../types'
import { getStatusColor, getInitials } from '../utils'
import toast from 'react-hot-toast'

export default function Staff() {
  const [staff, setStaff] = useState<StaffType[]>(mockStaff)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null)
  const [editingStaff, setEditingStaff] = useState<Partial<StaffType>>({})

  const filteredStaff = staff.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const roles = Array.from(new Set(staff.map(employee => employee.role)))

  const handleAddStaff = () => {
    if (!editingStaff.name || !editingStaff.email || !editingStaff.role) {
      toast.error('Please fill in all required fields')
      return
    }

    const newStaff: StaffType = {
      id: Date.now().toString(),
      name: editingStaff.name!,
      email: editingStaff.email!,
      phone: editingStaff.phone || '',
      role: editingStaff.role as any,
      department: editingStaff.department || '',
      hireDate: editingStaff.hireDate || new Date().toISOString().split('T')[0],
      salary: editingStaff.salary || 0,
      status: 'active',
      image: '/api/placeholder/150/150',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setStaff([...staff, newStaff])
    setShowAddModal(false)
    setEditingStaff({})
    toast.success('Staff member added successfully')
  }

  const handleEditStaff = () => {
    if (!selectedStaff || !editingStaff.name || !editingStaff.email || !editingStaff.role) {
      toast.error('Please fill in all required fields')
      return
    }

    const updatedStaff = staff.map(employee =>
      employee.id === selectedStaff.id
        ? { ...employee, ...editingStaff, updatedAt: new Date().toISOString() }
        : employee
    )

    setStaff(updatedStaff)
    setShowEditModal(false)
    setSelectedStaff(null)
    setEditingStaff({})
    toast.success('Staff member updated successfully')
  }

  const handleDeleteStaff = (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaff(staff.filter(employee => employee.id !== staffId))
      toast.success('Staff member deleted successfully')
    }
  }

  const openEditModal = (employee: StaffType) => {
    setSelectedStaff(employee)
    setEditingStaff(employee)
    setShowEditModal(true)
  }

  const openViewModal = (employee: StaffType) => {
    setSelectedStaff(employee)
    setShowViewModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage hospital staff and employees
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
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
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
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

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((employee) => (
          <div key={employee.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {getInitials(employee.name)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{employee.role}</p>
                    <p className="text-sm text-gray-500">{employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openViewModal(employee)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(employee)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(employee.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  {employee.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  {employee.phone}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Hired: {employee.hireDate}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ${employee.salary.toLocaleString()}
                </div>
              </div>
              
              <div className="mt-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Staff Member</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={editingStaff.name || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                    className="mt-1 input"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={editingStaff.email || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                    className="mt-1 input"
                    placeholder="email@hospital.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
                    className="mt-1 input"
                    placeholder="+1-555-0123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role *</label>
                  <select
                    value={editingStaff.role || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="">Select Role</option>
                    <option value="nurse">Nurse</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="technician">Technician</option>
                    <option value="administrator">Administrator</option>
                    <option value="pharmacist">Pharmacist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    value={editingStaff.department || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, department: e.target.value})}
                    className="mt-1 input"
                    placeholder="Department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary</label>
                  <input
                    type="number"
                    value={editingStaff.salary || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, salary: parseInt(e.target.value) || 0})}
                    className="mt-1 input"
                    placeholder="50000"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingStaff({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStaff}
                  className="btn btn-primary btn-md"
                >
                  Add Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Staff Member</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={editingStaff.name || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    value={editingStaff.email || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role *</label>
                  <select
                    value={editingStaff.role || ''}
                    onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="nurse">Nurse</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="technician">Technician</option>
                    <option value="administrator">Administrator</option>
                    <option value="pharmacist">Pharmacist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editingStaff.status || 'active'}
                    onChange={(e) => setEditingStaff({...editingStaff, status: e.target.value as any})}
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
                    setSelectedStaff(null)
                    setEditingStaff({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditStaff}
                  className="btn btn-primary btn-md"
                >
                  Update Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Staff Modal */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedStaff.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedStaff.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedStaff.phone}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Role:</span>
                  <span className="ml-2 text-sm text-gray-900 capitalize">{selectedStaff.role}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Department:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedStaff.department}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Hire Date:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedStaff.hireDate}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Salary:</span>
                  <span className="ml-2 text-sm text-gray-900">${selectedStaff.salary.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStaff.status)}`}>
                    {selectedStaff.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedStaff(null)
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