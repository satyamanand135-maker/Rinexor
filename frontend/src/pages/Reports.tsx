import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';
import type { ReportData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatPercentage, formatDate } from '../lib/utils';

export default function Reports() {
  const [dcaPerformance, setDcaPerformance] = useState<ReportData | null>(null);
  const [recoveryTrends, setRecoveryTrends] = useState<any>(null);
  const [slaCompliance, setSlaCompliance] = useState<any>(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedReport, setSelectedReport] = useState<'performance' | 'trends' | 'sla' | 'portfolio'>('performance');

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      const [performance, trends, sla, portfolio] = await Promise.all([
        api.getDCAPerformance(selectedPeriod),
        api.getRecoveryTrends(selectedPeriod),
        api.getSLACompliance(selectedPeriod),
        api.getPortfolioAnalysis(),
      ]);

      setDcaPerformance(performance);
      setRecoveryTrends(trends);
      setSlaCompliance(sla);
      setPortfolioAnalysis(portfolio);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (reportType: string, data: any) => {
    const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner text="Loading reports..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-dark-400 mt-1">Comprehensive insights into your collection performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={fetchReports}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Period Selection */}
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-dark-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="input-field"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 6 months</option>
              <option value={365}>Last year</option>
            </select>
          </div>

          {/* Report Type Selection */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-dark-400" />
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as any)}
              className="input-field"
            >
              <option value="performance">DCA Performance</option>
              <option value="trends">Recovery Trends</option>
              <option value="sla">SLA Compliance</option>
              <option value="portfolio">Portfolio Analysis</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card p-6">
          <div className="text-center text-red-400">
            <p>{error}</p>
            <button onClick={fetchReports} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* DCA Performance Report */}
      {selectedReport === 'performance' && dcaPerformance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">DCA Performance Report</h3>
              <p className="text-sm text-dark-400">
                {formatDate(dcaPerformance.period_start)} - {formatDate(dcaPerformance.period_end)}
              </p>
            </div>
            <motion.button
              onClick={() => exportReport('dca_performance', dcaPerformance)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </motion.button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800/50 border-b border-dark-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">DCA</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Cases Assigned</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Cases Resolved</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Resolution Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Amount Recovered</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Recovery Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Avg Days</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">SLA Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {dcaPerformance.performance_data.map((dca) => (
                  <tr key={dca.dca_id} className="hover:bg-dark-800/30">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{dca.dca_name}</div>
                        <div className="text-sm text-dark-400">{dca.dca_code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{dca.cases_assigned}</td>
                    <td className="px-6 py-4 text-sm text-white">{dca.cases_resolved}</td>
                    <td className="px-6 py-4 text-sm text-green-400">
                      {formatPercentage(dca.resolution_rate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {formatCurrency(dca.amount_recovered)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-400">
                      {formatPercentage(dca.recovery_rate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{dca.avg_resolution_days}</td>
                    <td className="px-6 py-4 text-sm text-blue-400">
                      {formatPercentage(dca.sla_compliance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Recovery Trends */}
      {selectedReport === 'trends' && recoveryTrends && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Recovery Trends</h3>
              <p className="text-sm text-dark-400">Daily recovery performance over time</p>
            </div>
            <motion.button
              onClick={() => exportReport('recovery_trends', recoveryTrends)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(recoveryTrends.total_recovered || 0)}
              </div>
              <div className="text-sm text-green-300">Total Recovered</div>
            </div>
            
            <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">
                {formatPercentage(recoveryTrends.avg_recovery_rate || 0)}
              </div>
              <div className="text-sm text-blue-300">Avg Recovery Rate</div>
            </div>
            
            <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">
                {recoveryTrends.best_day || 'N/A'}
              </div>
              <div className="text-sm text-purple-300">Best Performance Day</div>
            </div>
          </div>

          <div className="text-center text-dark-400 py-8">
            <BarChart3 className="w-16 h-16 mx-auto mb-4" />
            <p>Chart visualization would be displayed here</p>
            <p className="text-sm">Integration with charting library needed</p>
          </div>
        </motion.div>
      )}

      {/* SLA Compliance */}
      {selectedReport === 'sla' && slaCompliance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">SLA Compliance Report</h3>
              <p className="text-sm text-dark-400">Service level agreement performance metrics</p>
            </div>
            <motion.button
              onClick={() => exportReport('sla_compliance', slaCompliance)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {formatPercentage(slaCompliance.overall_compliance || 0)}
              </div>
              <div className="text-sm text-green-300">Overall Compliance</div>
            </div>
            
            <div className="text-center p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {slaCompliance.on_time_contacts || 0}
              </div>
              <div className="text-sm text-blue-300">On-Time Contacts</div>
            </div>
            
            <div className="text-center p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {slaCompliance.late_contacts || 0}
              </div>
              <div className="text-sm text-yellow-300">Late Contacts</div>
            </div>
            
            <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-3xl font-bold text-red-400 mb-2">
                {slaCompliance.breaches || 0}
              </div>
              <div className="text-sm text-red-300">SLA Breaches</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Portfolio Analysis */}
      {selectedReport === 'portfolio' && portfolioAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Portfolio Analysis</h3>
              <p className="text-sm text-dark-400">Comprehensive portfolio insights and recommendations</p>
            </div>
            <motion.button
              onClick={() => exportReport('portfolio_analysis', portfolioAnalysis)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Key Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-400">Total Portfolio Value</span>
                  <span className="text-white font-medium">
                    {formatCurrency(portfolioAnalysis.total_value || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Average Case Value</span>
                  <span className="text-white font-medium">
                    {formatCurrency(portfolioAnalysis.avg_case_value || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Recovery Potential</span>
                  <span className="text-green-400 font-medium">
                    {formatPercentage(portfolioAnalysis.recovery_potential || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Risk Distribution</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-400">High Risk</span>
                  <span className="text-red-400 font-medium">
                    {portfolioAnalysis.high_risk_count || 0} cases
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Medium Risk</span>
                  <span className="text-yellow-400 font-medium">
                    {portfolioAnalysis.medium_risk_count || 0} cases
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Low Risk</span>
                  <span className="text-green-400 font-medium">
                    {portfolioAnalysis.low_risk_count || 0} cases
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}