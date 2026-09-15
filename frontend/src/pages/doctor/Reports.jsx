import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Eye } from 'lucide-react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { formatDate, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [uploadFormData, setUploadFormData] = useState({
    patient: '',
    test: '',
    findings: '',
    diagnosis: '',
    recommendations: '',
    status: 'completed',
  });

  useEffect(() => {
    fetchReports();
    fetchPatients();
    fetchTests();
  }, [currentPage, filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filters.status && { status: filters.status }),
      });
      const response = await api.get(`/doctor/reports?${params}`);
      setReports(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctor/patients/assigned');
      setPatients(response.data.data);
    } catch (error) {
      console.error('Failed to fetch patients');
    }
  };

  const fetchTests = async () => {
    try {
      const response = await api.get('/doctor/tests?limit=100');
      setTests(response.data.data);
    } catch (error) {
      console.error('Failed to fetch tests');
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patientId: uploadFormData.patient,
        testId: uploadFormData.test,
        findings: uploadFormData.findings,
        diagnosis: uploadFormData.diagnosis,
        recommendations: uploadFormData.recommendations,
        status: uploadFormData.status,
      };
      await api.post('/doctor/reports', payload);
      toast.success('Report uploaded successfully');
      setShowUploadModal(false);
      setUploadFormData({
        patient: '',
        test: '',
        findings: '',
        diagnosis: '',
        recommendations: '',
        status: 'completed',
      });
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload report');
    }
  };

  const handleEditReport = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        findings: uploadFormData.findings,
        diagnosis: uploadFormData.diagnosis,
        recommendations: uploadFormData.recommendations,
        status: uploadFormData.status,
      };
      await api.put(`/doctor/reports/${selectedReport._id}`, payload);
      toast.success('Report updated successfully');
      setShowEditModal(false);
      fetchReports();
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const openEditModal = (report) => {
    setSelectedReport(report);
    setUploadFormData({
      patient: report.patient._id,
      test: report.test._id,
      findings: report.findings || '',
      diagnosis: report.diagnosis || '',
      recommendations: report.recommendations || '',
      status: report.status,
    });
    setShowEditModal(true);
  };

  const openViewModal = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600 mt-1">View and manage patient reports</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reports List */}
      {reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No reports found"
            description="You haven't uploaded any reports yet"
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report._id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.test?.testName || 'Medical Report'}
                      </h3>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Report ID:</span>
                        <span className="ml-2 font-medium">{report.reportId}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Patient:</span>
                        <span className="ml-2 font-medium">
                          {report.patient?.user?.firstName} {report.patient?.user?.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Test Date:</span>
                        <span className="ml-2 font-medium">{formatDate(report.testDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Report Date:</span>
                        <span className="ml-2 font-medium">{formatDate(report.reportDate)}</span>
                      </div>
                    </div>

                    {report.findings && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600 mb-1">Findings:</p>
                        <p className="text-sm text-gray-900 line-clamp-2">{report.findings}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 lg:w-32">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => openViewModal(report)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => openEditModal(report)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
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

      {/* Upload Report Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload New Report"
      >
        <form onSubmit={handleUploadReport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={uploadFormData.patient}
              onChange={(e) => setUploadFormData({ ...uploadFormData, patient: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.user?.firstName} {patient.user?.lastName} ({patient.patientId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={uploadFormData.test}
              onChange={(e) => setUploadFormData({ ...uploadFormData, test: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Test</option>
              {tests.map((test) => (
                <option key={test._id} value={test._id}>
                  {test.testName} ({test.testCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
            <textarea
              rows="3"
              value={uploadFormData.findings}
              onChange={(e) => setUploadFormData({ ...uploadFormData, findings: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter test findings..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
            <textarea
              rows="3"
              value={uploadFormData.diagnosis}
              onChange={(e) => setUploadFormData({ ...uploadFormData, diagnosis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter diagnosis..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
            <textarea
              rows="3"
              value={uploadFormData.recommendations}
              onChange={(e) => setUploadFormData({ ...uploadFormData, recommendations: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter recommendations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={uploadFormData.status}
              onChange={(e) => setUploadFormData({ ...uploadFormData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Upload Report
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Report Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Report"
      >
        <form onSubmit={handleEditReport} className="space-y-4">
          {selectedReport && (
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Patient:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {selectedReport.patient?.user?.firstName} {selectedReport.patient?.user?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Test:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {selectedReport.test?.testName}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
            <textarea
              rows="3"
              value={uploadFormData.findings}
              onChange={(e) => setUploadFormData({ ...uploadFormData, findings: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
            <textarea
              rows="3"
              value={uploadFormData.diagnosis}
              onChange={(e) => setUploadFormData({ ...uploadFormData, diagnosis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
            <textarea
              rows="3"
              value={uploadFormData.recommendations}
              onChange={(e) => setUploadFormData({ ...uploadFormData, recommendations: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={uploadFormData.status}
              onChange={(e) => setUploadFormData({ ...uploadFormData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Update Report
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Report Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Report Details"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Report ID</p>
                <p className="font-medium text-gray-900">{selectedReport.reportId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor(selectedReport.status)}>
                  {selectedReport.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Patient</p>
                <p className="font-medium text-gray-900">
                  {selectedReport.patient?.user?.firstName} {selectedReport.patient?.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Test</p>
                <p className="font-medium text-gray-900">{selectedReport.test?.testName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Test Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedReport.testDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Report Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedReport.reportDate)}</p>
              </div>
            </div>

            {selectedReport.findings && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Findings</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded whitespace-pre-wrap">
                  {selectedReport.findings}
                </p>
              </div>
            )}

            {selectedReport.diagnosis && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Diagnosis</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded whitespace-pre-wrap">
                  {selectedReport.diagnosis}
                </p>
              </div>
            )}

            {selectedReport.recommendations && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Recommendations</h4>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded whitespace-pre-wrap">
                  {selectedReport.recommendations}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
