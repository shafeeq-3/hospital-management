import { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Edit, Trash2, UserPlus } from 'lucide-react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { formatDate, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    search: '',
  });
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    isActive: true,
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, filters.role, filters.isActive, filters.search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filters.role && { role: filters.role }),
        ...(filters.isActive && { isActive: filters.isActive }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await api.get(`/admin/users?${params}`);
      
      setUsers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      await api.put(`/admin/users/${editingUser._id}`, editFormData);
      toast.success('User updated successfully');
      handleCloseEditModal();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all system users</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description="No users match your search criteria"
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user._id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <Badge className={getStatusColor(user.isActive ? 'active' : 'inactive')}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 capitalize">
                        {user.role}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium">{user.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2 font-medium">{user.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Joined:</span>
                        <span className="ml-2 font-medium">{formatDate(user.createdAt)}</span>
                      </div>
                      {user.lastLogin && (
                        <div>
                          <span className="text-gray-600">Last Login:</span>
                          <span className="ml-2 font-medium">{formatDate(user.lastLogin)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(user)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit User"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editFormData.firstName}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editFormData.lastName}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editFormData.isActive}
                onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseEditModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Update User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
