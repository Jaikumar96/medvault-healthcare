import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  HeartIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ClockIcon,
  FolderIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const PatientRecords = () => {
  const [accessibleRecords, setAccessibleRecords] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [viewingFile, setViewingFile] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        setUserId(user.id);
      } else {
        console.error('User not found in localStorage. Cannot fetch data.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAccessibleRecords(userId);
      fetchMyPatients(userId);
    }
  }, [userId]);

  const fetchAccessibleRecords = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/doctor/accessible-records/${id}`);
      if (response.ok) {
        const data = await response.json();
        const uniqueRecords = data.reduce((acc, record, index) => {
          const existingIndex = acc.findIndex(r => r.id === record.id);
          if (existingIndex === -1) {
            acc.push({ ...record, uniqueKey: `${record.id}-${index}` });
          } else if (new Date(record.grantedAt) > new Date(acc[existingIndex].grantedAt)) {
            acc[existingIndex] = { ...record, uniqueKey: `${record.id}-${index}` };
          }
          return acc;
        }, []);
        setAccessibleRecords(uniqueRecords);
      } else {
        console.error('Failed to fetch accessible records:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching accessible records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPatients = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/doctor/my-patients/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        console.error('Failed to fetch patients:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPatientRecords = async (patientId) => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/doctor/patient-records/${userId}/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        const uniqueRecords = data.reduce((acc, record, index) => {
          const existingIndex = acc.findIndex(r => r.id === record.id);
          if (existingIndex === -1) {
            acc.push({ ...record, uniqueKey: `${record.id}-${patientId}-${index}` });
          } else if (new Date(record.grantedAt) > new Date(acc[existingIndex].grantedAt)) {
            acc[existingIndex] = { ...record, uniqueKey: `${record.id}-${patientId}-${index}` };
          }
          return acc;
        }, []);
        setPatientRecords(uniqueRecords);
      } else {
        console.error('Failed to fetch patient records:', response.statusText);
        setPatientRecords([]);
      }
    } catch (error) {
      console.error('Error fetching patient records:', error);
      setPatientRecords([]);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientRecords(patient.id);
  };

  const getRecordTypeIcon = (type) => {
    const icons = {
      'LAB_REPORT': '🧪',
      'PRESCRIPTION': '💊',
      'X_RAY': '🩻',
      'MRI_SCAN': '🧠',
      'CT_SCAN': '📷',
      'DIAGNOSIS': '📋',
      'BLOOD_TEST': '🩸',
      'VITALS': '❤️',
      'OTHER': '📄'
    };
    return icons[type] || '📄';
  };

  const getRecordTypeInfo = (type) => {
    const types = {
      'LAB_REPORT': { label: 'Lab Report', color: 'bg-blue-100 text-blue-800' },
      'PRESCRIPTION': { label: 'Prescription', color: 'bg-green-100 text-green-800' },
      'DIAGNOSIS': { label: 'Diagnosis', color: 'bg-yellow-100 text-yellow-800' },
      'X_RAY': { label: 'X-Ray', color: 'bg-purple-100 text-purple-800' },
      'MRI_SCAN': { label: 'MRI Scan', color: 'bg-indigo-100 text-indigo-800' },
      'CT_SCAN': { label: 'CT Scan', color: 'bg-pink-100 text-pink-800' },
      'BLOOD_TEST': { label: 'Blood Test', color: 'bg-red-100 text-red-800' },
      'VITALS': { label: 'Vital Signs', color: 'bg-orange-100 text-orange-800' },
      'OTHER': { label: 'Other', color: 'bg-gray-100 text-gray-800' }
    };
    return types[type] || types['OTHER'];
  };

  const getSharedBadge = () => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        Shared
      </span>
    );
  };

  const filteredPatients = patients.filter(patient => {
    const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
    const email = (patient.email || '').toLowerCase();
    return patientName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  // Updated handleViewFile function with better error handling
const handleViewFile = async (record) => {
  if (!userId) {
    alert('Cannot view file, user is not logged in.');
    return;
  }
  if (!record.filePath && !record.id) {
    alert('File path not available for this record');
    return;
  }
  
  setViewingFile(true);
  try {
    const response = await fetch(`http://localhost:8080/api/doctor/view-record/${userId}/${record.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      
      const contentType = response.headers.get('content-type') || blob.type;
      setFileType(contentType);
      setFilePreviewUrl(fileUrl);
    } else if (response.status === 403) {
      alert('Access denied. You do not have permission to view this record, or the sharing permission has expired.');
    } else if (response.status === 404) {
      alert('Medical record or file not found.');
    } else {
      alert(`Failed to load file for viewing. Server returned: ${response.status}`);
    }
  } catch (error) {
    console.error('Error loading file for viewing:', error);
    if (error.message.includes('Failed to fetch')) {
      alert('Cannot connect to server. Please check if the backend is running on localhost:8080');
    } else {
      alert('Error loading file for viewing. Please try again.');
    }
  } finally {
    setViewingFile(false);
  }
};


  const closeModal = () => {
    setShowRecordModal(false);
    setSelectedRecord(null);
    if (filePreviewUrl) {
      window.URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
      setFileType(null);
    }
  };

  // Render file preview based on type
  const renderFilePreview = () => {
    if (!filePreviewUrl) return null;

    const isPDF = fileType?.includes('pdf');
    const isImage = fileType?.includes('image');
    const isText = fileType?.includes('text');

    if (isPDF) {
      return (
        <div className="w-full">
          <iframe 
            src={filePreviewUrl} 
            className="w-full h-[600px] border rounded-lg"
            title="PDF Viewer"
          />
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="text-center">
          <img 
            src={filePreviewUrl} 
            alt="Medical Record" 
            className="max-w-full h-auto mx-auto rounded-lg shadow-md border"
            style={{ maxHeight: '600px' }}
          />
        </div>
      );
    }

    if (isText) {
      return (
        <div className="w-full">
          <iframe 
            src={filePreviewUrl} 
            className="w-full h-96 border rounded-lg bg-white p-4"
            title="Text Viewer"
          />
        </div>
      );
    }

    return (
      <div className="w-full">
        <iframe 
          src={filePreviewUrl} 
          className="w-full h-[600px] border rounded-lg"
          title="File Viewer"
        />
      </div>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={`loading-skeleton-${i}`} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Medical Records</h2>
          <p className="text-gray-600 mt-1">Access comprehensive medical records shared by your patients</p>
        </div>
        <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{accessibleRecords.length} Total Records</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">My Patients</h3>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <UserIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No patients found</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredPatients.map(patient => (
                    <button
                      key={`patient-btn-${patient.id}`}
                      onClick={() => handlePatientSelect(patient)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        selectedPatient?.id === patient.id
                          ? 'bg-blue-50 border border-blue-200 shadow-sm'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedPatient?.id === patient.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <UserIcon className={`w-5 h-5 ${
                            selectedPatient?.id === patient.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {patient.firstName || 'Unknown'} {patient.lastName || ''}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{patient.email || 'No email'}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Records Display */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      {selectedPatient.firstName || 'Unknown'} {selectedPatient.lastName || ''}
                    </h3>
                    <p className="text-gray-600 ml-11">Medical records shared with you</p>
                  </div>
                  <div className="bg-gray-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-gray-700">
                      {patientRecords.length} records
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {patientRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <LockClosedIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Records Shared</h4>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      {selectedPatient.firstName || 'This patient'} hasn't shared any medical records with you yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {patientRecords.map(record => {
                      const recordTypeInfo = getRecordTypeInfo(record.recordType);
                      const hasVitals = record.bloodGroup || record.bloodPressure || record.heartRate || record.temperature || record.weight;
                      const hasDiagnosis = record.diagnosisCondition;
                      const hasMedication = record.medication;

                      return (
                        <div key={record.uniqueKey || `patient-record-${record.id}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="text-2xl">
                                {getRecordTypeIcon(record.recordType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{record.title}</h4>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${recordTypeInfo.color}`}>
                                  {recordTypeInfo.label}
                                </span>
                              </div>
                            </div>
                            {getSharedBadge()}
                          </div>

                          {record.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{record.description}</p>
                          )}

                          {/* Enhanced Medical Information Indicators */}
                          <div className="space-y-2 mb-3">
                            {hasVitals && (
                              <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
                                <HeartIcon className="w-3 h-3" />
                                <span>Vitals Available</span>
                                <span className="text-xs text-red-600">
                                  ({[record.bloodGroup, record.bloodPressure, record.heartRate, record.temperature, record.weight].filter(Boolean).length} measurements)
                                </span>
                              </div>
                            )}
                            {hasDiagnosis && (
                              <div className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs">
                                <BeakerIcon className="w-3 h-3" />
                                <span>Diagnosis: {record.diagnosisCondition}</span>
                              </div>
                            )}
                            {hasMedication && (
                              <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                                <span className="text-xs">💊</span>
                                <span>Medication Details Available</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Uploaded: {new Date(record.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {record.grantedAt && (
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <CheckCircleIcon className="w-4 h-4" />
                                  <span>Shared: {new Date(record.grantedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewRecord(record)}
                              className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                            >
                              <EyeIcon className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-600">Choose a patient from the list to view their comprehensive medical records</p>
            </div>
          )}
        </div>
      </div>

      {/* All Accessible Records Summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Accessible Records ({accessibleRecords.length})
          </h3>
        </div>
        
        <div className="p-6">
          {accessibleRecords.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No medical records have been shared with you yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Record
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medical Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shared Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accessibleRecords.map((record, index) => {
                    const hasVitals = record.bloodGroup || record.bloodPressure || record.heartRate || record.temperature || record.weight;
                    const hasDiagnosis = record.diagnosisCondition;
                    const hasMedication = record.medication;

                    return (
                      <tr key={record.uniqueKey || `table-row-${record.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <UserIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.patientName || 'Unknown Patient'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{getRecordTypeIcon(record.recordType)}</span>
                            <div className="text-sm text-gray-900">{record.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.recordType.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {hasVitals && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <HeartIcon className="w-3 h-3 mr-1" />
                                Vitals
                              </span>
                            )}
                            {hasDiagnosis && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <BeakerIcon className="w-3 h-3 mr-1" />
                                Diagnosis
                              </span>
                            )}
                            {hasMedication && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                💊 Meds
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.grantedAt ? new Date(record.grantedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleViewRecord(record)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Record View Modal - Comprehensive Medical Details */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getRecordTypeIcon(selectedRecord.recordType)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedRecord.title}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRecordTypeInfo(selectedRecord.recordType).color}`}>
                    {getRecordTypeInfo(selectedRecord.recordType).label}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Patient Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Patient Name</label>
                      <p className="text-blue-900 font-medium">{selectedRecord.patientName || 'Unknown Patient'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Upload Date</label>
                      <p className="text-blue-900">{formatDateTime(selectedRecord.uploadedAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Shared Date</label>
                      <p className="text-blue-900">{formatDateTime(selectedRecord.grantedAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Status</label>
                      <div>{getSharedBadge()}</div>
                    </div>
                  </div>
                </div>
                
                {selectedRecord.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Description & Notes</h4>
                    <p className="text-gray-800">{selectedRecord.description}</p>
                  </div>
                )}

                {/* Comprehensive Vitals Information */}
                {(selectedRecord.bloodGroup || selectedRecord.bloodPressure || selectedRecord.heartRate || selectedRecord.temperature || selectedRecord.weight) && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                      <HeartIcon className="w-5 h-5 mr-2" />
                      Vital Signs & Measurements
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {selectedRecord.bloodGroup && (
                        <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                          <div className="text-3xl mb-2">🩸</div>
                          <div className="font-bold text-red-700 text-lg">{selectedRecord.bloodGroup}</div>
                          <div className="text-sm text-red-600">Blood Group</div>
                        </div>
                      )}
                      {selectedRecord.bloodPressure && (
                        <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                          <div className="text-3xl mb-2">💓</div>
                          <div className="font-bold text-red-700 text-lg">{selectedRecord.bloodPressure}</div>
                          <div className="text-sm text-red-600">Blood Pressure</div>
                        </div>
                      )}
                      {selectedRecord.heartRate && (
                        <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                          <div className="text-3xl mb-2">❤️</div>
                          <div className="font-bold text-red-700 text-lg">{selectedRecord.heartRate} BPM</div>
                          <div className="text-sm text-red-600">Heart Rate</div>
                        </div>
                      )}
                      {selectedRecord.temperature && (
                        <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                          <div className="text-3xl mb-2">🌡️</div>
                          <div className="font-bold text-red-700 text-lg">{selectedRecord.temperature}°C</div>
                          <div className="text-sm text-red-600">Temperature</div>
                        </div>
                      )}
                      {selectedRecord.weight && (
                        <div className="bg-white rounded-lg p-4 text-center border border-red-200">
                          <div className="text-3xl mb-2">⚖️</div>
                          <div className="font-bold text-red-700 text-lg">{selectedRecord.weight} kg</div>
                          <div className="text-sm text-red-600">Weight</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Diagnosis & Medication Information */}
                {(selectedRecord.diagnosisCondition || selectedRecord.medication) && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                      <BeakerIcon className="w-5 h-5 mr-2" />
                      Diagnosis & Treatment
                    </h4>
                    <div className="space-y-4">
                      {selectedRecord.diagnosisCondition && (
                        <div className="bg-white rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center mb-2">
                            <div className="text-2xl mr-3">🏥</div>
                            <div>
                              <h5 className="font-semibold text-yellow-900">Primary Diagnosis</h5>
                              <p className="text-yellow-700">{selectedRecord.diagnosisCondition}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedRecord.medication && (
                        <div className="bg-white rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-start mb-2">
                            <div className="text-2xl mr-3 mt-1">💊</div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-yellow-900 mb-2">Prescribed Medications</h5>
                              <div className="text-yellow-800 whitespace-pre-wrap bg-yellow-50 p-3 rounded border">
                                {selectedRecord.medication}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* File Preview Area */}
                <div className="border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <DocumentTextIcon className="w-5 h-5 mr-2" />
                      Medical Record Document
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {selectedRecord.recordType.replace('_', ' ')} • {selectedRecord.title}
                    </p>
                  </div>
                  
                  <div className="p-6">
                    {filePreviewUrl ? (
                      <div className="w-full space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          {renderFilePreview()}
                        </div>
                        
                        <div className="flex justify-center">
                          <button 
                            onClick={() => {
                              window.URL.revokeObjectURL(filePreviewUrl);
                              setFilePreviewUrl(null);
                              setFileType(null);
                            }}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                          >
                            Close Preview
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Click to view the medical record document
                        </p>
                        <button 
                          onClick={() => handleViewFile(selectedRecord)}
                          disabled={viewingFile}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 mx-auto"
                        >
                          <EyeIcon className="w-5 h-5" />
                          <span>{viewingFile ? 'Loading Preview...' : 'View Document'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Access Information */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-semibold text-green-900">Medical Record Access</h4>
                      <p className="text-sm text-green-700 mt-1">
                        This comprehensive medical record has been shared with you by {selectedRecord.patientName || 'the patient'}. 
                        You can view all shared information including vitals, diagnosis, medications, and attached documents for medical consultation purposes.
                      </p>
                      {selectedRecord.sharedFields && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600 font-medium">Shared Fields: {selectedRecord.sharedFields}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
