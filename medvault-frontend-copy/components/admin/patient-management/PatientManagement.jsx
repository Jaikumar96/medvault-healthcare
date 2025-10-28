// Create components/admin/patient-management/PatientManagement.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, User, Calendar, Phone, Mail, FileText, AlertCircle } from 'lucide-react';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('PENDING');
  const [viewingDocument, setViewingDocument] = useState(null);

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
      } else {
        setMessage({ type: 'error', text: 'Failed to load patients' });
      }
    } catch (error) {
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
        setViewingDocument({ url, filename: `patient_${patientId}_id` });
      } else {
        setMessage({ type: 'error', text: 'Failed to load document' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading document' });
    }
  };

  const filteredPatients = patients.filter(patient => 
    filter === 'ALL' || patient.status === filter
  );

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient Verification</h1>
          <p className="text-gray-600 mb-4">Review and verify patient registrations</p>

          {/* Filter Tabs */}
          <div className="flex space-x-4">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === status
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {status} ({status === 'ALL' ? patients.length : patients.filter(p => p.status === status).length})
              </button>
            ))}
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

        <div className="p-6">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {filter.toLowerCase()} patients found
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-blue-600 text-sm">Patient</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Phone size={14} className="mr-2" />
                      <span>{patient.contactNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={14} className="mr-2" />
                      <span>{patient.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      <span>Registered: {new Date(patient.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Eye size={14} className="mr-1" />
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Patient Verification - {selectedPatient.firstName} {selectedPatient.lastName}
                </h2>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900">{selectedPatient.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-gray-900">
                      {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Number</label>
                    <p className="text-gray-900">{selectedPatient.contactNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedPatient.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                    <p className="text-gray-900">{selectedPatient.emergencyContact || 'Not specified'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="text-gray-900">{selectedPatient.address || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Document */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Government ID Document</h3>
                
                {selectedPatient.documentUploaded ? (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                    <div className="flex items-center">
                      <FileText size={16} className="text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Government ID Proof</span>
                    </div>
                    <button
                      onClick={() => viewDocument(selectedPatient.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center px-3 py-1 border border-blue-200 rounded hover:bg-blue-100"
                    >
                      <Eye size={14} className="mr-1" />
                      View
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle size={32} className="mx-auto text-yellow-500 mb-3" />
                    <p className="text-sm text-gray-600">No document uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedPatient.status === 'PENDING' && (
                <div className="flex space-x-4 pt-4 border-t">
                  <button
                    onClick={() => handlePatientAction(selectedPatient.id, 'approve')}
                    disabled={actionLoading}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    {actionLoading ? 'Processing...' : 'Approve Patient'}
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Please provide a reason for rejection:');
                      if (notes && notes.trim()) {
                        handlePatientAction(selectedPatient.id, 'reject', notes);
                      }
                    }}
                    disabled={actionLoading}
                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    <XCircle size={16} className="mr-2" />
                    Reject Patient
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] w-full flex flex-col">
            <div className="border-b border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Government ID Document</h3>
                <button
                  onClick={() => {
                    window.URL.revokeObjectURL(viewingDocument.url);
                    setViewingDocument(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl px-2"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <iframe
                src={viewingDocument.url}
                className="w-full h-full border rounded"
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
