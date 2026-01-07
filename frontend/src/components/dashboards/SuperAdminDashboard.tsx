import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  FileText,
  Building2,
  Users,
  AlertTriangle,
  Calendar,
  Target,
  BarChart3,
  Shield,
  Activity,
  Eye,
} from 'lucide-react';
import { api } from '../../lib/api';
import type { DashboardStats } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { formatCurrency, formatPercentage } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

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

export default function SuperAdminDashboard() {
  const { user } = useAuth();
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
      {/* Header with Role Verification */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl font-bold text-white">System Monitoring Dashboard</h1>
          </div>
          <p className="text-dark-400">Super Admin - System Overview & Performance Analytics Only</p>
          <div className="flex items-center space-x-2 mt-2">
            <Eye className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">READ-ONLY ACCESS - NO CASE UPLOADS</span>
          </div>
          <p className="text-xs text-dark-500 mt-1">Logged in as: {user?.email} ({user?.role}) - v2.0</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-dark-400">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {stats ? new Date(stats.last_updated).toLocaleString() : 'N/A'}</span>
        </div>
      </div>

      {/* System Overview Stats - MONITORING ONLY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Portfolio Value"
          value={formatCurrency(stats?.total_amount || 0)}
          change="+8% from last month"
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-500/20"
        />
        
        <StatCard
          title="System Cases"
          value={stats?.total_cases.toLocaleString() || '0'}
          change="+12% from last month"
          trend="up"
          icon={<FileText className="w-6 h-6 text-white" />}
          color="bg-blue-500/20"
        />
        
        <StatCard
          title="Active DCAs"
          value={stats?.active_dcas || '0'}
          change="All operational"
          trend="up"
          icon={<Building2 className="w-6 h-6 text-white" />}
          color="bg-purple-500/20"
        />
        
        <StatCard
          title="System Recovery Rate"
          value={formatPercentage(stats?.recovery_rate || 0)}
          change="+2.3% from last month"
          trend="up"
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-orange-500/20"
        />
      </div>

      {/* DCA Performance Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-primary-400" />
          DCA Performance Monitoring
        </h3>
        <p className="text-dark-400 mb-6">Real-time performance tracking across all debt collection agencies</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
            <div>
              <span className="text-white font-medium">Alpha Collections</span>
              <p className="text-sm text-dark-400">High-value cases specialist</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-dark-400">Performance</div>
                <div className="text-green-400 font-semibold">86%</div>
              </div>
              <div className="w-32 bg-dark-700 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '86%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
            <div>
              <span className="text-white font-medium">Beta Recovery</span>
              <p className="text-sm text-dark-400">Medium priority cases</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-dark-400">Performance</div>
                <div className="text-yellow-400 font-semibold">75%</div>
              </div>
              <div className="w-32 bg-dark-700 rounded-full h-3">
                <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
            <div>
              <span className="text-white font-medium">Gamma Solutions</span>
              <p className="text-sm text-dark-400">Specialized recovery</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-dark-400">Performance</div>
                <div className="text-green-400 font-semibold">88%</div>
              </div>
              <div className="w-32 bg-dark-700 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
            <div>
              <span className="text-white font-medium">Delta Agency</span>
              <p className="text-sm text-dark-400">General collections</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-dark-400">Performance</div>
                <div className="text-orange-400 font-semibold">72%</div>
              </div>
              <div className="w-32 bg-dark-700 rounded-full h-3">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* System Health & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-green-400" />
            System Health Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Overall SLA Compliance</span>
              <span className="text-green-400 font-semibold">94.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Active SLA Breaches</span>
              <span className="text-red-400 font-semibold">{stats?.sla_breaches || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">System Recovery Rate</span>
              <span className="text-blue-400 font-semibold">{formatPercentage(stats?.recovery_rate || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Average Resolution Time</span>
              <span className="text-purple-400 font-semibold">12.3 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">System Uptime</span>
              <span className="text-green-400 font-semibold">99.9%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-400" />
            Case Status Overview
          </h3>
          {stats?.status_breakdown && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(stats.status_breakdown).map(([status, count]) => (
                <div key={status} className="text-center p-3 bg-dark-800/50 rounded-lg">
                  <div className="text-xl font-bold text-white">{count}</div>
                  <div className="text-xs text-dark-400 capitalize">
                    {status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Monitoring Actions - NO UPLOAD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-red-400" />
          System Administration - Monitoring Only
        </h3>
        <p className="text-dark-400 mb-6">Access system reports, manage users, and monitor DCA performance</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
            onClick={() => window.location.href = '/reports'}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            View System Reports
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
            onClick={() => window.location.href = '/users'}
          >
            <Users className="w-5 h-5 mr-2" />
            Manage Users
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
            onClick={() => window.location.href = '/dcas'}
          >
            <Building2 className="w-5 h-5 mr-2" />
            Monitor DCAs
          </motion.button>
        </div>

        {/* Warning Notice */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Super Admin Notice</span>
          </div>
          <p className="text-yellow-200 text-sm mt-2">
            As a Super Admin, you have read-only access for system monitoring. 
            Case uploads and operational tasks are handled by Enterprise Admins.
          </p>
        </div>
      </motion.div>
    </div>
  );
}