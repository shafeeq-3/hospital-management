import { useState, useEffect } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { formatDate, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patient/reports?page=${currentPage}&limit=10`);
      setReports(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medical Reports</h1>
        <p className="text-gray-600 mt-1">View and download your medical reports</p>
      </div>

      {reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No reports found"
            description="You don't have any medical reports yet"
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
                        <span className="text-gray-600">Test Date:</span>
                        <span className="ml-2 font-medium">{formatDate(report.testDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Doctor:</span>
                        <span className="ml-2 font-medium">
                          Dr. {report.doctor?.user?.firstName} {report.doctor?.user?.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Report Date:</span>
                        <span className="ml-2 font-medium">{formatDate(report.reportDate)}</span>
                      </div>
                    </div>

                    {report.findings && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600 mb-1">Findings:</p>
                        <p className="text-sm text-gray-900">{report.findings}</p>
                      </div>
                    )}

                    {report.diagnosis && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600 mb-1">Diagnosis:</p>
                        <p className="text-sm text-gray-900">{report.diagnosis}</p>
                      </div>
                    )}

                    {report.recommendations && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600 mb-1">Recommendations:</p>
                        <p className="text-sm text-gray-900">{report.recommendations}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-32">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {report.attachments && report.attachments.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(report.attachments[0].fileUrl, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
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
    </div>
  );
};

export default Reports;
