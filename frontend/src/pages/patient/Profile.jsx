import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Heart, MapPin, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, profile, updateProfile: updateAuthProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    bloodGroup: '',
    allergies: '',
    currentMedications: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  });

  useEffect(() => {
    if (profile) {
      setEditFormData({
        bloodGroup: profile.bloodGroup || '',
        allergies: profile.allergies?.join(', ') || '',
        currentMedications: profile.currentMedications?.join(', ') || '',
        emergencyContactName: profile.emergencyContact?.name || '',
        emergencyContactRelationship: profile.emergencyContact?.relationship || '',
        emergencyContactPhone: profile.emergencyContact?.phone || '',
      });
    }
  }, [profile]);

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        bloodGroup: editFormData.bloodGroup,
        allergies: editFormData.allergies.split(',').map(a => a.trim()).filter(a => a),
        currentMedications: editFormData.currentMedications.split(',').map(m => m.trim()).filter(m => m),
        emergencyContact: {
          name: editFormData.emergencyContactName,
          relationship: editFormData.emergencyContactRelationship,
          phone: editFormData.emergencyContactPhone,
        },
      };

      const { data } = await api.put('/patient/profile', payload);
      updateAuthProfile(data.data);
      toast.success('Profile updated successfully');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your personal information</p>
        </div>
        <Button onClick={() => setShowEditModal(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600 mt-1">{profile?.patientId}</p>
            <Badge className="mt-3 bg-green-100 text-green-800">Active Patient</Badge>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{user?.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium text-gray-900">{formatDate(profile?.dateOfBirth)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium text-gray-900 capitalize">{profile?.gender}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-medium text-gray-900">{profile?.bloodGroup}</p>
              </div>
            </div>

            {profile?.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {profile.address.street}, {profile.address.city}, {profile.address.state} {profile.address.zipCode}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Medical Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {profile?.allergies && profile.allergies.length > 0 ? (
                  profile.allergies.map((allergy, idx) => (
                    <Badge key={idx} className="bg-red-100 text-red-800">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No known allergies</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Current Medications</p>
              <div className="flex flex-wrap gap-2">
                {profile?.currentMedications && profile.currentMedications.length > 0 ? (
                  profile.currentMedications.map((med, idx) => (
                    <Badge key={idx} className="bg-blue-100 text-blue-800">
                      {med}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No current medications</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          {profile?.emergencyContact ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{profile.emergencyContact.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relationship</p>
                <p className="font-medium text-gray-900">{profile.emergencyContact.relationship}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{profile.emergencyContact.phone}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No emergency contact added</p>
          )}
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleEditProfile} className="space-y-4">
          <Input
            label="Blood Group"
            value={editFormData.bloodGroup}
            onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
            placeholder="e.g., A+, B-, O+"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergies (comma separated)
            </label>
            <textarea
              rows="2"
              value={editFormData.allergies}
              onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Penicillin, Peanuts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Medications (comma separated)
            </label>
            <textarea
              rows="2"
              value={editFormData.currentMedications}
              onChange={(e) => setEditFormData({ ...editFormData, currentMedications: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Aspirin, Metformin"
            />
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold text-gray-900 mb-3">Emergency Contact</h4>
            <div className="space-y-3">
              <Input
                label="Name"
                value={editFormData.emergencyContactName}
                onChange={(e) => setEditFormData({ ...editFormData, emergencyContactName: e.target.value })}
              />
              <Input
                label="Relationship"
                value={editFormData.emergencyContactRelationship}
                onChange={(e) => setEditFormData({ ...editFormData, emergencyContactRelationship: e.target.value })}
              />
              <Input
                label="Phone"
                value={editFormData.emergencyContactPhone}
                onChange={(e) => setEditFormData({ ...editFormData, emergencyContactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
