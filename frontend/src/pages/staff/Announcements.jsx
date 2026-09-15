import { useState, useEffect } from 'react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { Megaphone, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/staff/announcements', {
        params: { page: currentPage, limit: 10 }
      });
      setAnnouncements(data.data);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    const variants = {
      urgent: 'error',
      general: 'default',
      maintenance: 'warning',
      event: 'info',
      policy: 'success'
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'critical' || priority === 'high') {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Announcements</h1>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <EmptyState message="No announcements available" />
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement._id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getPriorityIcon(announcement.priority)}
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {announcement.title}
                      </h3>
                      {getTypeBadge(announcement.type)}
                    </div>
                    <p className="text-gray-600 mb-3 whitespace-pre-wrap">{announcement.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(announcement.startDate).toLocaleDateString()}</span>
                      </div>
                      {announcement.createdBy && (
                        <div className="flex items-center gap-1">
                          <Megaphone className="h-4 w-4" />
                          <span>By: {announcement.createdBy.firstName} {announcement.createdBy.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default StaffAnnouncements;
