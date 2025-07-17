import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react'
import { mockInventory } from '../data/mockData'
import { InventoryItem } from '../types'
import { getStatusColor, formatCurrency } from '../utils'
import toast from 'react-hot-toast'

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem>>({})

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddItem = () => {
    if (!editingItem.name || !editingItem.category) {
      toast.error('Please fill in all required fields')
      return
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: editingItem.name!,
      category: editingItem.category as any,
      description: editingItem.description || '',
      quantity: editingItem.quantity || 0,
      unit: editingItem.unit || '',
      price: editingItem.price || 0,
      supplier: editingItem.supplier || '',
      expiryDate: editingItem.expiryDate || '',
      minStock: editingItem.minStock || 0,
      maxStock: editingItem.maxStock || 0,
      location: editingItem.location || '',
      status: 'in_stock',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setInventory([...inventory, newItem])
    setShowAddModal(false)
    setEditingItem({})
    toast.success('Item added successfully')
  }

  const handleEditItem = () => {
    if (!selectedItem || !editingItem.name || !editingItem.category) {
      toast.error('Please fill in all required fields')
      return
    }

    const updatedInventory = inventory.map(item =>
      item.id === selectedItem.id
        ? { ...item, ...editingItem, updatedAt: new Date().toISOString() }
        : item
    )

    setInventory(updatedInventory)
    setShowEditModal(false)
    setSelectedItem(null)
    setEditingItem({})
    toast.success('Item updated successfully')
  }

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== itemId))
      toast.success('Item deleted successfully')
    }
  }

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setEditingItem(item)
    setShowEditModal(true)
  }

  const openViewModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowViewModal(true)
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) return 'out_of_stock'
    if (quantity <= minStock) return 'low_stock'
    return 'in_stock'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage hospital inventory and supplies
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
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
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Categories</option>
            <option value="medication">Medication</option>
            <option value="equipment">Equipment</option>
            <option value="supplies">Supplies</option>
            <option value="devices">Devices</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="expired">Expired</option>
          </select>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Filters</span>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Inventory Items ({filteredInventory.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
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
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                    {item.quantity <= item.minStock && (
                      <div className="flex items-center text-xs text-orange-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low stock
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(item.price)}</div>
                    <div className="text-sm text-gray-500">per {item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openViewModal(item)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
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

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    className="mt-1 input"
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="">Select Category</option>
                    <option value="medication">Medication</option>
                    <option value="equipment">Equipment</option>
                    <option value="supplies">Supplies</option>
                    <option value="devices">Devices</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    className="mt-1 input"
                    rows={2}
                    placeholder="Item description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      value={editingItem.quantity || ''}
                      onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})}
                      className="mt-1 input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <input
                      type="text"
                      value={editingItem.unit || ''}
                      onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                      className="mt-1 input"
                      placeholder="pcs, kg, etc."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.price || ''}
                    onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                    className="mt-1 input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <input
                    type="text"
                    value={editingItem.supplier || ''}
                    onChange={(e) => setEditingItem({...editingItem, supplier: e.target.value})}
                    className="mt-1 input"
                    placeholder="Supplier name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="date"
                    value={editingItem.expiryDate || ''}
                    onChange={(e) => setEditingItem({...editingItem, expiryDate: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Stock</label>
                    <input
                      type="number"
                      value={editingItem.minStock || ''}
                      onChange={(e) => setEditingItem({...editingItem, minStock: parseInt(e.target.value) || 0})}
                      className="mt-1 input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Stock</label>
                    <input
                      type="number"
                      value={editingItem.maxStock || ''}
                      onChange={(e) => setEditingItem({...editingItem, maxStock: parseInt(e.target.value) || 0})}
                      className="mt-1 input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={editingItem.location || ''}
                    onChange={(e) => setEditingItem({...editingItem, location: e.target.value})}
                    className="mt-1 input"
                    placeholder="Storage location"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingItem({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="btn btn-primary btn-md"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value as any})}
                    className="mt-1 input"
                  >
                    <option value="medication">Medication</option>
                    <option value="equipment">Equipment</option>
                    <option value="supplies">Supplies</option>
                    <option value="devices">Devices</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={editingItem.quantity || ''}
                    onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})}
                    className="mt-1 input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.price || ''}
                    onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                    className="mt-1 input"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedItem(null)
                    setEditingItem({})
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditItem}
                  className="btn btn-primary btn-md"
                >
                  Update Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Item Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedItem.name}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-sm text-gray-900">{selectedItem.description}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-sm text-gray-900 capitalize">{selectedItem.category}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedItem.quantity} {selectedItem.unit}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Price:</span>
                  <span className="ml-2 text-sm text-gray-900">{formatCurrency(selectedItem.price)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Supplier:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedItem.supplier}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Expiry Date:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedItem.expiryDate}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Location:</span>
                  <span className="ml-2 text-sm text-gray-900">{selectedItem.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedItem(null)
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