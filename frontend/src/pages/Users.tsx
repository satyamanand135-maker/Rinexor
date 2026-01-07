import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  UserX,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import type { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';

const roleColors = {
  enterprise_admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  collection_manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  dca_agent: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const roleLabels = {
  enterprise_admin: 'Enterprise Admin',
  collection_manager: 'Collection Manager',
  dca_agent: 'DCA Agent',
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await api.deactivateUser(userId);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only enterprise admins can access this page
  if (currentUser?.role !== 'enterprise_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-dark-400 mt-1">Manage system users and their permissions</p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </motion.button>
      </div>

      {/* Search */}
      <div className="glass-card p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="glass-card p-6">
          <div className="text-center text-red-400">
            <p>{error}</p>
            <button onClick={fetchUsers} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="glass-card p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user.full_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{user.full_name}</h3>
                  <p className="text-sm text-dark-400">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {user.is_active ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>

            {/* Role */}
            <div className="mb-4">
              <span className={`status-badge ${roleColors[user.role]}`}>
                <Shield className="w-3 h-3 mr-1" />
                {roleLabels[user.role]}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-dark-300">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-dark-300">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(user.created_at)}</span>
              </div>
              {user.dca_id && (
                <div className="flex items-center space-x-2 text-dark-300">
                  <Shield className="w-4 h-4" />
                  <span>DCA ID: {user.dca_id}</span>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="mb-4">
              <div className={`text-sm px-3 py-1 rounded-full inline-flex items-center ${
                user.is_active 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-700">
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-dark-400 hover:text-accent-400 rounded-lg hover:bg-accent-600/10"
                  title="Edit User"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                
                {user.is_active && user.id !== currentUser?.id && (
                  <motion.button
                    onClick={() => handleDeactivateUser(user.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-dark-400 hover:text-red-400 rounded-lg hover:bg-red-600/10"
                    title="Deactivate User"
                  >
                    <UserX className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              <div className="text-xs text-dark-500">
                {user.updated_at && `Updated ${formatDate(user.updated_at)}`}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <div className="glass-card p-12 text-center">
          <Shield className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
          <p className="text-dark-400 mb-6">
            {searchTerm 
              ? 'No users match your search criteria.' 
              : 'Get started by adding your first user.'}
          </p>
          {!searchTerm && (
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First User
            </motion.button>
          )}
        </div>
      )}

      {/* Create User Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Add New User</h3>
            <p className="text-dark-400 mb-6">
              User creation form would be implemented here with proper validation and API integration.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button className="btn-primary">
                Create User
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}