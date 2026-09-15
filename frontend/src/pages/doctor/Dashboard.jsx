import { useState, useEffect } from 'react';
import { Users, FileText, Calendar, Activity, Megaphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';

const DoctorDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    assignedPatients: 0,
    totalReports: 0,
    recentReports: [],
    recentPatients: [],
    announcements: [],
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [patientsRes, reportsRes, announcementsRes] = await Promise.all([
        api.get('/doctor/patients/assigned'),
        api.get('/doctor/reports?limit=5'),
        api.get('/doctor/announcements?limit=5'),
      ]);

      setDashboardData({
        assignedPatients: patientsRes.data.data.length,
        totalReports: reportsRes.data.pagination?.totalItems || 0,
        recentReports: reportsRes.data.data.slice(0, 3),
        recentPatients: patientsRes.data.data.slice(0, 3),
        announcements: announcementsRes.data.data.slice(0, 3),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Assigned Patients',
      value: dashboardData.assignedPatients,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Reports Generated',
      value: dashboardData.totalReports,
      icon: FileText,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Announcements',
      value: dashboardData.announcements.length,
      icon: Megaphone,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Consultation Fee',
      value: formatCurrency(profile?.consultationFee || 0),
      icon: Activity,
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
          Welcome, Dr. {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mt-2">
          {profile?.specialization} | {profile?.department} Department
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
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Professional Details */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Qualification:</span>
              <span className="font-medium text-gray-900">{profile?.qualification}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Experience:</span>
              <span className="font-medium text-gray-900">{profile?.experience} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">License Number:</span>
              <span className="font-medium text-gray-900">{profile?.licenseNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Doctor ID:</span>
              <span className="font-medium text-gray-900">{profile?.doctorId}</span>
            </div>
          </div>
        </Card>

        {/* Availability Schedule */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Schedule</h3>
          <div className="space-y-2">
            {profile?.availability && profile.availability.length > 0 ? (
              profile.availability.slice(0, 4).map((slot, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{slot.day}</span>
                  <span className="text-gray-600">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No schedule available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
          <button
            onClick={() => navigate('/doctor/patients')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        {dashboardData.recentPatients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No patients assigned yet</p>
        ) : (
          <div className="space-y-3">
            {dashboardData.recentPatients.map((patient) => (
              <div
                key={patient._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate('/doctor/patients')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {patient.user?.firstName} {patient.user?.lastName}
                      </h4>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {patient.patientId}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      <span>Blood: {patient.bloodGroup || 'N/A'}</span>
                      <span>Gender: {patient.gender}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Reports */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
          <button
            onClick={() => navigate('/doctor/reports')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        {dashboardData.recentReports.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reports generated yet</p>
        ) : (
          <div className="space-y-3">
            {dashboardData.recentReports.map((report) => (
              <div
                key={report._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate('/doctor/reports')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {report.test?.testName || 'Medical Report'}
                      </h4>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Patient: {report.patient?.user?.firstName} {report.patient?.user?.lastName}</span>
                      <span>{formatDate(report.reportDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Announcements */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
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
    </div>
  );
};

export default DoctorDashboard;
