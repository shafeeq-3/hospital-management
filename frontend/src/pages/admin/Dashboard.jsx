import { useState, useEffect } from 'react';
import { Users, UserCheck, Stethoscope, FileText, DollarSign, Activity } from 'lucide-react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Doctors',
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Staff',
      value: stats?.totalStaff || 0,
      icon: Activity,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Reports',
      value: stats?.totalReports || 0,
      icon: FileText,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Total Payments',
      value: stats?.totalPayments || 0,
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your hospital overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/admin/users"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Manage Users</span>
                <Users className="w-5 h-5 text-gray-600" />
              </div>
            </a>
            <a
              href="/admin/tests"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Manage Tests</span>
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
            </a>
            <a
              href="/admin/salaries"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Manage Salaries</span>
                <DollarSign className="w-5 h-5 text-gray-600" />
              </div>
            </a>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">System Health</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Online
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
