import { useState, useEffect } from 'react';
import { Briefcase, DollarSign, Calendar, Clock, Megaphone, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    announcements: [],
    upcomingShifts: [],
    recentSalary: null,
    totalPaid: 0,
    totalPending: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [announcementsRes, salaryRes] = await Promise.all([
        api.get('/staff/announcements?limit=5'),
        api.get('/staff/salary'),
      ]);

      const salaryHistory = salaryRes.data.data.salaryHistory || [];
      const totalPaid = salaryHistory
        .filter(s => s.paymentStatus === 'paid')
        .reduce((sum, s) => sum + s.netSalary, 0);
      const totalPending = salaryHistory
        .filter(s => s.paymentStatus === 'pending')
        .reduce((sum, s) => sum + s.netSalary, 0);

      setDashboardData({
        announcements: announcementsRes.data.data.slice(0, 3),
        recentSalary: salaryHistory[0] || null,
        totalPaid,
        totalPending,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Position',
      value: profile?.position || 'N/A',
      icon: Briefcase,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Department',
      value: profile?.department || 'N/A',
      icon: Calendar,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Monthly Salary',
      value: formatCurrency(profile?.salary || 0),
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Shift',
      value: profile?.shift ? profile.shift.charAt(0).toUpperCase() + profile.shift.slice(1) : 'N/A',
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mt-2">
          {profile?.position} | {profile?.department} Department
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Salary Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(dashboardData.totalPaid)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {formatCurrency(dashboardData.totalPending)}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Announcements</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {dashboardData.announcements.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Megaphone className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employment Details */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Staff ID:</span>
              <span className="font-medium text-gray-900">{profile?.staffId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Employment Type:</span>
              <span className="font-medium text-gray-900 capitalize">
                {profile?.employeeType?.replace('-', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shift:</span>
              <span className="font-medium text-gray-900 capitalize">{profile?.shift}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Joining Date:</span>
              <span className="font-medium text-gray-900">
                {profile?.joiningDate ? formatDate(profile.joiningDate) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">{user?.phone}</span>
            </div>
          </div>
        </Card>

        {/* Recent Salary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Salary</h3>
            <button
              onClick={() => navigate('/staff/salary')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          {dashboardData.recentSalary ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Period:</span>
                <span className="font-medium text-gray-900">
                  {new Date(2024, dashboardData.recentSalary.month - 1).toLocaleString('default', { month: 'long' })} {dashboardData.recentSalary.year}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Base Salary:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(dashboardData.recentSalary.baseSalary)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Net Salary:</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatCurrency(dashboardData.recentSalary.netSalary)}
                </span>
              </div>
              <div className="pt-2 border-t">
                <Badge className={dashboardData.recentSalary.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {dashboardData.recentSalary.paymentStatus}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No salary records available</p>
          )}
        </Card>
      </div>

      {/* Recent Announcements */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
          <button
            onClick={() => navigate('/staff/announcements')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        {dashboardData.announcements.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No announcements available</p>
        ) : (
          <div className="space-y-3">
            {dashboardData.announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                      <Badge className={
                        announcement.type === 'urgent' ? 'bg-red-100 text-red-800' :
                        announcement.type === 'general' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {announcement.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{announcement.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(announcement.startDate)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/staff/salary')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">View Salary</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </button>
          <button
            onClick={() => navigate('/staff/schedule')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">View Schedule</span>
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </button>
          <button
            onClick={() => navigate('/staff/profile')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Update Profile</span>
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default StaffDashboard;
