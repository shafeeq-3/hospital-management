import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2 } from 'lucide-react';
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

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    targetAudience: ['all'],
    startDate: '',
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/announcements?page=${currentPage}&limit=10`);
      setAnnouncements(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        priority: announcement.priority,
        targetAudience: announcement.targetAudience || ['all'],
        startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : '',
        endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : '',
        isActive: announcement.isActive,
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium',
        targetAudience: ['all'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
  };

  const handleTargetAudienceChange = (value) => {
    if (value === 'all') {
      setFormData({ ...formData, targetAudience: ['all'] });
    } else {
      const current = formData.targetAudience.filter(a => a !== 'all');
      if (current.includes(value)) {
        const updated = current.filter(a => a !== value);
        setFormData({ ...formData, targetAudience: updated.length ? updated : ['all'] });
      } else {
        setFormData({ ...formData, targetAudience: [...current, value] });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message || !formData.startDate) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        isActive: formData.isActive,
      };

      // Only add dates if they exist
      if (formData.startDate) {
        submitData.startDate = new Date(formData.startDate);
      }
      if (formData.endDate) {
        submitData.endDate = new Date(formData.endDate);
      }

      if (editingAnnouncement) {
        await api.put(`/admin/announcements/${editingAnnouncement._id}`, submitData);
        toast.success('Announcement updated successfully');
      } else {
        await api.post('/admin/announcements', submitData);
        toast.success('Announcement created successfully');
      }
      handleCloseModal();
      fetchAnnouncements();
    } catch (error) {
      console.error('Announcement error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this announcement?')) return;

    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.success('Announcement deactivated successfully');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to deactivate announcement');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Manage system-wide announcements</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <EmptyState
            icon={Megaphone}
            title="No announcements"
            description="Create your first announcement to notify users"
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement._id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      <Badge className={getStatusColor(announcement.isActive ? 'active' : 'inactive')}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                      <Badge className="bg-indigo-100 text-indigo-800 capitalize">
                        {announcement.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700">{announcement.message}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Target:</span>
                        <span className="ml-2 font-medium capitalize">
                          {announcement.targetAudience?.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Start Date:</span>
                        <span className="ml-2 font-medium">{formatDate(announcement.startDate)}</span>
                      </div>
                      {announcement.endDate && (
                        <div>
                          <span className="text-gray-600">End Date:</span>
                          <span className="ml-2 font-medium">{formatDate(announcement.endDate)}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <span className="ml-2 font-medium">{formatDate(announcement.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(announcement)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement._id)}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="urgent">Urgent</option>
                <option value="maintenance">Maintenance</option>
                <option value="event">Event</option>
                <option value="policy">Policy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <div className="space-y-2">
              {['all', 'patient', 'doctor', 'staff'].map((audience) => (
                <label key={audience} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.targetAudience.includes(audience)}
                    onChange={() => handleTargetAudienceChange(audience)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{audience}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingAnnouncement ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Announcements;
