import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  FileText,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Case, CaseFilters } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<CaseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  useEffect(() => {
    fetchCases();
  }, [filters]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await api.getCases(filters);
      setCases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CaseFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const toggleCaseSelection = (caseId: string) => {
    setSelectedCases(prev =>
      prev.includes(caseId)
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const selectAllCases = () => {
    setSelectedCases(cases.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedCases([]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Cases</h1>
          <p className="text-dark-400 mt-1">Manage and track all debt collection cases</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Case
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search cases by debtor name, account ID..."
              className="input-field pl-10"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.02 }}
            className={`btn-secondary ${showFilters ? 'bg-primary-600/20 text-primary-400' : ''}`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </motion.button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-dark-700 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Status</label>
              <select
                className="input-field"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="allocated">Allocated</option>
                <option value="in_progress">In Progress</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                <option value="returned">Returned</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Priority</label>
              <select
                className="input-field"
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Date From</label>
              <input
                type="date"
                className="input-field"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Date To</label>
              <input
                type="date"
                className="input-field"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-white">
              {selectedCases.length} case{selectedCases.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-3">
              <button className="btn-secondary text-sm">Allocate to DCA</button>
              <button className="btn-secondary text-sm">Update Status</button>
              <button onClick={clearSelection} className="text-dark-400 hover:text-white">
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cases Table */}
      <div className="glass-card overflow-hidden">
        {error ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
            <button onClick={fetchCases} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-400">No cases found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800/50 border-b border-dark-700">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCases.length === cases.length}
                      onChange={() => selectedCases.length === cases.length ? clearSelection() : selectAllCases()}
                      className="rounded border-dark-600 bg-dark-700 text-primary-600 focus:ring-primary-600"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">
                    <div className="flex items-center space-x-1">
                      <span>Account ID</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Debtor</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">DCA</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {cases.map((case_) => (
                  <motion.tr
                    key={case_.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-dark-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCases.includes(case_.id)}
                        onChange={() => toggleCaseSelection(case_.id)}
                        className="rounded border-dark-600 bg-dark-700 text-primary-600 focus:ring-primary-600"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {case_.account_id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{case_.debtor_name}</div>
                        {case_.debtor_email && (
                          <div className="text-sm text-dark-400">{case_.debtor_email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">
                        {formatCurrency(case_.current_amount)}
                      </div>
                      <div className="text-sm text-dark-400">
                        Original: {formatCurrency(case_.original_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${getStatusColor(case_.status)}`}>
                        {case_.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${getPriorityColor(case_.priority)}`}>
                        {case_.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-300">
                      {case_.dca_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-300">
                      {formatDate(case_.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-dark-400 hover:text-primary-400"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-dark-400 hover:text-accent-400"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}