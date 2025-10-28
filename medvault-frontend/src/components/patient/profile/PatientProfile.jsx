import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, Phone, Mail, MapPin, Users, Upload, FileText, 
  CheckCircle, AlertCircle, Shield, Sparkles, ArrowRight, Clock,
  Edit3, Save, X, Camera, Eye, EyeOff, Heart, Star, Award,
  ChevronRight, Info, Lock, Unlock, AlertTriangle
} from 'lucide-react';

const PatientProfile = ({ user, onProfileUpdate }) => {
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
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPatientProfile();
    }
  }, [user?.id]);

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
    const file = e.target.files[0];
    if (file) {
      setGovernmentId(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type.includes('image') || file.type.includes('pdf'))) {
      setGovernmentId(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const getStatusConfig = () => {
    const configs = {
      PENDING: { 
        color: 'bg-amber-50 text-amber-800 border-amber-200', 
        icon: Clock, 
        text: 'Under Review',
        gradient: 'from-amber-500 to-orange-500'
      },
      APPROVED: { 
        color: 'bg-green-50 text-green-800 border-green-200', 
        icon: CheckCircle, 
        text: 'Verified',
        gradient: 'from-green-500 to-emerald-500'
      },
      REJECTED: { 
        color: 'bg-red-50 text-red-800 border-red-200', 
        icon: AlertTriangle, 
        text: 'Needs Attention',
        gradient: 'from-red-500 to-pink-500'
      },
      INACTIVE: { 
        color: 'bg-gray-50 text-gray-800 border-gray-200', 
        icon: User, 
        text: 'Setup Required',
        gradient: 'from-gray-500 to-slate-500'
      }
    };
    return configs[patientStatus] || configs.INACTIVE;
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const renderProgressSteps = () => {
    const steps = [
      { id: 'basic', label: 'Basic Info', icon: User, completed: profileExists },
      { id: 'document', label: 'Verification', icon: Shield, completed: documentUploaded },
      { id: 'approved', label: 'Approval', icon: CheckCircle, completed: patientStatus === 'APPROVED' }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = activeTab === step.id;
          const isCompleted = step.completed;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isActive 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                <StepIcon size={20} />
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                )}
              </div>
              
              <div className="ml-3 mr-8">
                <p className={`text-sm font-medium ${isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.label}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 rounded-full mr-8 ${
                  steps[index + 1].completed ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderApprovedState = () => (
    <div className="text-center py-16">
      <div className="relative inline-block mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
          <CheckCircle size={40} className="text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
          <Star size={16} className="text-white" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Profile Verified! 🎉</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Congratulations! Your profile has been successfully verified. You can now book appointments with our verified doctors.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Calendar size={32} className="text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Book Appointments</h3>
          <p className="text-sm text-gray-600">Schedule consultations with verified doctors</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Heart size={32} className="text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Health Records</h3>
          <p className="text-sm text-gray-600">Access your medical history securely</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Shield size={32} className="text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Secure Platform</h3>
          <p className="text-sm text-gray-600">Your data is protected with industry standards</p>
        </div>
      </div>
      
      
    </div>
  );

  const renderPendingState = () => (
    <div className="text-center py-16">
      <div className="relative inline-block mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
          <Clock size={40} className="text-white" />
        </div>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 opacity-20 animate-ping"></div>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Under Review</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Your documents are being reviewed by our verification team. This usually takes 1-2 business days.
      </p>
      
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="flex items-start space-x-4">
          <Info size={24} className="text-amber-600 mt-1 flex-shrink-0" />
          <div className="text-left">
            <h3 className="font-semibold text-amber-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                Our team reviews your submitted documents
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                You'll receive an email notification once approved
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                Full access to book appointments will be granted
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRejectedState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-8">
        <AlertTriangle size={40} className="text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Unsuccessful</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        We couldn't verify your documents. Please check the feedback below and resubmit.
      </p>
      
      {patientData?.adminNotes && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-2xl mx-auto mb-8">
          <h3 className="font-semibold text-red-900 mb-3">Admin Feedback:</h3>
          <p className="text-red-800 leading-relaxed">{patientData.adminNotes}</p>
        </div>
      )}
      
      <button 
        onClick={() => {
          setActiveTab('document');
          setDocumentUploaded(false);
        }}
        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
      >
        <Upload size={20} className="mr-3" />
        Resubmit Documents
      </button>
    </div>
  );

  if (patientStatus === 'APPROVED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="p-8">
              {renderProgressSteps()}
              {renderApprovedState()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (patientStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="p-8">
              {renderProgressSteps()}
              {renderPendingState()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (patientStatus === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
            <div className="p-8">
              {renderProgressSteps()}
              {renderRejectedState()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
                <p className="text-blue-100 text-lg">
                  {!profileExists 
                    ? 'Let\'s get started with your basic information'
                    : !documentUploaded
                    ? 'Upload your ID for secure verification'
                    : 'Complete your profile to book appointments'
                  }
                </p>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 ${statusConfig.color} bg-white`}>
                <StatusIcon size={18} />
                <span className="font-semibold text-sm">{statusConfig.text}</span>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="p-8 border-b border-gray-100">
            {renderProgressSteps()}
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mx-8 mt-8 p-6 rounded-2xl border-l-4 shadow-sm ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-400 text-green-800' 
                : 'bg-red-50 border-red-400 text-red-800'
            }`}>
              <div className="flex items-start space-x-3">
                {message.type === 'success' ? (
                  <CheckCircle size={24} className="text-green-600 mt-1" />
                ) : (
                  <AlertCircle size={24} className="text-red-600 mt-1" />
                )}
                <div>
                  <p className="font-semibold">{message.text}</p>
                  {message.type === 'success' && (
                    <p className="text-sm mt-1 opacity-90">Great progress! Continue to the next step.</p>
                  )}
                </div>
                <button 
                  onClick={() => setMessage({ type: '', text: '' })}
                  className="ml-auto p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {activeTab === 'basic' && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User size={32} className="text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                  <p className="text-gray-600">Please provide your personal details for account setup</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <User size={16} className="mr-2 text-blue-600" />
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Calendar size={16} className="mr-2 text-blue-600" />
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Phone size={16} className="mr-2 text-blue-600" />
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={profileData.contactNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Mail size={16} className="mr-2 text-blue-600" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Users size={16} className="mr-2 text-blue-600" />
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={profileData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <MapPin size={16} className="mr-2 text-blue-600" />
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter your complete address"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Save size={20} />
                        <span>Save & Continue to Verification</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'document' && profileExists && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Verification</h2>
                  <p className="text-gray-600">Upload a clear photo of your government-issued ID</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <Info size={24} className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Accepted Documents</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Aadhar Card (front & back)
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Passport (photo page)
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Driving License
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Voter ID Card
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleDocumentSubmit} className="space-y-8">
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : governmentId 
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDrag}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                  >
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {governmentId ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                          <CheckCircle size={32} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-green-800 mb-2">File Selected!</p>
                          <p className="text-sm text-green-600">{governmentId.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(governmentId.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGovernmentId(null)}
                          className="inline-flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={16} className="mr-2" />
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                          <Upload size={32} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900 mb-2">
                            {dragActive ? 'Drop your file here' : 'Upload Document'}
                          </p>
                          <p className="text-sm text-gray-600 mb-4">
                            Drag and drop your file or click to browse
                          </p>
                          <div className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                            <Camera size={18} className="mr-2" />
                            Choose File
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Supported formats: JPG, PNG, PDF (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !governmentId}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Shield size={20} />
                        <span>Submit for Verification</span>
                        <Sparkles size={20} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
