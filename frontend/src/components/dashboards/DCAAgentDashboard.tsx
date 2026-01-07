import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare,
  Phone,
  Mail,
  Edit3,
} from 'lucide-react';
import { api } from '../../lib/api';
import type { Case, DashboardStats } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { formatCurrency, formatPercentage } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function StatCard({ title, value, icon, color, onClick }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: onClick ? 1.02 : 1 }}
      className={`glass-card p-6 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-dark-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface CaseCardProps {
  case: Case;
  onStatusUpdate: (caseId: string, status: string) => void;
}

function CaseCard({ case: caseItem, onStatusUpdate }: CaseCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statusColors = {
    new: 'bg-blue-500/20 text-blue-400',
    allocated: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-purple-500/20 text-purple-400',
    escalated: 'bg-red-500/20 text-red-400',
    resolved: 'bg-green-500/20 text-green-400',
    returned: 'bg-gray-500/20 text-gray-400',
    closed: 'bg-dark-500/20 text-dark-400',
  };

  const priorityColors = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
  };

  const handleStatusUpdate = async (newStatus: string) => {
    console.log('CaseCard: Updating status for case', caseItem.id, 'to', newStatus); // Debug log
    setIsUpdating(true);
    try {
      await onStatusUpdate(caseItem.id, newStatus);
      setShowStatusMenu(false);
      console.log('CaseCard: Status update successful'); // Debug log
    } catch (error) {
      console.error('CaseCard: Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusOptions = () => {
    const currentStatus = caseItem.status;
    const allStatuses = ['allocated', 'in_progress', 'escalated', 'resolved', 'returned'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 hover:border-primary-500/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white">{caseItem.debtor_name}</h4>
          <p className="text-sm text-dark-400">Account: {caseItem.account_id}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[caseItem.priority]}`}>
            {caseItem.priority.toUpperCase()}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={isUpdating}
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[caseItem.status]} hover:opacity-80 transition-opacity`}
            >
              {isUpdating ? 'Updating...' : caseItem.status.replace('_', ' ').toUpperCase()}
            </button>
            
            {showStatusMenu && (
              <div className="absolute right-0 top-8 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-10 min-w-32">
                {getStatusOptions().map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-dark-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-dark-400">Amount</p>
          <p className="text-lg font-semibold text-white">{formatCurrency(caseItem.current_amount)}</p>
        </div>
        <div>
          <p className="text-sm text-dark-400">Days Delinquent</p>
          <p className="text-lg font-semibold text-white">{caseItem.days_delinquent}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-dark-400">
          <Calendar className="w-4 h-4" />
          <span>Assigned: {new Date(caseItem.allocation_date || caseItem.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {caseItem.debtor_phone && (
            <button className="p-2 text-dark-400 hover:text-primary-400 rounded-lg hover:bg-dark-800 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          )}
          {caseItem.debtor_email && (
            <button className="p-2 text-dark-400 hover:text-primary-400 rounded-lg hover:bg-dark-800 transition-colors">
              <Mail className="w-4 h-4" />
            </button>
          )}
          <button className="p-2 text-dark-400 hover:text-primary-400 rounded-lg hover:bg-dark-800 transition-colors">
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SLA Indicators */}
      {caseItem.sla_contact_deadline && (
        <div className="mt-4 pt-4 border-t border-dark-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-400">Contact Deadline:</span>
            <span className={`${new Date(caseItem.sla_contact_deadline) < new Date() ? 'text-red-400' : 'text-green-400'}`}>
              {new Date(caseItem.sla_contact_deadline).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function DCAAgentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, casesData] = await Promise.all([
          api.getDashboardStats(),
          api.getCases({ dca_id: user?.dca_id })
        ]);
        setStats(statsData);
        setCases(casesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.dca_id]);

  const handleStatusUpdate = async (caseId: string, newStatus: string) => {
    console.log('Updating case status:', { caseId, newStatus }); // Debug log
    try {
      await api.updateCase(caseId, { status: newStatus });
      console.log('Case update successful'); // Debug log
      
      // Update local state
      setCases(prevCases => 
        prevCases.map(c => 
          c.id === caseId ? { ...c, status: newStatus as any } : c
        )
      );
      
      // Refresh stats
      const updatedStats = await api.getDashboardStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('Case update failed:', error); // Debug log
      throw error;
    }
  };

  const filteredCases = cases.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['allocated', 'in_progress'].includes(c.status);
    if (filter === 'overdue') return c.sla_contact_deadline && new Date(c.sla_contact_deadline) < new Date();
    return c.status === filter;
  });

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const myStats = {
    total_cases: cases.length,
    active_cases: cases.filter(c => ['allocated', 'in_progress'].includes(c.status)).length,
    resolved_cases: cases.filter(c => c.status === 'resolved').length,
    overdue_cases: cases.filter(c => c.sla_contact_deadline && new Date(c.sla_contact_deadline) < new Date()).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Cases Dashboard</h1>
          <p className="text-dark-400 mt-1">Manage your assigned debt collection cases</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-dark-400">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Assigned"
          value={myStats.total_cases}
          icon={<FileText className="w-6 h-6 text-white" />}
          color="bg-blue-500/20"
          onClick={() => setFilter('all')}
        />
        
        <StatCard
          title="Active Cases"
          value={myStats.active_cases}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-yellow-500/20"
          onClick={() => setFilter('active')}
        />
        
        <StatCard
          title="Resolved"
          value={myStats.resolved_cases}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="bg-green-500/20"
          onClick={() => setFilter('resolved')}
        />
        
        <StatCard
          title="Overdue"
          value={myStats.overdue_cases}
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
          color="bg-red-500/20"
          onClick={() => setFilter('overdue')}
        />
      </div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">My Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {myStats.total_cases > 0 ? formatPercentage((myStats.resolved_cases / myStats.total_cases) * 100) : '0%'}
            </div>
            <div className="text-sm text-dark-400">Resolution Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(cases.reduce((sum, c) => sum + (c.status === 'resolved' ? c.original_amount - c.current_amount : 0), 0))}
            </div>
            <div className="text-sm text-dark-400">Total Recovered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {cases.length > 0 ? Math.round(cases.reduce((sum, c) => sum + c.days_delinquent, 0) / cases.length) : 0}
            </div>
            <div className="text-sm text-dark-400">Avg Case Age</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {myStats.overdue_cases === 0 ? '100%' : formatPercentage(((myStats.total_cases - myStats.overdue_cases) / myStats.total_cases) * 100)}
            </div>
            <div className="text-sm text-dark-400">SLA Compliance</div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All Cases', count: myStats.total_cases },
          { key: 'active', label: 'Active', count: myStats.active_cases },
          { key: 'allocated', label: 'Allocated', count: cases.filter(c => c.status === 'allocated').length },
          { key: 'in_progress', label: 'In Progress', count: cases.filter(c => c.status === 'in_progress').length },
          { key: 'resolved', label: 'Resolved', count: myStats.resolved_cases },
          { key: 'overdue', label: 'Overdue', count: myStats.overdue_cases },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
            }`}
          >
            {tab.label} ({tab.count})
          </motion.button>
        ))}
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCases.length > 0 ? (
          filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              case={caseItem}
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-400">No cases found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
            onClick={() => setFilter('allocated')}
          >
            <Clock className="w-5 h-5 mr-2" />
            Review New Cases
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
            onClick={() => setFilter('overdue')}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Check Overdue
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
            onClick={() => window.location.href = '/cases'}
          >
            <FileText className="w-5 h-5 mr-2" />
            View All Cases
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}