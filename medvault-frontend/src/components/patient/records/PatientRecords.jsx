import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  LockClosedIcon,
  UserIcon,
  CalendarIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon
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

  useEffect(() => {
    fetchAccessibleRecords();
    fetchMyPatients();
  }, []);

  const fetchAccessibleRecords = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/doctor/accessible-records/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAccessibleRecords(data);
      }
    } catch (error) {
      console.error('Error fetching accessible records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPatients = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/doctor/my-patients/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPatientRecords = async (patientId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/doctor/patient-records/${user.id}/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPatientRecords(data);
      }
    } catch (error) {
      console.error('Error fetching patient records:', error);
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
      'OTHER': '📄'
    };
    return icons[type] || '📄';
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  // ✅ NEW: Handle downloading record
  const handleDownloadRecord = async (record) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/doctor/download-record/${user.id}/${record.id}`);
      if (response.ok) {
        // Handle download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = record.title || 'medical-record';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Unable to download file');
      }
    } catch (error) {
      console.error('Error downloading record:', error);
      alert('Download failed');
    }
  };

  const filteredPatients = patients.filter(patient => {
    const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
    const email = (patient.email || '').toLowerCase();
    return patientName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
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
          <p className="text-gray-600 mt-1">Access medical records shared by your patients</p>
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
                      key={patient.id}
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
                    <p className="text-gray-600 ml-11">Medical records you have access to</p>
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
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Access Granted</h4>
                    <p className="text-gray-600 max-w-sm mx-auto">
                      {selectedPatient.firstName || 'This patient'} hasn't shared any medical records with you yet. 
                      Contact them to request access to specific records.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {patientRecords.map(record => (
                      <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="text-2xl">
                              {getRecordTypeIcon(record.recordType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{record.title}</h4>
                              <p className="text-sm text-gray-600">
                                {record.recordType.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Shared
                          </span>
                        </div>

                        {record.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{record.description}</p>
                        )}

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Uploaded: {new Date(record.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Access granted: {new Date(record.grantedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewRecord(record)}
                            className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button 
                            onClick={() => handleDownloadRecord(record)}
                            className="flex-1 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center space-x-2"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-600">Choose a patient from the list to view their shared medical records</p>
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
                      Shared Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accessibleRecords.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(record.grantedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleViewRecord(record)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDownloadRecord(record)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record View Modal */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getRecordTypeIcon(selectedRecord.recordType)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedRecord.title}</h3>
                  <p className="text-sm text-gray-600">{selectedRecord.recordType.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <p className="text-gray-900">{selectedRecord.patientName || 'Unknown Patient'}</p>
                </div>
                
                {selectedRecord.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRecord.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Date</label>
                    <p className="text-gray-900">{new Date(selectedRecord.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shared Date</label>
                    <p className="text-gray-900">{new Date(selectedRecord.grantedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {/* File preview area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Medical Record Document</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {selectedRecord.recordType.replace('_', ' ')} • Shared on {new Date(selectedRecord.grantedAt).toLocaleDateString()}
                  </p>
                  <button 
                    onClick={() => handleDownloadRecord(selectedRecord)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6">
              <button
                onClick={() => setShowRecordModal(false)}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
