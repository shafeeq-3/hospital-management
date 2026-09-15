import { useState, useEffect } from 'react';
import { Users, Search, Eye } from 'lucide-react';
import api from '../../config/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchAssignedPatients();
  }, []);

  const fetchAssignedPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/doctor/patients/assigned');
      setPatients(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch assigned patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      toast.error('Please enter at least 2 characters');
      return;
    }

    setSearching(true);
    try {
      const response = await api.get(`/doctor/patients/search?search=${searchQuery}`);
      setSearchResults(response.data.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const displayPatients = searchQuery ? searchResults : patients;

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-600 mt-1">View and manage your assigned patients</p>
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </Button>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Patients List */}
      {displayPatients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No patients found"
            description={searchQuery ? 'No patients match your search' : 'You have no assigned patients'}
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {displayPatients.map((patient) => (
            <Card key={patient._id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {patient.user?.firstName} {patient.user?.lastName}
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {patient.patientId}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{patient.user?.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{patient.user?.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Blood Group:</span>
                      <span className="ml-2 font-medium">{patient.bloodGroup || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <span className="ml-2 font-medium capitalize">{patient.gender}</span>
                    </div>
                  </div>

                  {patient.allergies && patient.allergies.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 mb-1">Allergies:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies.map((allergy, idx) => (
                          <Badge key={idx} className="bg-red-100 text-red-800 text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(patient)}>
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Patient Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Patient Details"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Patient ID</p>
                <p className="font-medium text-gray-900">{selectedPatient.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">
                  {selectedPatient.user?.firstName} {selectedPatient.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{selectedPatient.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{selectedPatient.user?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-medium text-gray-900">{selectedPatient.bloodGroup || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium text-gray-900 capitalize">{selectedPatient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium text-gray-900">{formatDate(selectedPatient.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-medium text-gray-900">{selectedPatient.age || 'N/A'} years</p>
              </div>
            </div>

            {selectedPatient.address && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Address</h4>
                <p className="text-sm text-gray-600">
                  {selectedPatient.address.street}, {selectedPatient.address.city}, {selectedPatient.address.state} {selectedPatient.address.zipCode}
                </p>
              </div>
            )}

            {selectedPatient.emergencyContact && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{selectedPatient.emergencyContact.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Relationship:</span>
                    <span className="ml-2 font-medium">{selectedPatient.emergencyContact.relationship}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{selectedPatient.emergencyContact.phone}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Allergies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies.map((allergy, idx) => (
                    <Badge key={idx} className="bg-red-100 text-red-800">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Current Medications</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {selectedPatient.currentMedications.map((med, idx) => (
                    <li key={idx}>{med}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Medical History</h4>
                <div className="space-y-2">
                  {selectedPatient.medicalHistory.map((history, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium text-gray-900">{history.condition}</p>
                      <p className="text-sm text-gray-600">
                        Diagnosed: {formatDate(history.diagnosedDate)}
                      </p>
                      {history.notes && <p className="text-sm text-gray-600 mt-1">{history.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;
