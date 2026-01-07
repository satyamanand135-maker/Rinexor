import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Phone, Mail, Edit, Trash2, Eye } from 'lucide-react'

interface Case {
  id: string
  debtor_name: string
  debtor_email: string
  debtor_phone: string
  debtor_address: string
  original_amount: number
  current_amount: number
  currency: string
  days_delinquent: number
  debt_age_days: number
  priority: 'High' | 'Medium' | 'Low'
  status: 'Active' | 'Resolved' | 'Pending'
  last_contact: string
  next_action: string
}

const CaseManagement: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')

  useEffect(() => {
    // Mock data - replace with API call
    const mockCases: Case[] = [
      {
        id: 'ACC-001',
        debtor_name: 'John Doe',
        debtor_email: 'john.doe@email.com',
        debtor_phone: '+1-555-0123',
        debtor_address: '123 Main St, City, State 12345',
        original_amount: 5000,
        current_amount: 4500,
        currency: 'USD',
        days_delinquent: 45,
        debt_age_days: 45,
        priority: 'High',
        status: 'Active',
        last_contact: '2024-01-05',
        next_action: 'Phone call scheduled'
      },
      {
        id: 'ACC-002',
        debtor_name: 'Jane Smith',
        debtor_email: 'jane.smith@email.com',
        debtor_phone: '+1-555-0456',
        debtor_address: '456 Oak Ave, City, State 67890',
        original_amount: 12000,
        current_amount: 12000,
        currency: 'USD',
        days_delinquent: 90,
        debt_age_days: 90,
        priority: 'High',
        status: 'Active',
        last_contact: '2024-01-03',
        next_action: 'Email follow-up'
      },
      {
        id: 'ACC-003',
        debtor_name: 'Bob Johnson',
        debtor_email: 'bob.johnson@email.com',
        debtor_phone: '+1-555-0789',
        debtor_address: '789 Pine Rd, City, State 11111',
        original_amount: 25000,
        current_amount: 23000,
        currency: 'USD',
        days_delinquent: 120,
        debt_age_days: 120,
        priority: 'Medium',
        status: 'Pending',
        last_contact: '2024-01-01',
        next_action: 'Legal review'
      }
    ]
    setCases(mockCases)
  }, [])

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.debtor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'All' || case_.status === filterStatus
    const matchesPriority = filterPriority === 'All' || case_.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-blue-600 bg-blue-100'
      case 'Resolved': return 'text-green-600 bg-green-100'
      case 'Pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all debt recovery cases</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add New Case
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search cases..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debtor Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
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
              {filteredCases.map((case_) => (
                <tr key={case_.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{case_.id}</div>
                      <div className="text-sm text-gray-500">{case_.next_action}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{case_.debtor_name}</div>
                      <div className="text-sm text-gray-500">{case_.debtor_email}</div>
                      <div className="text-sm text-gray-500">{case_.debtor_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ${case_.current_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Original: ${case_.original_amount.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {case_.days_delinquent} days
                      </div>
                      <div className="text-sm text-gray-500">
                        Last contact: {case_.last_contact}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(case_.priority)}`}>
                      {case_.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(case_.status)}`}>
                      {case_.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900" title="Call">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900" title="Email">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-900" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Cases</h3>
          <p className="text-3xl font-bold text-blue-600">{filteredCases.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Amount</h3>
          <p className="text-3xl font-bold text-green-600">
            ${filteredCases.reduce((sum, c) => sum + c.current_amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">High Priority</h3>
          <p className="text-3xl font-bold text-red-600">
            {filteredCases.filter(c => c.priority === 'High').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Cases</h3>
          <p className="text-3xl font-bold text-purple-600">
            {filteredCases.filter(c => c.status === 'Active').length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CaseManagement