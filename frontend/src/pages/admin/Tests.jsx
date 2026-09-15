import { useState, useEffect } from 'react';
import { TestTube, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { formatCurrency, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ category: '', isActive: '' });
  const [formData, setFormData] = useState({
    testName: '',
    testCode: '',
    category: 'Blood Test',
    description: '',
    price: '',
    duration: '',
    preparationInstructions: '',
    normalRange: '',
    isActive: true,
  });

  useEffect(() => {
    fetchTests();
  }, [currentPage, filters]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filters.category && { category: filters.category }),
        ...(filters.isActive && { isActive: filters.isActive }),
      });
      const response = await api.get(`/admin/tests?${params}`);
      setTests(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (test = null) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        testName: test.testName,
        testCode: test.testCode,
        category: test.category,
        description: test.description || '',
        price: test.price,
        duration: test.duration || '',
        preparationInstructions: test.preparationInstructions || '',
        normalRange: test.normalRange || '',
        isActive: test.isActive,
      });
    } else {
      setEditingTest(null);
      setFormData({
        testName: '',
        testCode: '',
        category: 'Blood Test',
        description: '',
        price: '',
        duration: '',
        preparationInstructions: '',
        normalRange: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTest(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.testName || !formData.testCode || !formData.price || !formData.description || !formData.duration) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const submitData = {
        testName: formData.testName,
        testCode: formData.testCode,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: formData.duration,
        isActive: formData.isActive,
        ...(formData.preparationInstructions && { preparationInstructions: formData.preparationInstructions }),
        ...(formData.normalRange && { normalRange: formData.normalRange }),
      };

      if (editingTest) {
        await api.put(`/admin/tests/${editingTest._id}`, submitData);
        toast.success('Test updated successfully');
      } else {
        await api.post('/admin/tests', submitData);
        toast.success('Test created successfully');
      }
      handleCloseModal();
      fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (testId) => {
    if (!confirm('Are you sure you want to deactivate this test?')) return;

    try {
      await api.delete(`/admin/tests/${testId}`);
      toast.success('Test deactivated successfully');
      fetchTests();
    } catch (error) {
      toast.error('Failed to deactivate test');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Test Management</h1>
          <p className="text-gray-600 mt-1">Manage medical tests and procedures</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Test
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="Blood Test">Blood Test</option>
              <option value="Urine Test">Urine Test</option>
              <option value="Imaging">Imaging</option>
              <option value="Pathology">Pathology</option>
              <option value="Radiology">Radiology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Other">Other</option>
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

      {tests.length === 0 ? (
        <Card>
          <EmptyState
            icon={TestTube}
            title="No tests found"
            description="Start by adding your first medical test"
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {tests.map((test) => (
              <Card key={test._id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{test.testName}</h3>
                      <Badge className={getStatusColor(test.isActive ? 'active' : 'inactive')}>
                        {test.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 capitalize">
                        {test.category}
                      </Badge>
                    </div>

                    {test.description && (
                      <p className="text-sm text-gray-600">{test.description}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Test Code:</span>
                        <span className="ml-2 font-medium">{test.testCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Price:</span>
                        <span className="ml-2 font-bold text-green-600">{formatCurrency(test.price)}</span>
                      </div>
                      {test.duration && (
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-medium">{test.duration}</span>
                        </div>
                      )}
                    </div>

                    {test.preparationInstructions && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600 mb-1">Preparation:</p>
                        <p className="text-sm text-gray-900">{test.preparationInstructions}</p>
                      </div>
                    )}

                    {test.normalRange && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600 mb-1">Normal Range:</p>
                        <p className="text-sm text-gray-900">{test.normalRange}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(test)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(test._id)}
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
        title={editingTest ? 'Edit Test' : 'Add New Test'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.testName}
                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.testCode}
                onChange={(e) => setFormData({ ...formData, testCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Blood Test">Blood Test</option>
                <option value="Urine Test">Urine Test</option>
                <option value="Imaging">Imaging</option>
                <option value="Pathology">Pathology</option>
                <option value="Radiology">Radiology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 30 minutes"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Instructions</label>
            <textarea
              rows="2"
              value={formData.preparationInstructions}
              onChange={(e) => setFormData({ ...formData, preparationInstructions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Normal Range</label>
            <input
              type="text"
              placeholder="e.g., 70-100 mg/dL"
              value={formData.normalRange}
              onChange={(e) => setFormData({ ...formData, normalRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingTest ? 'Update Test' : 'Create Test'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tests;
