import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Building2,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-dark-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-dark-400'
            }`}>
              {trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
              {trend === 'down' && <TrendingUp className="w-4 h-4 mr-1 rotate-180" />}
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function EnterpriseAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enterprise Admin Dashboard</h1>
          <p className="text-dark-400 mt-1">Manage cases, uploads, and monitor collection performance</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-dark-400">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {stats ? new Date(stats.last_updated).toLocaleString() : 'N/A'}</span>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Portfolio"
          value={formatCurrency(stats?.total_amount || 0)}
          change="+8% from last month"
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-500/20"
        />
        
        <StatCard
          title="Active Cases"
          value={stats?.total_cases.toLocaleString() || '0'}
          change="+12% from last month"
          trend="up"
          icon={<FileText className="w-6 h-6 text-white" />}
          color="bg-blue-500/20"
        />
        
        <StatCard
          title="Recovery Rate"
          value={formatPercentage(stats?.recovery_rate || 0)}
          change="+2.3% from last month"
          trend="up"
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-purple-500/20"
        />
        
        <StatCard
          title="Active DCAs"
          value={stats?.active_dcas || '0'}
          icon={<Building2 className="w-6 h-6 text-white" />}
          color="bg-orange-500/20"
        />
      </div>

      {/* Upload & Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Upload className="w-6 h-6 mr-2 text-primary-400" />
            Case Upload Center
          </h3>
          <p className="text-dark-400 mb-6">Upload new cases for AI processing and DCA allocation</p>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary"
              onClick={() => window.location.href = '/upload'}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload CSV File
            </motion.button>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{stats?.cases_this_month || 0}</div>
                <div className="text-sm text-dark-400">Cases This Month</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {formatPercentage((stats?.recovered_amount || 0) / (stats?.total_amount || 1) * 100)}
                </div>
                <div className="text-sm text-dark-400">Success Rate</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Case Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-400" />
            Case Management
          </h3>
          <p className="text-dark-400 mb-6">Monitor and manage your debt collection cases</p>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-secondary"
              onClick={() => window.location.href = '/cases'}
            >
              <FileText className="w-5 h-5 mr-2" />
              View All Cases
            </motion.button>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-outline text-sm"
                onClick={() => window.location.href = '/cases?status=new'}
              >
                New Cases ({stats?.status_breakdown?.new || 0})
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-outline text-sm"
                onClick={() => window.location.href = '/cases?status=in_progress'}
              >
                In Progress ({stats?.status_breakdown?.in_progress || 0})
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DCA Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">DCA Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Alpha Collections</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-dark-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '86%' }}></div>
                </div>
                <span className="text-green-400 text-sm">86%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Beta Recovery</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-dark-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-yellow-400 text-sm">75%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Gamma Solutions</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-dark-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
                <span className="text-green-400 text-sm">88%</span>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-outline mt-4"
            onClick={() => window.location.href = '/dcas'}
          >
            <Building2 className="w-5 h-5 mr-2" />
            Manage DCAs
          </motion.button>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">SLA Compliance</span>
              <span className="text-green-400">94.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">SLA Breaches</span>
              <span className="text-red-400">{stats?.sla_breaches || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Avg Resolution Time</span>
              <span className="text-blue-400">12.3 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">System Uptime</span>
              <span className="text-green-400">99.9%</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-outline mt-4"
            onClick={() => window.location.href = '/reports'}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            View Reports
          </motion.button>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
            onClick={() => window.location.href = '/upload'}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Cases
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
            onClick={() => window.location.href = '/cases?status=new'}
          >
            <FileText className="w-5 h-5 mr-2" />
            Review New Cases
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
            onClick={() => window.location.href = '/dcas'}
          >
            <Building2 className="w-5 h-5 mr-2" />
            Manage DCAs
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
            onClick={() => window.location.href = '/reports'}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Generate Reports
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}