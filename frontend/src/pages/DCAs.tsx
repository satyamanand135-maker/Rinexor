import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Star,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { DCA, DCAFilters } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatPercentage, getPerformanceColor } from '@/lib/utils';

export default function DCAs() {
  const [dcas, setDcas] = useState<DCA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<DCAFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Form state for creating new DCA
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    specialization: [] as string[],
    max_concurrent_cases: 50,
  });

  useEffect(() => {
    fetchDCAs();
  }, [filters]);

  const fetchDCAs = async () => {
    try {
      setLoading(true);
      const data = await api.getDCAs(filters);
      setDcas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load DCAs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof DCAFilters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const handleCreateDCA = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('DCA name is required');
      }
      if (!formData.code.trim()) {
        throw new Error('DCA code is required');
      }
      if (!formData.contact_person.trim()) {
        throw new Error('Contact person is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }

      // Create the DCA
      await api.createDCA({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        contact_person: formData.contact_person.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        specialization: formData.specialization.length > 0 ? formData.specialization : undefined,
        max_concurrent_cases: formData.max_concurrent_cases,
      });

      // Reset form and close modal
      setFormData({
        name: '',
        code: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        specialization: [],
        max_concurrent_cases: 50,
      });
      setShowCreateModal(false);
      
      // Refresh the DCAs list
      await fetchDCAs();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create DCA');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecializationChange = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec],
    }));
  };

  const commonSpecializations = [
    'Consumer Debt',
    'Commercial Debt',
    'Medical Debt',
    'Credit Card Debt',
    'Auto Loans',
    'Student Loans',
    'Mortgage',
    'Small Business',
    'Legal Collections',
    'International',
  ];

  const getPerformanceStars = (score: number) => {
    const stars = Math.round(score * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-dark-600'}`}
      />
    ));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Debt Collection Agencies</h1>
          <p className="text-dark-400 mt-1">Manage your DCA partners and their performance</p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add DCA
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
              placeholder="Search DCAs by name, code, or contact person..."
              className="input-field pl-10"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-3">
            <select
              className="input-field"
              value={filters.is_active === undefined ? '' : filters.is_active.toString()}
              onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? '' : e.target.value === 'true')}
            >
              <option value="">All DCAs</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>

            <select
              className="input-field"
              value={filters.is_accepting_cases === undefined ? '' : filters.is_accepting_cases.toString()}
              onChange={(e) => handleFilterChange('is_accepting_cases', e.target.value === '' ? '' : e.target.value === 'true')}
            >
              <option value="">All Availability</option>
              <option value="true">Accepting Cases</option>
              <option value="false">Not Accepting</option>
            </select>
          </div>
        </div>
      </div>

      {/* DCAs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dcas.map((dca) => (
          <motion.div
            key={dca.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="glass-card p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{dca.name}</h3>
                  <p className="text-sm text-dark-400">{dca.code}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {dca.is_active ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                {dca.is_accepting_cases && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-dark-300">
                <Users className="w-4 h-4" />
                <span>{dca.contact_person}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-dark-300">
                <Mail className="w-4 h-4" />
                <span>{dca.email}</span>
              </div>
              {dca.phone && (
                <div className="flex items-center space-x-2 text-sm text-dark-300">
                  <Phone className="w-4 h-4" />
                  <span>{dca.phone}</span>
                </div>
              )}
              {dca.address && (
                <div className="flex items-center space-x-2 text-sm text-dark-300">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{dca.address}</span>
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">Performance Score</span>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {getPerformanceStars(dca.performance_score)}
                  </div>
                  <span className={`text-sm font-medium ${getPerformanceColor(dca.performance_score)}`}>
                    {formatPercentage(dca.performance_score)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">Recovery Rate</span>
                <span className={`text-sm font-medium ${getPerformanceColor(dca.recovery_rate)}`}>
                  {formatPercentage(dca.recovery_rate)}
                </span>
              </div>

              {dca.avg_resolution_days && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-400">Avg Resolution</span>
                  <span className="text-sm font-medium text-white">
                    {dca.avg_resolution_days} days
                  </span>
                </div>
              )}

              {dca.sla_compliance_rate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-400">SLA Compliance</span>
                  <span className={`text-sm font-medium ${getPerformanceColor(dca.sla_compliance_rate)}`}>
                    {formatPercentage(dca.sla_compliance_rate)}
                  </span>
                </div>
              )}
            </div>

            {/* Capacity */}
            {dca.max_concurrent_cases && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-dark-400">Capacity</span>
                  <span className="text-white">
                    {dca.current_active_cases || 0} / {dca.max_concurrent_cases}
                  </span>
                </div>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-accent-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((dca.current_active_cases || 0) / dca.max_concurrent_cases) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Specialization */}
            {dca.specialization && dca.specialization.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-dark-400 mb-2">Specialization</p>
                <div className="flex flex-wrap gap-1">
                  {dca.specialization.map((spec, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-600/20 text-primary-400 text-xs rounded-full border border-primary-500/30"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-700">
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-dark-400 hover:text-primary-400 rounded-lg hover:bg-primary-600/10"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-dark-400 hover:text-accent-400 rounded-lg hover:bg-accent-600/10"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="text-xs text-dark-500">
                {dca.onboarded_date && `Since ${new Date(dca.onboarded_date).getFullYear()}`}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {dcas.length === 0 && !loading && (
        <div className="glass-card p-12 text-center">
          <Building2 className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No DCAs Found</h3>
          <p className="text-dark-400 mb-6">
            {filters.search || filters.is_active !== undefined || filters.is_accepting_cases !== undefined
              ? 'No DCAs match your current filters.'
              : 'Get started by adding your first DCA partner.'}
          </p>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First DCA
          </motion.button>
        </div>
      )}

      {/* Create DCA Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">Add New DCA</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-dark-400 hover:text-white rounded-lg hover:bg-dark-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error Display */}
              {createError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400">{createError}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleCreateDCA} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      DCA Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g., Alpha Collections Inc."
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      DCA Code *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g., ACI"
                      value={formData.code}
                      onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g., John Smith"
                      value={formData.contact_person}
                      onChange={(e) => handleFormChange('contact_person', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="input-field"
                      placeholder="e.g., contact@alphacollections.com"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="e.g., +1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Max Concurrent Cases
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      className="input-field"
                      value={formData.max_concurrent_cases}
                      onChange={(e) => handleFormChange('max_concurrent_cases', parseInt(e.target.value) || 50)}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Address
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="e.g., 123 Business Ave, Suite 100, City, State 12345"
                    value={formData.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Specialization
                  </label>
                  <p className="text-sm text-dark-400 mb-3">
                    Select the types of debt this DCA specializes in
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {commonSpecializations.map((spec) => (
                      <label
                        key={spec}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.specialization.includes(spec)}
                          onChange={() => handleSpecializationChange(spec)}
                          className="rounded border-dark-600 bg-dark-700 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-dark-300">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-dark-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                    disabled={createLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createLoading}
                  >
                    {createLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create DCA
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}