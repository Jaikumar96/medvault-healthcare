import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, Mail, MapPin, Award, Clock, DollarSign, FileText, Upload, CheckCircle, AlertCircle, Plus } from 'lucide-react';

const DoctorProfile = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    contactNumber: '',
    email: '',
    address: '',
    specialization: '',
    yearsOfExperience: '',
    consultationFees: '',
    languagesSpoken: ''
  });
  const [documents, setDocuments] = useState({
    medicalDegree: null,
    medicalLicense: '',
    governmentId: null,
    clinicAffiliation: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [profileExists, setProfileExists] = useState(false);
  const [documentsUploaded, setDocumentsUploaded] = useState(false);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  // In DoctorProfile.jsx - fetchDoctorProfile method
  const fetchDoctorProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/doctor/profile/${user.id}`);

      if (response.ok) {
        const doctor = await response.json();

        // Handle the response properly
        if (doctor.id) {
          // Existing doctor profile
          setProfileData({
            firstName: doctor.firstName || user.firstName || '',
            lastName: doctor.lastName || user.lastName || '',
            gender: doctor.gender || '',
            dateOfBirth: doctor.dateOfBirth || '',
            contactNumber: doctor.contactNumber || '',
            email: doctor.email || user.email || '',
            address: doctor.address || '',
            specialization: doctor.specialization || '',
            yearsOfExperience: doctor.yearsOfExperience || '',
            consultationFees: doctor.consultationFees || '',
            languagesSpoken: doctor.languagesSpoken || ''
          });
          setDoctorStatus(doctor.status);
          setDoctorData(doctor);
          setProfileExists(Boolean(doctor.profileComplete));
          setDocumentsUploaded(Boolean(doctor.documentsUploaded));
        } else {
          // New doctor - no profile yet
          setProfileExists(false);
          setDocumentsUploaded(false);
          setDoctorStatus('INACTIVE');
        }

        // Set initial tab
        if (!doctor.profileComplete) {
          setActiveTab('basic');
        } else if (!doctor.documentsUploaded) {
          setActiveTab('documents');
        }
      } else {
        // Handle 404 - no profile exists
        setProfileExists(false);
        setActiveTab('basic');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileExists(false);
      setActiveTab('basic');
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
    const { name, files } = e.target;
    setDocuments(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/doctor/profile/${user.id}`, {
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
        setActiveTab('documents');
        fetchDoctorProfile(); // Refresh data
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

    // Validate required documents
    if (!documents.medicalDegree || !documents.medicalLicense || !documents.governmentId) {
      setMessage({ type: 'error', text: 'Please upload all required documents' });
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const formData = new FormData();
      formData.append('medicalDegree', documents.medicalDegree);
      formData.append('medicalLicense', documents.medicalLicense);
      formData.append('governmentId', documents.governmentId);
      if (documents.clinicAffiliation) {
        formData.append('clinicAffiliation', documents.clinicAffiliation);
      }

      const response = await fetch(`http://localhost:8080/api/doctor/upload-documents/${user.id}`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setDoctorStatus('PENDING');
        setDocumentsUploaded(true);
        fetchDoctorProfile(); // Refresh data
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error uploading documents' });
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = () => {
    if (!doctorStatus || doctorStatus === 'INACTIVE') return null;

    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Pending Approval' },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Rejected' }
    };

    const config = statusConfig[doctorStatus];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={16} className="mr-1" />
        {config.text}
      </div>
    );
  };

  // Show different content based on doctor status
  const renderContent = () => {
    // If doctor is approved, show the schedule management
    if (doctorStatus === 'APPROVED') {
      return (
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <CheckCircle size={24} className="text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-900">Congratulations! You're Approved</h3>
                <p className="text-green-800">Your profile has been verified and approved by our admin team.</p>
              </div>
            </div>

            <div className="bg-white rounded-md p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">What you can do now:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-600 mr-2" />
                  Create and manage your appointment time slots
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-600 mr-2" />
                  Review and approve patient appointment requests
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-600 mr-2" />
                  Start accepting patients for consultations
                </li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <a
                href="/doctor/schedule"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Calendar size={16} className="mr-2" />
                Manage Schedule
              </a>
              <a
                href="/doctor/appointments"
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <Clock size={16} className="mr-2" />
                View Appointments
              </a>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Profile Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">Dr. {profileData.firstName} {profileData.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Specialization</p>
                <p className="font-medium">{profileData.specialization}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium">{profileData.yearsOfExperience} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-medium">{profileData.contactNumber}</p>
              </div>
              {profileData.consultationFees && (
                <div>
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                  <p className="font-medium">₹{profileData.consultationFees}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Languages</p>
                <p className="font-medium">{profileData.languagesSpoken || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If doctor is pending approval
    if (doctorStatus === 'PENDING') {
      return (
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
            <AlertCircle size={48} className="text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Verification in Progress</h3>
            <p className="text-yellow-800 mb-4">
              Your documents have been submitted and are currently being reviewed by our admin team.
            </p>
            <p className="text-sm text-yellow-700">
              This process typically takes 1-2 business days. You'll be notified once your profile is approved.
            </p>
          </div>
        </div>
      );
    }

    // If doctor is rejected
    if (doctorStatus === 'REJECTED') {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Application Rejected</h3>
            <p className="text-red-800 mb-4">
              Unfortunately, your doctor verification application has been rejected.
            </p>
            {doctorData?.adminNotes && (
              <div className="bg-white rounded-md p-4 mb-4">
                <p className="text-sm text-gray-700 font-medium mb-2">Admin Notes:</p>
                <p className="text-sm text-red-700">{doctorData.adminNotes}</p>
              </div>
            )}
            <p className="text-sm text-red-700">
              Please contact support for more information or to resubmit your application.
            </p>
          </div>
        </div>
      );
    }

    // Default: Show profile completion forms
    return (
      <div>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            disabled={!profileExists}
            className={`px-6 py-3 text-sm font-medium ${activeTab === 'documents' && profileExists
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              } ${!profileExists ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Documents & Verification
            {!profileExists && <span className="ml-2 text-xs">(Complete basic info first)</span>}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'basic' && (
            <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
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
                    <Award size={16} className="inline mr-1" />
                    Specialization *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={profileData.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g., Cardiologist, Orthopedic"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={profileData.yearsOfExperience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={16} className="inline mr-1" />
                    Consultation Fees (Optional)
                  </label>
                  <input
                    type="number"
                    name="consultationFees"
                    value={profileData.consultationFees}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    name="languagesSpoken"
                    value={profileData.languagesSpoken}
                    onChange={handleInputChange}
                    placeholder="e.g., English, Hindi, Telugu"
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
                {loading ? 'Saving...' : 'Save Basic Information & Continue'}
              </button>
            </form>
          )}

          {activeTab === 'documents' && profileExists && (
            <form onSubmit={handleDocumentSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Document Verification Required</h3>
                <p className="text-blue-800">Please upload the following documents for verification. All documents should be clear and legible.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Medical Degree Certificate * (PDF/JPEG)
                </label>
                <input
                  type="file"
                  name="medicalDegree"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {documents.medicalDegree && (
                  <p className="text-sm text-green-600 mt-1">✓ {documents.medicalDegree.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Council Registration/License Number *
                </label>
                <input
                  type="text"
                  value={documents.medicalLicense}
                  onChange={(e) => setDocuments(prev => ({ ...prev, medicalLicense: e.target.value }))}
                  placeholder="Enter your medical license number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID Proof * (Aadhar/Passport/Driving License)
                </label>
                <input
                  type="file"
                  name="governmentId"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {documents.governmentId && (
                  <p className="text-sm text-green-600 mt-1">✓ {documents.governmentId.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic/Hospital Affiliation Proof (Optional)
                </label>
                <input
                  type="file"
                  name="clinicAffiliation"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {documents.clinicAffiliation && (
                  <p className="text-sm text-green-600 mt-1">✓ {documents.clinicAffiliation.name}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Documents & Submit for Verification'}
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
              <h1 className="text-2xl font-bold text-gray-900">Doctor Profile</h1>
              <p className="text-gray-600">
                {doctorStatus === 'APPROVED'
                  ? 'Manage your profile and schedule'
                  : !profileExists
                    ? 'Complete your basic information first'
                    : !documentsUploaded
                      ? 'Upload documents for verification'
                      : 'Complete your profile to start accepting appointments'
                }
              </p>
            </div>
            {renderStatusBadge()}
          </div>
        </div>

        {message.text && (
          <div className={`m-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
            {message.text}
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default DoctorProfile;
