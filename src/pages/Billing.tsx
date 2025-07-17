import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CreditCard,
  DollarSign,
  Calendar,
  User,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { mockBills } from '../data/mockData'
import { Bill } from '../types'
import { formatCurrency, formatDate, getStatusColor } from '../utils'
import toast from 'react-hot-toast'

export default function Billing() {
  const [bills, setBills] = useState<Bill[]>(mockBills)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [editingBill, setEditingBill] = useState<Partial<Bill>>({})

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const handleAddBill = () => {
    if (!editingBill.patientName) {
      toast.error('Please fill in all required fields')
      return
    }

    const newBill: Bill = {
      id: `BILL-${Date.now()}`,
      patientId: '1',
      patientName: editingBill.patientName!,
      items: editingBill.items || [],
      subtotal: editingBill.subtotal || 0,
      tax: editingBill.tax || 0,
      discount: editingBill.discount || 0,
      total: (editingBill.subtotal || 0) + (editingBill.tax || 0) - (editingBill.discount || 0),
      status: 'pending',
      paymentMethod: editingBill.paymentMethod || '',
      dueDate: editingBill.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setBills([...bills, newBill])
    setShowAddModal(false)
    setEditingBill({})
    toast.success('Bill created successfully')
  }

  const handleEditBill = () => {
    if (!selectedBill || !editingBill.patientName) {
      toast.error('Please fill in all required fields')
      return
    }

    const updatedBills = bills.map(bill =>
      bill.id === selectedBill.id
        ? { ...bill, ...editingBill, updatedAt: new Date().toISOString() }
        : bill
    )

    setBills(updatedBills)
    setShowEditModal(false)
    setSelectedBill(null)
    setEditingBill({})
    toast.success('Bill updated successfully')
  }

  const handleDeleteBill = (billId: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      setBills(bills.filter(bill => bill.id !== billId))
      toast.success('Bill deleted successfully')
    }
  }

  const handleStatusChange = (billId: string, newStatus: string) => {
    const updatedBills = bills.map(bill =>
      bill.id === billId
        ? { 
            ...bill, 
            status: newStatus as any, 
            paidDate: newStatus === 'paid' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString() 
          }
        : bill
    )
    setBills(updatedBills)
    toast.success('Bill status updated')
  }

  const openEditModal = (bill: Bill) => {
    setSelectedBill(bill)
    setEditingBill(bill)
    setShowEditModal(true)
  }

  const openViewModal = (bill: Bill) => {
    setSelectedBill(bill)
    setShowViewModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage patient bills and payments
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Bill
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
              placeholder="Search bills..."
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
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Filters</span>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Bills ({filteredBills.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
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
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{bill.id}</div>
                        <div className="text-sm text-gray-500">{bill.items.length} items</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{bill.patientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(bill.total)}</div>
                    <div className="text-sm text-gray-500">
                      {bill.discount > 0 && `-${formatCurrency(bill.discount)} discount`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(bill.dueDate)}</div>
                    {bill.status === 'overdue' && (
                      <div className="text-xs text-red-600">Overdue</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(bill.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openViewModal(bill)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(bill)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBill(bill.id)}
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

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Bill</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient Name *</label>
                  <input
                    type="text"
                    value={editingBill.patientName || ''}
                    onChange={(e) => setEditingBill({...editingBill, patientName: e.target.value})}
                    className="mt-1 input"
                    placeholder="Patient name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subtotal</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBill.subtotal || ''}
                    onChange={(e) => setEditingBill({...editingBill, subtotal: parseFloat(e.target.value) || 0})}
                    className="mt-1 input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBill.tax || ''}
                    onChange={(e) => setEditingBill({...editingBill, tax: parseFloat(e.target.value) || 0})}
                    className="mt-1 input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBill.discount || ''}
                    onChange={(e) => setEditingBill({...editingBill, discount: parseFloat(e.target.value) || 0})}
                    className="mt-1 input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={editingBill.dueDate || ''}
                    onChange={(e) => setEditingBill({...editingBill, dueDate: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select
                    value={editingBill.paymentMethod || ''}
                    onChange={(e) => setEditingBill({...editingBill, paymentMethod: e.target.value})}
                    className="mt-1 input"
                  >
                    <option value="">Select Payment Method</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="insurance">Insurance</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingBill({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBill}
                  className="btn btn-primary btn-md"
                >
                  Create Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditModal && selectedBill && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Bill</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editingBill.status || 'pending'}
                    onChange={(e) => setEditingBill({...editingBill, status: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select
                    value={editingBill.paymentMethod || ''}
                    onChange={(e) => setEditingBill({...editingBill, paymentMethod: e.target.value})}
                    className="mt-1 input"
                  >
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="insurance">Insurance</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingBill.discount || ''}
                    onChange={(e) => setEditingBill({...editingBill, discount: parseFloat(e.target.value) || 0})}
                    className="mt-1 input"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedBill(null)
                    setEditingBill({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditBill}
                  className="btn btn-primary btn-md"
                >
                  Update Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {showViewModal && selectedBill && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Receipt className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Bill ID:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedBill.id}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Patient:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedBill.patientName}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Items:</span>
                  <div className="mt-2 space-y-1">
                    {selectedBill.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {item.name} - {item.quantity}x {formatCurrency(item.price)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatCurrency(selectedBill.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">{formatCurrency(selectedBill.tax)}</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-red-600">-{formatCurrency(selectedBill.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium border-t pt-1">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatCurrency(selectedBill.total)}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Due Date:</span>
                  <span className="ml-2 text-sm text-gray-900">{formatDate(selectedBill.dueDate)}</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedBill.paymentMethod}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBill.status)}`}>
                    {selectedBill.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedBill(null)
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