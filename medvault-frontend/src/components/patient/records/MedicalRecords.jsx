import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // ✅ SweetAlert2 import
import { 
  DocumentTextIcon, 
  PlusIcon, 
  EyeIcon, 
  ShareIcon, 
  TrashIcon,
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  StarIcon,
  PencilIcon,
  ClockIcon,
  HeartIcon,
  BeakerIcon,
  ShieldCheckIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [sharingDoctorId, setSharingDoctorId] = useState(null);
  
  // ✅ Enhanced sharing states
  const [granularSharing, setGranularSharing] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [sharingDuration, setSharingDuration] = useState(24);
  const [customDuration, setCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState('');
  
  // Search and pagination states
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(6);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  
  // ✅ Enhanced upload form with all vitals and diagnosis
  const [uploadForm, setUploadForm] = useState({
    file: null,
    recordType: 'LAB_REPORT',
    title: '',
    description: '',
    bloodGroup: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    diagnosisCondition: '',
    medication: ''
  });

  // ✅ Edit form state
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // ✅ Enhanced constants
  const recordTypes = [
    { value: 'LAB_REPORT', label: 'Lab Report', icon: '🧪', color: 'bg-blue-100 text-blue-800' },
    { value: 'PRESCRIPTION', label: 'Prescription', icon: '💊', color: 'bg-green-100 text-green-800' },
    { value: 'DIAGNOSIS', label: 'Diagnosis', icon: '📋', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'X_RAY', label: 'X-Ray', icon: '🩻', color: 'bg-purple-100 text-purple-800' },
    { value: 'MRI_SCAN', label: 'MRI Scan', icon: '🧠', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'CT_SCAN', label: 'CT Scan', icon: '📷', color: 'bg-pink-100 text-pink-800' },
    { value: 'BLOOD_TEST', label: 'Blood Test', icon: '🩸', color: 'bg-red-100 text-red-800' },
    { value: 'VITALS', label: 'Vital Signs', icon: '❤️', color: 'bg-orange-100 text-orange-800' },
    { value: 'OTHER', label: 'Other', icon: '📄', color: 'bg-gray-100 text-gray-800' }
  ];

  // ✅ Blood groups and diagnosis conditions
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const diagnosisConditions = [
    'Diabetes', 'Hypertension', 'COVID-19', 'General Check-up', 
    'Heart Disease', 'Respiratory Issues', 'Neurological', 'Orthopedic', 'Allergy', 'Other'
  ];

  // ✅ Shareable fields for granular sharing
  const shareableFields = [
    { id: 'basicInfo', label: 'Basic Info (Title, Type)', icon: '📄' },
    { id: 'bloodGroup', label: 'Blood Group', icon: '🩸' },
    { id: 'vitals', label: 'Vital Signs (BP, HR, Temp, Weight)', icon: '❤️' },
    { id: 'diagnosis', label: 'Diagnosis & Condition', icon: '🏥' },
    { id: 'medication', label: 'Medications', icon: '💊' },
    { id: 'description', label: 'Description & Notes', icon: '📝' },
    { id: 'fileContent', label: 'File/Document Content', icon: '📎' }
  ];

  // ✅ Duration options
  const durationOptions = [
    { value: 1, label: '1 Hour' },
    { value: 6, label: '6 Hours' },
    { value: 12, label: '12 Hours' },
    { value: 24, label: '24 Hours (Default)' },
    { value: 48, label: '2 Days' },
    { value: 168, label: '1 Week' },
    { value: 0, label: 'Custom Duration' }
  ];

  // ✅ SweetAlert2 Toast Configuration
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  useEffect(() => {
    fetchRecords();
    fetchDoctors();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [doctorSearch, doctorFilter]);

  const fetchRecords = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/patient/medical-records/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      // ✅ SweetAlert2 error
      Toast.fire({
        icon: 'error',
        title: 'Failed to fetch medical records'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const response = await fetch('http://localhost:8080/api/patient/doctors/approved');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // ✅ SweetAlert2 error
      Toast.fire({
        icon: 'error',
        title: 'Failed to fetch doctors list'
      });
    } finally {
      setDoctorsLoading(false);
    }
  };

  // ✅ Enhanced upload with SweetAlert2
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title) {
      // ✅ SweetAlert2 validation
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select a file and enter a title',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // ✅ SweetAlert2 loading
    Swal.fire({
      title: 'Uploading Medical Record',
      text: 'Please wait while we process your file...',
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const formData = new FormData();
      
      // Basic fields
      formData.append('file', uploadForm.file);
      formData.append('recordType', uploadForm.recordType);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      
      // ✅ Vitals and diagnosis fields
      if (uploadForm.bloodGroup) formData.append('bloodGroup', uploadForm.bloodGroup);
      if (uploadForm.bloodPressure) formData.append('bloodPressure', uploadForm.bloodPressure);
      if (uploadForm.heartRate) formData.append('heartRate', uploadForm.heartRate);
      if (uploadForm.temperature) formData.append('temperature', uploadForm.temperature);
      if (uploadForm.weight) formData.append('weight', uploadForm.weight);
      if (uploadForm.diagnosisCondition) formData.append('diagnosisCondition', uploadForm.diagnosisCondition);
      if (uploadForm.medication) formData.append('medication', uploadForm.medication);

      const response = await fetch(`http://localhost:8080/api/patient/medical-records/upload-enhanced/${user.id}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // ✅ SweetAlert2 success
        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: 'Your medical record has been uploaded successfully',
          confirmButtonColor: '#10b981'
        });
        setShowUploadForm(false);
        setUploadForm({
          file: null, recordType: 'LAB_REPORT', title: '', description: '',
          bloodGroup: '', bloodPressure: '', heartRate: '', temperature: '',
          weight: '', diagnosisCondition: '', medication: ''
        });
        fetchRecords();
      } else {
        // ✅ SweetAlert2 error
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'Failed to upload your medical record. Please try again.',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (error) {
      console.error('Error uploading record:', error);
      // ✅ SweetAlert2 error
      Swal.fire({
        icon: 'error',
        title: 'Upload Error',
        text: 'An error occurred while uploading your record. Please check your connection and try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // ✅ Enhanced revoke function with SweetAlert2
  const revokePermissionImmediate = async (permissionId, doctorName) => {
    console.log('REVOKE DEBUG:', { permissionId, doctorName, type: typeof permissionId });
    
    if (!permissionId || permissionId === 'undefined' || permissionId === undefined) {
      console.error('Invalid permission ID:', permissionId);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid permission ID',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // ✅ SweetAlert2 confirmation
    const result = await Swal.fire({
      title: 'Revoke Access?',
      text: `Are you sure you want to immediately revoke access for ${doctorName}? This action cannot be undone and the doctor will lose access instantly.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, revoke access',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    // ✅ Show loading
    Swal.fire({
      title: 'Revoking Access',
      text: 'Please wait...',
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      console.log('Sending request:', {
        url: `http://localhost:8080/api/patient/records/revoke-permission-immediate/${user.id}`,
        body: { permissionId: permissionId }
      });
      
      const response = await fetch(`http://localhost:8080/api/patient/records/revoke-permission-immediate/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          permissionId: permissionId 
        })
      });

      if (response.ok) {
        // ✅ SweetAlert2 success
        Swal.fire({
          icon: 'success',
          title: 'Access Revoked!',
          text: `Access has been successfully revoked for ${doctorName}`,
          confirmButtonColor: '#10b981'
        });
        fetchRecords();
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        // ✅ SweetAlert2 error
        Swal.fire({
          icon: 'error',
          title: 'Failed to Revoke Access',
          text: 'Unable to revoke access. Please try again.',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // ✅ SweetAlert2 error
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Error revoking access. Please check your connection.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // ✅ Enhanced granular sharing with SweetAlert2
  const shareRecordGranular = async (doctorId) => {
    setShareLoading(true);
    setSharingDoctorId(doctorId);
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const finalDuration = customDuration ? (parseInt(customHours) || 24) : sharingDuration;
      
      const payload = {
        doctorId: doctorId,
        recordId: selectedRecord.id,
        permissionType: granularSharing ? 'GRANULAR_ACCESS' : 'FULL_ACCESS',
        sharedFields: granularSharing ? selectedFields : null,
        durationHours: finalDuration
      };

      const response = await fetch(`http://localhost:8080/api/patient/records/grant-granular-permission/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const doctor = doctors.find(d => d.id === doctorId);
        const doctorName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}`.trim() : 'Unknown Doctor';
        
        // ✅ SweetAlert2 success with details
        Swal.fire({
          icon: 'success',
          title: 'Record Shared Successfully!',
          html: `
            <div class="text-left">
              <p><strong>Doctor:</strong> ${doctorName}</p>
              <p><strong>Access Type:</strong> ${payload.permissionType.replace('_', ' ')}</p>
              <p><strong>Duration:</strong> ${finalDuration} hours</p>
              ${granularSharing && selectedFields.length > 0 ? 
                `<p><strong>Shared Fields:</strong> ${selectedFields.join(', ')}</p>` : ''}
              ${result.expiresAt ? 
                `<p><strong>Expires:</strong> ${new Date(result.expiresAt).toLocaleString()}</p>` : ''}
            </div>
          `,
          confirmButtonColor: '#10b981'
        });
        
        setShareSuccess({
          doctorName: doctorName,
          permissionType: payload.permissionType,
          duration: finalDuration,
          fields: granularSharing ? selectedFields : ['all'],
          expiresAt: result.expiresAt
        });
        
        setTimeout(() => {
          setShareSuccess(null);
          setSharingDoctorId(null);
          fetchRecords();
        }, 4000);
      } else {
        // ✅ SweetAlert2 error
        Swal.fire({
          icon: 'error',
          title: 'Sharing Failed',
          text: 'Failed to share the medical record. Please try again.',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (error) {
      console.error('Error sharing record:', error);
      // ✅ SweetAlert2 error
      Swal.fire({
        icon: 'error',
        title: 'Sharing Error',
        text: 'An error occurred while sharing the record. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setShareLoading(false);
    }
  };

  // ✅ Enhanced edit with SweetAlert2
  const handleEditRecord = async () => {
    if (!editForm.title?.trim()) {
      // ✅ SweetAlert2 validation
      Swal.fire({
        icon: 'warning',
        title: 'Title Required',
        text: 'Please enter a title for the medical record',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    setEditLoading(true);
    
    // ✅ Show loading
    Swal.fire({
      title: 'Updating Record',
      text: 'Please wait while we update your medical record...',
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/patient/medical-records/edit/${user.id}/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        // ✅ SweetAlert2 success
        Swal.fire({
          icon: 'success',
          title: 'Record Updated!',
          text: 'Your medical record has been updated successfully',
          confirmButtonColor: '#10b981'
        });
        setShowEditModal(false);
        fetchRecords();
      } else {
        // ✅ SweetAlert2 error
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Failed to update the medical record. Please try again.',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (error) {
      console.error('Error editing record:', error);
      // ✅ SweetAlert2 error
      Swal.fire({
        icon: 'error',
        title: 'Update Error',
        text: 'An error occurred while updating the record. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setEditLoading(false);
    }
  };

  // ✅ Enhanced delete with SweetAlert2
  const deleteRecord = async (recordId, recordTitle) => {
    // ✅ SweetAlert2 confirmation
    const result = await Swal.fire({
      title: 'Delete Medical Record?',
      text: `Are you sure you want to delete "${recordTitle}"? This will revoke all shared access and cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    // ✅ Show loading
    Swal.fire({
      title: 'Deleting Record',
      text: 'Please wait...',
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/patient/medical-records/delete/${user.id}/${recordId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        // ✅ SweetAlert2 success with details
        Swal.fire({
          icon: 'success',
          title: 'Record Deleted!',
          text: `Medical record deleted successfully. ${result.revokedPermissions} doctor permissions revoked.`,
          confirmButtonColor: '#10b981'
        });
        fetchRecords();
      } else {
        // ✅ SweetAlert2 error
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: 'Failed to delete the medical record. Please try again.',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      // ✅ SweetAlert2 error
      Swal.fire({
        icon: 'error',
        title: 'Delete Error',
        text: 'An error occurred while deleting the record. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Helper functions (same as before)
  const getFilteredDoctors = () => {
    let filtered = doctors;

    if (doctorSearch.trim()) {
      const searchTerm = doctorSearch.toLowerCase();
      filtered = filtered.filter(doctor => {
        const fullName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.toLowerCase();
        const specialization = (doctor.specialization || '').toLowerCase();
        return fullName.includes(searchTerm) || specialization.includes(searchTerm);
      });
    }

    if (doctorFilter !== 'all' && selectedRecord) {
      const sharedDoctorIds = selectedRecord.permissions?.map(p => p.doctorId) || [];
      if (doctorFilter === 'shared') {
        filtered = filtered.filter(doctor => sharedDoctorIds.includes(doctor.id));
      } else if (doctorFilter === 'unshared') {
        filtered = filtered.filter(doctor => !sharedDoctorIds.includes(doctor.id));
      }
    }

    return filtered;
  };

  const getPaginatedDoctors = () => {
    const filtered = getFilteredDoctors();
    const startIndex = (currentPage - 1) * doctorsPerPage;
    const endIndex = startIndex + doctorsPerPage;
    return {
      doctors: filtered.slice(startIndex, endIndex),
      totalDoctors: filtered.length,
      totalPages: Math.ceil(filtered.length / doctorsPerPage),
      currentPage,
      hasNext: currentPage < Math.ceil(filtered.length / doctorsPerPage),
      hasPrev: currentPage > 1
    };
  };

  const isDoctorShared = (doctorId) => {
    if (!selectedRecord?.permissions) return false;
    return selectedRecord.permissions.some(p => p.doctorId === doctorId);
  };

  const getRecordTypeInfo = (type) => {
    return recordTypes.find(rt => rt.value === type) || recordTypes[recordTypes.length - 1];
  };

  const handleOpenShareModal = (record) => {
    setSelectedRecord(record);
    setShowShareModal(true);
    setGranularSharing(false);
    setSelectedFields([]);
    setSharingDuration(24);
    setCustomDuration(false);
    setCustomHours('');
    setDoctorSearch('');
    setDoctorFilter('all');
    setCurrentPage(1);
    setShareSuccess(null);
  };

  const handleOpenEditModal = (record) => {
    setSelectedRecord(record);
    setEditForm({
      title: record.title || '',
      description: record.description || '',
      bloodGroup: record.bloodGroup || '',
      bloodPressure: record.bloodPressure || '',
      heartRate: record.heartRate || '',
      temperature: record.temperature || '',
      weight: record.weight || '',
      diagnosisCondition: record.diagnosisCondition || '',
      medication: record.medication || ''
    });
    setShowEditModal(true);
  };

  // ✅ Time remaining formatter
  const formatTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'No expiry';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const paginationData = getPaginatedDoctors();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <DocumentTextIcon className="w-8 h-8 text-blue-600" />
            <span>Medical Records</span>
          </h2>
          <p className="text-gray-600 mt-1">Manage and share your medical documents with enhanced privacy controls</p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Upload Record</span>
        </button>
      </div>

      {/* Records Grid */}
      {records.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Records</h3>
          <p className="text-gray-600 mb-4">Start by uploading your first medical record with vitals tracking.</p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Upload Your First Record</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record, recordIndex) => {
            const recordType = getRecordTypeInfo(record.recordType);
            const hasVitals = record.bloodGroup || record.bloodPressure || record.heartRate || record.temperature || record.weight;
            const hasDiagnosis = record.diagnosisCondition;
            const hasMedication = record.medication;
            
            return (
              <div key={`record-${record.id}-${recordIndex}`} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{recordType.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{record.title}</h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${recordType.color}`}>
                          {recordType.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(record)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit Record"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRecord(record.id, record.title)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Record"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ✅ Enhanced Info Section */}
                  <div className="space-y-3 mb-4">
                    {record.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{record.description}</p>
                    )}
                    
                    {/* ✅ Vitals Indicators */}
                    <div className="flex flex-wrap gap-2">
                      {hasVitals && (
                        <div className="flex items-center space-x-1 bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs">
                          <HeartIcon className="w-3 h-3" />
                          <span>Vitals</span>
                        </div>
                      )}
                      {hasDiagnosis && (
                        <div className="flex items-center space-x-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs">
                          <BeakerIcon className="w-3 h-3" />
                          <span>{record.diagnosisCondition}</span>
                        </div>
                      )}
                      {hasMedication && (
                        <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                          <span className="text-xs">💊</span>
                          <span>Medication</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      Uploaded: {formatDateTime(record.uploadedAt)}
                      {record.updatedAt && (
                        <span className="block">Updated: {formatDateTime(record.updatedAt)}</span>
                      )}
                    </div>
                  </div>

                  {/* ✅ Enhanced Sharing Status */}
                  {record.permissions && record.permissions.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Shared with:</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {record.permissions.length} doctor{record.permissions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {record.permissions.slice(0, 2).map((permission, permIndex) => {
                          const permissionId = permission.id || permission.permissionId || permission.recordPermissionId;
                          
                          return (
                            <div key={`perm-${record.id}-${permIndex}`} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-700">{permission.doctorName}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  permission.hoursRemaining > 0 && permission.hoursRemaining <= 2 
                                  ? 'bg-red-100 text-red-600' 
                                  : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {formatTimeRemaining(permission.expiresAt)}
                                </span>
                                {permissionId && (
                                  <button
                                    onClick={() => revokePermissionImmediate(permissionId, permission.doctorName)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Revoke Access Immediately"
                                  >
                                    <NoSymbolIcon className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {record.permissions.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{record.permissions.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 text-sm text-gray-500">
                      <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                      Private - not shared
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenShareModal(record)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShareIcon className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowViewModal(true);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Enhanced Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleUpload}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Upload Medical Record</h3>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">Upload your medical records with comprehensive vitals and diagnosis information</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">📄 Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
                    <select
                      value={uploadForm.recordType}
                      onChange={(e) => setUploadForm({...uploadForm, recordType: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {recordTypes.map(type => (
                        <option key={`upload-type-${type.value}`} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Blood Test Results - Jan 2025"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                    <input
                      type="file"
                      onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Supported: PDF, Images, Word documents</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Additional notes or description..."
                    />
                  </div>
                </div>

                {/* Vitals Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">❤️ Vitals Measurements</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                      <select
                        value={uploadForm.bloodGroup}
                        onChange={(e) => setUploadForm({...uploadForm, bloodGroup: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map(group => (
                          <option key={`upload-blood-${group}`} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                      <input
                        type="text"
                        value={uploadForm.bloodPressure}
                        onChange={(e) => setUploadForm({...uploadForm, bloodPressure: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 120/80"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (BPM)</label>
                      <input
                        type="number"
                        value={uploadForm.heartRate}
                        onChange={(e) => setUploadForm({...uploadForm, heartRate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 72"
                        min="30"
                        max="200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={uploadForm.temperature}
                        onChange={(e) => setUploadForm({...uploadForm, temperature: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 36.5"
                        min="30"
                        max="45"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={uploadForm.weight}
                        onChange={(e) => setUploadForm({...uploadForm, weight: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 65.5"
                        min="1"
                        max="300"
                      />
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Medication */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">🏥 Diagnosis & Treatment</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis/Condition</label>
                    <select
                      value={uploadForm.diagnosisCondition}
                      onChange={(e) => setUploadForm({...uploadForm, diagnosisCondition: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Condition</option>
                      {diagnosisConditions.map(condition => (
                        <option key={`upload-diagnosis-${condition}`} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medication & Dosage</label>
                    <textarea
                      value={uploadForm.medication}
                      onChange={(e) => setUploadForm({...uploadForm, medication: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="e.g., Metformin 500mg twice daily, Lisinopril 10mg once daily..."
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Enhanced Sharing Modal with Granular Controls */}
      {showShareModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Share Medical Record</h3>
                  <p className="text-gray-600 mt-1">
                    Sharing <span className="font-medium">{selectedRecord.title}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Privacy Level Selection */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Privacy Level
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="sharingType"
                        checked={!granularSharing}
                        onChange={() => setGranularSharing(false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Full Access</span>
                        <p className="text-sm text-gray-600">Share all information in this record</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="sharingType"
                        checked={granularSharing}
                        onChange={() => setGranularSharing(true)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Granular Sharing</span>
                        <p className="text-sm text-gray-600">Choose specific fields to share</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Granular Field Selection */}
                {granularSharing && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Select Fields to Share</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {shareableFields.map(field => (
                        <label key={`share-field-${field.id}`} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedFields.includes(field.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFields([...selectedFields, field.id]);
                              } else {
                                setSelectedFields(selectedFields.filter(f => f !== field.id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{field.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{field.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {selectedFields.length === 0 && granularSharing && (
                      <p className="text-sm text-red-600 mt-2">Please select at least one field to share</p>
                    )}
                  </div>
                )}

                {/* Time Duration Selection */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2 text-green-600" />
                    Access Duration
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {durationOptions.map(option => (
                      <label key={`duration-${option.value}`} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="duration"
                          value={option.value}
                          checked={customDuration ? option.value === 0 : sharingDuration === option.value}
                          onChange={() => {
                            if (option.value === 0) {
                              setCustomDuration(true);
                              setSharingDuration(0);
                            } else {
                              setCustomDuration(false);
                              setSharingDuration(option.value);
                            }
                          }}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {customDuration && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom Hours</label>
                      <input
                        type="number"
                        value={customHours}
                        onChange={(e) => setCustomHours(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter number of hours"
                        min="1"
                        max="8760"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum 8760 hours (1 year)</p>
                    </div>
                  )}
                </div>

                {/* Doctor Search and Filter */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Select Doctors</h4>
                    <div className="flex space-x-2">
                      <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={doctorSearch}
                          onChange={(e) => setDoctorSearch(e.target.value)}
                          placeholder="Search doctors..."
                          className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <select
                        value={doctorFilter}
                        onChange={(e) => setDoctorFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Doctors</option>
                        <option value="shared">Already Shared</option>
                        <option value="unshared">Not Shared</option>
                      </select>
                    </div>
                  </div>

                  {/* Success Message */}
                  {shareSuccess && (
                    <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="font-medium">Shared successfully!</span>
                      </div>
                      <div className="mt-2 text-sm">
                        <p><strong>Doctor:</strong> {shareSuccess.doctorName}</p>
                        <p><strong>Type:</strong> {shareSuccess.permissionType}</p>
                        <p><strong>Duration:</strong> {shareSuccess.duration} hours</p>
                        {shareSuccess.fields && shareSuccess.fields.length > 0 && shareSuccess.fields[0] !== 'all' && (
                          <p><strong>Fields:</strong> {shareSuccess.fields.join(', ')}</p>
                        )}
                        {shareSuccess.expiresAt && (
                          <p><strong>Expires:</strong> {formatDateTime(shareSuccess.expiresAt)}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Doctors Grid */}
                  {doctorsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading doctors...</p>
                    </div>
                  ) : paginationData.totalDoctors === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p>No doctors found matching your criteria</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginationData.doctors.map((doctor, doctorIndex) => {
                        const isShared = isDoctorShared(doctor.id);
                        const isSharing = sharingDoctorId === doctor.id && shareLoading;
                        const canShare = !granularSharing || selectedFields.length > 0;
                        
                        return (
                          <div 
                            key={`doctor-share-${doctor.id}-${doctorIndex}`} 
                            className={`border rounded-lg p-4 ${isShared ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</h5>
                                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-gray-500">
                                  <p>{doctor.email}</p>
                                  {doctor.hospitalName && <p>{doctor.hospitalName}</p>}
                                </div>

                                {/* Current sharing status */}
                                {isShared && (
                                  <div className="mt-2">
                                    {selectedRecord.permissions
                                      .filter(p => p.doctorId === doctor.id)
                                      .map((permission, permIndex) => (
                                        <div key={`current-perm-${permission.id || permIndex}`} className="text-xs bg-green-100 text-green-700 p-2 rounded">
                                          <div className="flex items-center justify-between">
                                            <span>{permission.permissionType}</span>
                                            <span className="font-medium">{formatTimeRemaining(permission.expiresAt)}</span>
                                          </div>
                                          {permission.sharedFields && (
                                            <p className="mt-1 text-green-600">Fields: {permission.sharedFields}</p>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>

                              <div className="ml-4">
                                {isSharing ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-sm text-blue-600">Sharing...</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => canShare && shareRecordGranular(doctor.id)}
                                    disabled={!canShare}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      isShared 
                                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                        : canShare 
                                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    {isShared ? 'Update Share' : 'Share'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {paginationData.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="text-sm text-gray-600">
                        Showing {((paginationData.currentPage - 1) * doctorsPerPage) + 1} to {Math.min(paginationData.currentPage * doctorsPerPage, paginationData.totalDoctors)} of {paginationData.totalDoctors} doctors
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={!paginationData.hasPrev}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-2 text-sm text-gray-700">
                          {paginationData.currentPage} of {paginationData.totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={!paginationData.hasNext}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Enhanced Edit Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <PencilIcon className="w-6 h-6 text-blue-600" />
                    <span>Edit Medical Record</span>
                  </h3>
                  <p className="text-gray-600 mt-1">Update record information and vitals</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Additional notes or description..."
                  />
                </div>
              </div>

              {/* Vitals Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Vitals Measurements</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <select
                      value={editForm.bloodGroup}
                      onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(group => (
                        <option key={`edit-blood-${group}`} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                    <input
                      type="text"
                      value={editForm.bloodPressure}
                      onChange={(e) => setEditForm({...editForm, bloodPressure: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 120/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (BPM)</label>
                    <input
                      type="number"
                      value={editForm.heartRate}
                      onChange={(e) => setEditForm({...editForm, heartRate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 72"
                      min="30"
                      max="200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.temperature}
                      onChange={(e) => setEditForm({...editForm, temperature: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 36.5"
                      min="30"
                      max="45"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.weight}
                      onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 65.5"
                      min="1"
                      max="300"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis & Medication */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Diagnosis & Treatment</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis/Condition</label>
                  <select
                    value={editForm.diagnosisCondition}
                    onChange={(e) => setEditForm({...editForm, diagnosisCondition: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Condition</option>
                    {diagnosisConditions.map(condition => (
                      <option key={`edit-diagnosis-${condition}`} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medication & Dosage</label>
                  <textarea
                    value={editForm.medication}
                    onChange={(e) => setEditForm({...editForm, medication: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="e.g., Metformin 500mg twice daily, Lisinopril 10mg once daily..."
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditRecord}
                disabled={editLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {editLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>Update Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Enhanced View Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <span className="text-2xl">{getRecordTypeInfo(selectedRecord.recordType).icon}</span>
                    <span>{selectedRecord.title}</span>
                  </h3>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-2 ${getRecordTypeInfo(selectedRecord.recordType).color}`}>
                    {getRecordTypeInfo(selectedRecord.recordType).label}
                  </span>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div><span className="font-medium">Title:</span> {selectedRecord.title}</div>
                  {selectedRecord.description && (
                    <div><span className="font-medium">Description:</span> {selectedRecord.description}</div>
                  )}
                  <div><span className="font-medium">Type:</span> {getRecordTypeInfo(selectedRecord.recordType).label}</div>
                  <div><span className="font-medium">Uploaded:</span> {formatDateTime(selectedRecord.uploadedAt)}</div>
                  {selectedRecord.updatedAt && (
                    <div><span className="font-medium">Updated:</span> {formatDateTime(selectedRecord.updatedAt)}</div>
                  )}
                </div>
              </div>

              {/* Vitals Information */}
              {(selectedRecord.bloodGroup || selectedRecord.bloodPressure || selectedRecord.heartRate || selectedRecord.temperature || selectedRecord.weight) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <HeartIcon className="w-5 h-5 mr-2 text-red-600" />
                    Vitals Measurements
                  </h4>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedRecord.bloodGroup && (
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl mb-1">🩸</div>
                          <div className="font-medium text-red-700">{selectedRecord.bloodGroup}</div>
                          <div className="text-xs text-gray-600">Blood Group</div>
                        </div>
                      )}
                      {selectedRecord.bloodPressure && (
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl mb-1">💓</div>
                          <div className="font-medium text-red-700">{selectedRecord.bloodPressure}</div>
                          <div className="text-xs text-gray-600">Blood Pressure</div>
                        </div>
                      )}
                      {selectedRecord.heartRate && (
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl mb-1">❤️</div>
                          <div className="font-medium text-red-700">{selectedRecord.heartRate} BPM</div>
                          <div className="text-xs text-gray-600">Heart Rate</div>
                        </div>
                      )}
                      {selectedRecord.temperature && (
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl mb-1">🌡️</div>
                          <div className="font-medium text-red-700">{selectedRecord.temperature}°C</div>
                          <div className="text-xs text-gray-600">Temperature</div>
                        </div>
                      )}
                      {selectedRecord.weight && (
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl mb-1">⚖️</div>
                          <div className="font-medium text-red-700">{selectedRecord.weight} kg</div>
                          <div className="text-xs text-gray-600">Weight</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnosis & Medication */}
              {(selectedRecord.diagnosisCondition || selectedRecord.medication) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <BeakerIcon className="w-5 h-5 mr-2 text-yellow-600" />
                    Diagnosis & Treatment
                  </h4>
                  <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
                    {selectedRecord.diagnosisCondition && (
                      <div className="bg-white rounded-lg p-3">
                        <div className="font-medium text-yellow-700 mb-1">Diagnosis/Condition</div>
                        <div className="text-gray-800">{selectedRecord.diagnosisCondition}</div>
                      </div>
                    )}
                    {selectedRecord.medication && (
                      <div className="bg-white rounded-lg p-3">
                        <div className="font-medium text-yellow-700 mb-1">💊 Medication & Dosage</div>
                        <div className="text-gray-800 whitespace-pre-wrap">{selectedRecord.medication}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sharing Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <ShareIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Sharing Status
                </h4>
                {selectedRecord.permissions && selectedRecord.permissions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRecord.permissions.map((permission, permIndex) => (
                      <div key={`view-perm-${permission.id || permIndex}`} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-green-800">{permission.doctorName}</div>
                            <div className="text-sm text-green-600">
                              {permission.permissionType} • Granted {formatDateTime(permission.grantedAt)}
                            </div>
                            {permission.sharedFields && (
                              <div className="text-xs text-green-600 mt-1">
                                📎 Shared fields: {permission.sharedFields}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              permission.hoursRemaining > 0 && permission.hoursRemaining <= 2 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formatTimeRemaining(permission.expiresAt)}
                            </div>
                            <button
                              onClick={() => revokePermissionImmediate(permission.id, permission.doctorName)}
                              className="text-xs text-red-600 hover:text-red-800 mt-1 flex items-center space-x-1"
                            >
                              <NoSymbolIcon className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                    <ShieldCheckIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p>This record is private and not shared with any doctors</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenEditModal(selectedRecord);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenShareModal(selectedRecord);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <ShareIcon className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
