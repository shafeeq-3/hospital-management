import { useState, useEffect } from 'react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/staff/profile');
      setProfile(data.data);
      setSchedule(data.data.shiftSchedule || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const getShiftBadge = (shift) => {
    const variants = {
      morning: 'info',
      evening: 'warning',
      night: 'default',
      off: 'error'
    };
    return <Badge variant={variants[shift] || 'default'}>{shift}</Badge>;
  };

  const groupScheduleByWeek = () => {
    const grouped = {};
    schedule.forEach(item => {
      const date = new Date(item.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = [];
      }
      grouped[weekKey].push(item);
    });
    return grouped;
  };

  if (loading) return <Loader />;

  const weeklySchedule = groupScheduleByWeek();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Schedule</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Shift</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{profile?.shift || 'N/A'}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="text-xl font-bold text-gray-900">{profile?.position || 'N/A'}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-xl font-bold text-gray-900">{profile?.department || 'N/A'}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Shifts</p>
              <p className="text-xl font-bold text-gray-900">{schedule.length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {schedule.length === 0 ? (
        <Card>
          <EmptyState message="No schedule available" />
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(weeklySchedule).map(([weekStart, shifts]) => (
            <Card key={weekStart}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Week of {new Date(weekStart).toLocaleDateString()}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {shifts.sort((a, b) => new Date(a.date) - new Date(b.date)).map((shift, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      {getShiftBadge(shift.shift)}
                    </div>
                    {shift.shift !== 'off' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{shift.startTime} - {shift.endTime}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffSchedule;
