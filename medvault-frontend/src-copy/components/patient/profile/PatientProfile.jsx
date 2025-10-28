import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, Mail, MapPin, Users, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const PatientProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    contactNumber: '',
    email: '',
    address: '',
    emergencyContact: ''
  });
  
  const [governmentId, setGovernmentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [patientStatus, setPatientStatus] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [profileExists, setProfileExists] = useState(false);
  const [documentUploaded, setDocumentUploaded] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPatientProfile();
    }
  }, [user?.id]); // Only depend on user.id

  const fetchPatientProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/patient/profile/${user.id}`);
      
      if (response.ok) {
        const patient = await response.json();
        
        if (patient.id) {
          setProfileData({
            firstName: patient.firstName || user.firstName || '',
            lastName: patient.lastName || user.lastName || '',
            gender: patient.gender || '',
            dateOfBirth: patient.dateOfBirth || '',
            contactNumber: patient.contactNumber || '',
            email: patient.email || user.email || '',
            address: patient.address || '',
            emergencyContact: patient.emergencyContact || ''
          });
          setPatientStatus(patient.status);
          setPatientData(patient);
          setProfileExists(Boolean(patient.profileComplete));
          setDocumentUploaded(Boolean(patient.documentUploaded));
        } else {
          setProfileExists(false);
          setDocumentUploaded(false);
          setPatientStatus('INACTIVE');
        }
        
        // Set initial tab
        if (!patient.profileComplete) {
          setActiveTab('basic');
        } else if (!patient.documentUploaded) {
          setActiveTab('document');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Error loading profile' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setGovernmentId(e.target.files[0]);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`http://localhost:8080/api/patient/profile/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setProfileExists(true);
        setActiveTab('document');
        // Call the callback to refresh profile status
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    if (!governmentId) {
      setMessage({ type: 'error', text: 'Please select a government ID document' });
      setLoading(false);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('governmentId', governmentId);

      const response = await fetch(`http://localhost:8080/api/patient/upload-document/${user.id}`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setPatientStatus('PENDING');
        setDocumentUploaded(true);
        // Call the callback to refresh profile status
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error uploading document' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const renderStatusBadge = () => {
    if (!patientStatus || patientStatus === 'INACTIVE') return null;
    
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Pending Approval' },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Rejected' }
    };
    
    const config = statusConfig[patientStatus];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={16} className="mr-1" />
        {config.text}
      </div>
    );
  };

  const renderContent = () => {
    if (patientStatus === 'APPROVED') {
      return (
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <CheckCircle size={24} className="text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-900">Profile Verified!</h3>
                <p className="text-green-800">You can now book appointments with verified doctors.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (patientStatus === 'PENDING') {
      return (
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
            <AlertCircle size={48} className="text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Verification in Progress</h3>
            <p className="text-yellow-800 mb-4">
              Your document has been submitted and is currently being reviewed by our admin team.
            </p>
            <p className="text-sm text-yellow-700">
              This process typically takes 1-2 business days. You'll be notified once your profile is approved.
            </p>
          </div>
        </div>
      );
    }

    if (patientStatus === 'REJECTED') {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Verification Rejected</h3>
            <p className="text-red-800 mb-4">
              Unfortunately, your profile verification has been rejected.
            </p>
            {patientData?.adminNotes && (
              <div className="bg-white rounded-md p-4 mb-4">
                <p className="text-sm text-gray-700 font-medium mb-2">Admin Notes:</p>
                <p className="text-sm text-red-700">{patientData.adminNotes}</p>
              </div>
            )}
            <p className="text-sm text-red-700">
              Please contact support for more information.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab('document')}
            disabled={!profileExists}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'document' && profileExists 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            } ${!profileExists ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Document Upload
            {!profileExists && <span className="ml-2 text-xs">(Complete basic info first)</span>}
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'basic' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-1" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-1" />
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={profileData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users size={16} className="inline mr-1" />
                    Emergency Contact (Optional)
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Emergency contact number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Address *
                </label>
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile & Continue'}
              </button>
            </form>
          )}

          {activeTab === 'document' && profileExists && (
            <form onSubmit={handleDocumentSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Document Verification Required</h3>
                <p className="text-blue-800">Please upload your government ID for verification. The document should be clear and legible.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Government ID * (Aadhar/Passport/Driving License)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {governmentId && (
                  <p className="text-sm text-green-600 mt-1">✓ {governmentId.name}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                <Upload size={16} className="inline mr-2" />
                {loading ? 'Uploading...' : 'Upload Document & Submit for Verification'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
              <p className="text-gray-600">
                {patientStatus === 'APPROVED' 
                  ? 'Your profile is verified - you can book appointments' 
                  : !profileExists
                    ? 'Complete your basic information first'
                    : !documentUploaded
                      ? 'Upload your government ID for verification'
                      : 'Complete your profile to book appointments'
                }
              </p>
            </div>
            {renderStatusBadge()}
          </div>
        </div>

        {message.text && (
          <div className={`m-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button onClick={() => setMessage({ type: '', text: '' })} className="text-current">✕</button>
            </div>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default PatientProfile;
