import { useState, useEffect } from 'react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Briefcase, Award, Calendar, DollarSign, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const { user, profile: authProfile, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    specialization: '',
    qualification: '',
    experience: '',
    department: '',
    consultationFee: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/doctor/profile');
      setProfile(data.data);
      setEditFormData({
        specialization: data.data.specialization || '',
        qualification: data.data.qualification || '',
        experience: data.data.experience || '',
        department: data.data.department || '',
        consultationFee: data.data.consultationFee || '',
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
      const { data } = await api.put('/doctor/profile', editFormData);
      setProfile(data.data);
      updateProfile(data.data);
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
            <div className="h-24 w-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-gray-600 capitalize mt-1">{user?.role}</p>
            <p className="text-sm text-blue-600 mt-2">{profile?.doctorId}</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Specialization</p>
              <p className="text-sm font-medium text-gray-900">{profile?.specialization || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Qualification</p>
              <p className="text-sm font-medium text-gray-900">{profile?.qualification || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="text-sm font-medium text-gray-900">{profile?.department || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">License Number</p>
              <p className="text-sm font-medium text-gray-900">{profile?.licenseNumber || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Experience</p>
              <p className="text-sm font-medium text-gray-900">{profile?.experience || 0} years</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Consultation Fee</p>
              <p className="text-sm font-medium text-gray-900">${profile?.consultationFee?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </Card>

      {profile?.availability && profile.availability.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Schedule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.availability.map((slot, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{slot.day}</p>
                <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleEditProfile} className="space-y-4">
          <Input
            label="Specialization"
            value={editFormData.specialization}
            onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
            required
          />
          <Input
            label="Qualification"
            value={editFormData.qualification}
            onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Experience (years)"
              type="number"
              value={editFormData.experience}
              onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
              required
              min="0"
            />
            <Input
              label="Consultation Fee"
              type="number"
              value={editFormData.consultationFee}
              onChange={(e) => setEditFormData({ ...editFormData, consultationFee: e.target.value })}
              required
              min="0"
            />
          </div>
          <Input
            label="Department"
            value={editFormData.department}
            onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
            required
          />
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

export default DoctorProfile;
