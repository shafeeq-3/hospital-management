import { useState, useEffect } from 'react';
import { DollarSign, Filter } from 'lucide-react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Salaries = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [filters, setFilters] = useState({
    employeeType: '',
    paymentStatus: '',
  });

  useEffect(() => {
    fetchSalaries();
  }, [currentPage, filters]);

  const fetchSalaries = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filters.employeeType && { employeeType: filters.employeeType }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      });

      const response = await api.get(`/admin/salaries?${params}`);
      setSalaries(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to fetch salaries');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (salaryId, status) => {
    try {
      await api.put(`/admin/salaries/${salaryId}`, {
        paymentStatus: status,
        paymentDate: status === 'paid' ? new Date() : null,
      });
      toast.success('Salary status updated');
      fetchSalaries();
    } catch (error) {
      toast.error('Failed to update salary status');
    }
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const handleViewDetails = (salary) => {
    setSelectedSalary(salary);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedSalary(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Salary Management</h1>
          <p className="text-gray-600 mt-1">Manage employee salaries and payments</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={filters.employeeType}
            onChange={(e) => setFilters({ ...filters, employeeType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Employee Types</option>
            <option value="doctor">Doctor</option>
            <option value="staff">Staff</option>
          </select>

          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
          </select>
        </div>
      </Card>

      {/* Salaries List */}
      {salaries.length === 0 ? (
        <Card>
          <EmptyState
            icon={DollarSign}
            title="No salary records found"
            description="No salary records match your criteria"
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {salaries.map((salary) => (
              <Card key={salary._id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {salary.employee?.firstName} {salary.employee?.lastName}
                      </h3>
                      <Badge className={getStatusColor(salary.employeeType)}>
                        {salary.employeeType}
                      </Badge>
                      <Badge className={getStatusColor(salary.paymentStatus)}>
                        {salary.paymentStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Period:</span>
                        <span className="ml-2 font-medium">
                          {getMonthName(salary.month)} {salary.year}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Base Salary:</span>
                        <span className="ml-2 font-medium">{formatCurrency(salary.baseSalary)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Allowances:</span>
                        <span className="ml-2 font-medium text-green-600">
                          +{formatCurrency(salary.allowances)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Deductions:</span>
                        <span className="ml-2 font-medium text-red-600">
                          -{formatCurrency(salary.deductions)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Net Salary:</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(salary.netSalary)}
                        </span>
                      </div>
                      {salary.paymentDate && (
                        <div className="text-sm text-gray-600 mt-1">
                          Paid on: {formatDate(salary.paymentDate)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-32">
                    {salary.paymentStatus === 'pending' && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleUpdateStatus(salary._id, 'paid')}
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewDetails(salary)}
                    >
                      View Details
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

      {/* Salary Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        title="Salary Details"
      >
        {selectedSalary && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Employee</p>
                <p className="font-medium text-gray-900">
                  {selectedSalary.employee?.firstName} {selectedSalary.employee?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{selectedSalary.employee?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Employee Type</p>
                <Badge className={getStatusColor(selectedSalary.employeeType)}>
                  {selectedSalary.employeeType}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Salary ID</p>
                <p className="font-medium text-gray-900">{selectedSalary.salaryId}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Salary Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Period</span>
                  <span className="font-medium">
                    {getMonthName(selectedSalary.month)} {selectedSalary.year}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Base Salary</span>
                  <span className="font-medium">{formatCurrency(selectedSalary.baseSalary)}</span>
                </div>
                <div className="flex justify-between p-3 bg-green-50 rounded">
                  <span className="text-gray-600">Allowances</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(selectedSalary.allowances)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-green-50 rounded">
                  <span className="text-gray-600">Bonuses</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(selectedSalary.bonuses)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded">
                  <span className="text-gray-600">Deductions</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(selectedSalary.deductions)}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <span className="font-semibold text-gray-900">Net Salary</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(selectedSalary.netSalary)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Payment Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Payment Status</span>
                  <Badge className={getStatusColor(selectedSalary.paymentStatus)}>
                    {selectedSalary.paymentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium capitalize">
                    {selectedSalary.paymentMethod?.replace('-', ' ')}
                  </span>
                </div>
                {selectedSalary.paymentDate && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Payment Date</span>
                    <span className="font-medium">{formatDate(selectedSalary.paymentDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedSalary.notes && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Notes</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                  {selectedSalary.notes}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseModal} className="flex-1">
                Close
              </Button>
              {selectedSalary.paymentStatus === 'pending' && (
                <Button
                  onClick={() => {
                    handleUpdateStatus(selectedSalary._id, 'paid');
                    handleCloseModal();
                  }}
                  className="flex-1"
                >
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Salaries;
