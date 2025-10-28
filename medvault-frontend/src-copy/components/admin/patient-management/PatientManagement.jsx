// components/admin/patient-management/PatientManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Eye, User, Calendar, Phone, Mail, FileText, 
  AlertCircle, Search, Loader2, X, Download, Heart, MapPin, 
  Shield, Users, Maximize 
} from 'lucide-react';

// Enhanced Document Preview Modal with fullscreen capabilities
const DocumentPreviewModal = ({ viewingDocument, onClose, onDownload }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!viewingDocument) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen 
          ? 'w-full h-full rounded-none' 
          : 'w-11/12 h-5/6 max-w-6xl'
      }`}>
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex-shrink-0 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Patient ID Document</h3>
              <p className="text-sm text-gray-600">Government-issued identification</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                <Maximize size={18} />
              </button>
              
              <button
                onClick={() => onDownload(viewingDocument.url, viewingDocument.filename)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
          <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
            <iframe
              src={`${viewingDocument.url}#view=FitH&toolbar=1&navpanes=1`}
              className="w-full h-full border-none"
              title="Document Preview"
              style={{ minHeight: '600px' }}
              onError={() => {
                console.error('Failed to load document in iframe');
              }}
            />
          </div>
        </div>

        {/* Footer with document info */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex-shrink-0 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>File: {viewingDocument.filename}</span>
            <div className="flex items-center space-x-4">
              <span>Use Ctrl+Mouse Wheel to zoom</span>
              <span>•</span>
              <span>Right-click to save or print</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('PENDING');
  const [viewingDocument, setViewingDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/patients', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const patientsData = await response.json();
        setPatients(patientsData);
        console.log('Patients loaded:', patientsData);
      } else {
        setMessage({ type: 'error', text: 'Failed to load patients' });
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setMessage({ type: 'error', text: 'Error loading patients' });
    } finally {
      setLoading(false);
    }
  };

  const handlePatientAction = async (patientId, action, notes = '') => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/patients/${patientId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ notes })
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        fetchPatients();
        setSelectedPatient(null);
      } else {
        setMessage({ type: 'error', text: result.error || 'Action failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error processing patient verification' });
    } finally {
      setActionLoading(false);
    }
  };

  const viewDocument = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/patients/${patientId}/document`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setViewingDocument({ 
          url, 
          filename: `patient_${patientId}_id_document.pdf` 
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to load document' });
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      setMessage({ type: 'error', text: 'Error loading document' });
    }
  };

  const downloadDocument = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const closeDocumentViewer = () => {
    if (viewingDocument) {
      window.URL.revokeObjectURL(viewingDocument.url);
      setViewingDocument(null);
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedPatients = patients
    .filter(patient => {
      const matchesFilter = filter === 'ALL' || patient.status === filter;
      const matchesSearch = searchTerm === '' || 
        patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contactNumber?.includes(searchTerm);
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'email':
          return a.email?.localeCompare(b.email || '') || 0;
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle size={14} className="text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle size={14} className="text-green-600" />;
      case 'REJECTED':
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <User size={14} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading patient verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Heart size={32} className="mr-3 text-red-500" />
                  Patient Verification Center
                </h1>
                <p className="text-gray-600 mt-2">Review and manage patient registrations and identity verification</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-500">{patients.length}</div>
                <div className="text-sm text-gray-500">Total Patients</div>
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients by name, email, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="createdAt">Sort by Registration Date</option>
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
              </select>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => {
                const count = status === 'ALL' ? patients.length : patients.filter(p => p.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      filter === status
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {getStatusIcon(status)}
                    <span>{status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      filter === status ? 'bg-white text-red-600' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mx-6 mt-4 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {message.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <XCircle size={20} className="mr-2" />}
                  <span>{message.text}</span>
                </div>
                <button 
                  onClick={() => setMessage({ type: '', text: '' })} 
                  className="text-current hover:opacity-70"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredAndSortedPatients.length}</span> of <span className="font-semibold">{patients.length}</span> patients
              {searchTerm && <span> matching "{searchTerm}"</span>}
            </p>
          </div>
        </div>

        {/* Patient Cards */}
        {filteredAndSortedPatients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {filter.toLowerCase()} patients found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new registrations.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedPatients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-red-600 font-semibold text-sm">Patient</p>
                      </div>
                    </div>
                    <div className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(patient.status)}`}>
                      {getStatusIcon(patient.status)}
                      <span className="ml-1">{patient.status}</span>
                    </div>
                  </div>

                  {/* Patient Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Phone size={14} className="mr-2 text-gray-400" />
                      <span>{patient.contactNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={14} className="mr-2 text-gray-400" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      <span>Registered: {new Date(patient.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    {patient.emergencyContact && (
                      <div className="flex items-center">
                        <Shield size={14} className="mr-2 text-gray-400" />
                        <span>Emergency: {patient.emergencyContact}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 flex items-center justify-center font-medium transition-colors"
                  >
                    <Eye size={16} className="mr-2" />
                    Review Patient
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-2xl max-w-5xl max-h-[90vh] overflow-y-auto w-full shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Patient Identity Verification
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {selectedPatient.firstName} {selectedPatient.lastName} • Patient Registration
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <User size={20} className="mr-2 text-red-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Full Name</label>
                      <p className="text-gray-900 mt-1">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Gender</label>
                      <p className="text-gray-900 mt-1">{selectedPatient.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
                      <p className="text-gray-900 mt-1">
                        {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString('en-IN') : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                      <p className="text-gray-900 mt-1">{selectedPatient.contactNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Email Address</label>
                      <p className="text-gray-900 mt-1">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Emergency Contact</label>
                      <p className="text-gray-900 mt-1">{selectedPatient.emergencyContact || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Address</label>
                      <p className="text-gray-900 mt-1">{selectedPatient.address || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Identity Document */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText size={20} className="mr-2 text-red-600" />
                    Identity Verification Document
                  </h3>
                  
                  {selectedPatient.documentUploaded ? (
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Government ID Proof</h4>
                            <p className="text-sm text-gray-600">Identity verification document uploaded</p>
                          </div>
                        </div>
                        <button
                          onClick={() => viewDocument(selectedPatient.id)}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 bg-white px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={16} />
                          <span>View Document</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
                      <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
                      <h4 className="font-semibold text-gray-900 mb-2">No Identity Document</h4>
                      <p className="text-gray-600">Patient has not uploaded identity verification document</p>
                    </div>
                  )}
                </div>

                {/* Admin Notes (if rejected) */}
                {selectedPatient.status === 'REJECTED' && selectedPatient.adminNotes && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <XCircle size={20} className="mr-2 text-red-600" />
                      Rejection Reason
                    </h3>
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                      <p className="text-red-800">{selectedPatient.adminNotes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedPatient.status === 'PENDING' && (
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handlePatientAction(selectedPatient.id, 'approve')}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center font-semibold transition-colors"
                    >
                      <CheckCircle size={20} className="mr-2" />
                      {actionLoading ? 'Processing...' : 'Approve Patient'}
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Please provide a detailed reason for rejection:');
                        if (notes && notes.trim()) {
                          handlePatientAction(selectedPatient.id, 'reject', notes);
                        }
                      }}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center font-semibold transition-colors"
                    >
                      <XCircle size={20} className="mr-2" />
                      Reject Registration
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Document Preview Modal */}
        <DocumentPreviewModal
          viewingDocument={viewingDocument}
          onClose={closeDocumentViewer}
          onDownload={downloadDocument}
        />
      </div>
    </div>
  );
};

export default PatientManagement;
