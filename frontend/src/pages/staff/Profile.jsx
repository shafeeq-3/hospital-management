import { useState, useEffect } from 'react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Briefcase, Calendar, DollarSign, Clock, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffProfile = () => {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    position: '',
    department: '',
    shift: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/staff/profile');
      setProfile(data.data);
      setEditFormData({
        position: data.data.position || '',
        department: data.data.department || '',
        shift: data.data.shift || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/staff/profile', editFormData);
      setProfile(data.data);
      updateAuthProfile(data.data);
      toast.success('Profile updated successfully');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
        <Button onClick={() => setShowEditModal(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="h-24 w-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-gray-600 capitalize mt-1">{user?.role}</p>
            <p className="text-sm text-purple-600 mt-2">{profile?.staffId}</p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-sm font-medium text-gray-900">{user?.phone}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="text-sm font-medium text-gray-900">{profile?.position}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-sm font-medium text-gray-900">{profile?.department}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Employment Type</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{profile?.employeeType?.replace('-', ' ')}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Shift</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{profile?.shift}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Salary</p>
              <p className="text-sm font-medium text-gray-900">${profile?.salary?.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Joining Date</p>
              <p className="text-sm font-medium text-gray-900">
                {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleEditProfile} className="space-y-4">
          <Input
            label="Position"
            value={editFormData.position}
            onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
            required
          />
          <Input
            label="Department"
            value={editFormData.department}
            onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={editFormData.shift}
              onChange={(e) => setEditFormData({ ...editFormData, shift: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Shift</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffProfile;
