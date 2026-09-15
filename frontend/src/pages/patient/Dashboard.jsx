import { useState, useEffect } from 'react';
import { FileText, DollarSign, CreditCard, AlertCircle, User, Calendar, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    totalDue: 0,
    totalPaid: 0,
    recentReports: [],
    recentBillings: [],
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reportsRes, dueRes, billingsRes, paymentsRes] = await Promise.all([
        api.get('/patient/reports?limit=5'),
        api.get('/patient/total-due'),
        api.get('/patient/billings?limit=5'),
        api.get('/patient/payments?limit=5'),
      ]);

      const reports = reportsRes.data.data;
      const payments = paymentsRes.data.data;

      setDashboardData({
        totalReports: reportsRes.data.pagination.totalItems,
        pendingReports: reports.filter(r => r.status === 'pending' || r.status === 'in-progress').length,
        completedReports: reports.filter(r => r.status === 'completed' || r.status === 'reviewed').length,
        totalDue: dueRes.data.data.totalDue,
        totalPaid: payments.filter(p => p.paymentStatus === 'completed').reduce((sum, p) => sum + p.amount, 0),
        recentReports: reports.slice(0, 3),
        recentBillings: billingsRes.data.data.slice(0, 3),
        recentPayments: payments.slice(0, 3),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName} {user?.lastName}!
        </h1>
        <p className="text-blue-100">
          Patient ID: {profile?.patientId || 'N/A'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalReports}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Reports</p>
              <p className="text-3xl font-bold text-yellow-600">{dashboardData.pendingReports}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Amount Due</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(dashboardData.totalDue)}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Paid</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(dashboardData.totalPaid)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Blood Group:</span>
              <span className="font-medium text-gray-900">{profile?.bloodGroup || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-medium text-gray-900 capitalize">{profile?.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date of Birth:</span>
              <span className="font-medium text-gray-900">{formatDate(profile?.dateOfBirth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">{user?.phone}</span>
            </div>
            {profile?.assignedDoctor && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-1">Assigned Doctor:</p>
                <p className="font-medium text-gray-900">
                  Dr. {profile.assignedDoctor.user?.firstName} {profile.assignedDoctor.user?.lastName}
                </p>
                <p className="text-sm text-gray-600">{profile.assignedDoctor.specialization}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Medical Info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-2">Allergies:</p>
              <div className="flex flex-wrap gap-2">
                {profile?.allergies && profile.allergies.length > 0 ? (
                  profile.allergies.map((allergy, idx) => (
                    <Badge key={idx} className="bg-red-100 text-red-800">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No known allergies</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Medications:</p>
              <div className="flex flex-wrap gap-2">
                {profile?.currentMedications && profile.currentMedications.length > 0 ? (
                  profile.currentMedications.map((med, idx) => (
                    <Badge key={idx} className="bg-blue-100 text-blue-800">
                      {med}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No current medications</span>
                )}
              </div>
            </div>
            {profile?.emergencyContact && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-1">Emergency Contact:</p>
                <p className="font-medium text-gray-900">{profile.emergencyContact.name}</p>
                <p className="text-sm text-gray-600">{profile.emergencyContact.phone}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
          <button
            onClick={() => navigate('/patient/reports')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>

        {dashboardData.recentReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No reports available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboardData.recentReports.map((report) => (
              <div
                key={report._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate('/patient/reports')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{report.test?.testName}</h4>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Dr. {report.doctor?.user?.firstName} {report.doctor?.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(report.reportDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Billings */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bills</h3>
          <button
            onClick={() => navigate('/patient/billing')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>

        {dashboardData.recentBillings.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No bills available</p>
        ) : (
          <div className="space-y-3">
            {dashboardData.recentBillings.map((bill) => (
              <div
                key={bill._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate('/patient/billing')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{bill.billId}</h4>
                      <Badge className={getStatusColor(bill.paymentStatus)}>
                        {bill.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Total: {formatCurrency(bill.totalAmount)}</span>
                      <span>Due: {formatCurrency(bill.dueAmount)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Due Date: {formatDate(bill.dueDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/patient/billing')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Pay Bills</span>
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
          </button>
          <button
            onClick={() => navigate('/patient/reports')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">View Reports</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </button>
          <button
            onClick={() => navigate('/patient/payments')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Payment History</span>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </button>
          <button
            onClick={() => navigate('/patient/profile')}
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Update Profile</span>
              <User className="w-5 h-5 text-orange-600" />
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
