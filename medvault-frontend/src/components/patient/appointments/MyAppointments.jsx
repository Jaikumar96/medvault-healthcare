import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  Mail,
  RotateCcw,
  RefreshCw,
  CreditCard,
  Stethoscope,
  Building2,
  Info,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Heart,
  Shield,
  Activity
} from 'lucide-react';

// Pagination Component with Smart Ellipsis
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex
}) => {
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= 1) return pages;
    
    // Always show first page
    pages.push(1);

    if (currentPage <= 3) {
      // Near the beginning: 1 2 3 ... 15
      for (let i = 2; i <= Math.min(3, totalPages - 1); i++) {
        pages.push(i);
      }
      if (totalPages > 3) {
        pages.push('...');
        pages.push(totalPages);
      }
    } else if (currentPage >= totalPages - 2) {
      // Near the end: 1 ... 13 14 15
      if (totalPages > 3) {
        pages.push('...');
      }
      for (let i = Math.max(totalPages - 2, 2); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // In the middle: 1 ... 7 8 9 ... 15
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{startIndex}</span> to{' '}
          <span className="font-semibold">{endIndex}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> items
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-300'
            }`}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-sm text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-300'
            }`}
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MyAppointments = ({ appointments: propAppointments }) => {
  const [allAppointments, setAllAppointments] = useState(propAppointments || []);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [loading, setLoading] = useState(!propAppointments);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [emergencyFilter, setEmergencyFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('appointments');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rescheduleForm, setRescheduleForm] = useState({
    newSlotId: '',
    reason: ''
  });
  const [reschedulingAppointmentId, setReschedulingAppointmentId] = useState(null);
  
  // Pagination states for both tabs
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage, setAppointmentsPerPage] = useState(6);
  const [emergencyCurrentPage, setEmergencyCurrentPage] = useState(1);
  const [emergencyPerPage, setEmergencyPerPage] = useState(6);

  useEffect(() => {
    if (!propAppointments) {
      fetchAppointments();
    }
    fetchEmergencyRequests();
  }, [propAppointments]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    setEmergencyCurrentPage(1);
  }, [emergencyFilter]);

  // Helper function to check if appointment has emergency content
  const hasEmergencyContent = (appointment) => {
    if (!appointment.patientNotes) return false;
    const notes = appointment.patientNotes.toLowerCase();
    return notes.includes('emergency:') || 
           notes.includes('heart attack') || 
           notes.includes('cardiac') ||
           notes.includes('chest pain') ||
           notes.includes('breathing') ||
           notes.includes('unconscious') ||
           notes.includes('severe pain') ||
           notes.includes('bleeding') ||
           notes.includes('fracture') ||
           notes.includes('accident');
  };

  // Helper function to check if content exists and is meaningful
  const hasContent = (value) => {
    if (!value) return false;
    const cleanValue = value.toString().trim();
    
    if (cleanValue.length === 0) return false;
    if (cleanValue.toLowerCase() === 'null') return false;
    if (cleanValue.toLowerCase() === 'undefined') return false;
    if (cleanValue.toLowerCase() === 'not available') return false;
    if (cleanValue.toLowerCase() === 'n/a') return false;
    if (cleanValue.toLowerCase() === 'nothing') return false;
    
    return true;
  };

  // Helper function to check if appointment has been rescheduled
  const hasBeenRescheduled = (appointment) => {
    return (appointment.rescheduleCount && appointment.rescheduleCount >= 1) ||
           hasContent(appointment.rescheduleReason) ||
           appointment.isRescheduled === true ||
           appointment.rescheduled === true ||
           appointment.rescheduleHistory?.length > 0;
  };

  // Helper function to normalize emergency status for filtering
  const normalizeEmergencyStatus = (request) => {
    // For appointment-type emergency requests, map APPROVED to APPROVED for filtering
    if (request.doctorName && request.status === 'APPROVED') {
      return 'APPROVED';
    }
    // For regular emergency requests, keep original status
    return request.status;
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch(`http://localhost:8080/api/patient/appointments/${user.id}`);
      
      if (response.ok) {
        const appointmentsData = await response.json();
        setAllAppointments(appointmentsData);
        
        // Separate emergency appointments
        const emergencyAppts = appointmentsData.filter(hasEmergencyContent);
        setEmergencyRequests(prev => [...prev, ...emergencyAppts]);
        
        Swal.fire({
          icon: 'success',
          title: 'Appointments Loaded',
          text: `Found ${appointmentsData.length} appointments`,
          showConfirmButton: false,
          timer: 2000
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load appointments');
        
        Swal.fire({
          icon: 'error',
          title: 'Failed to Load Appointments',
          text: errorData.error || 'Please try again later'
        });
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Please check your internet connection and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyRequests = async () => {
    try {
      setEmergencyLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch(`http://localhost:8080/api/patient/emergency-requests/${user.id}`);
      
      if (response.ok) {
        const emergencyData = await response.json();
        setEmergencyRequests(emergencyData);
      } else if (response.status !== 404) {
        console.error('Failed to load emergency requests');
      }
    } catch (error) {
      console.error('Error fetching emergency requests:', error);
    } finally {
      setEmergencyLoading(false);
    }
  };

  const formatDoctorName = (name) => {
    if (!name) return 'Doctor Name Unavailable';
    
    let cleanName = name.toString().trim();
    cleanName = cleanName.replace(/^Dr\.\\s*Dr\.\\s*/i, 'Dr. ');
    
    if (!cleanName.toLowerCase().startsWith('dr.')) {
      cleanName = 'Dr. ' + cleanName;
    }
    
    return cleanName;
  };

  // Enhanced patient notes extraction with better formatting
  const extractAndFormatPatientNotes = (notes) => {
    if (!notes || !hasContent(notes)) return null;
    
    let cleanNotes = notes.toString().trim();
    let formattedNotes = [];
    
    // Handle emergency and notes pattern
    if (cleanNotes.includes('EMERGENCY:') || cleanNotes.includes('Notes:') || cleanNotes.includes('|')) {
      const parts = cleanNotes.split('|').map(part => part.trim());
      
      for (const part of parts) {
        if (part.startsWith('EMERGENCY:') || part.toLowerCase().includes('emergency:')) {
          const emergencyContent = part.replace(/EMERGENCY:/i, '').trim();
          if (hasContent(emergencyContent)) {
            formattedNotes.push({
              label: 'Emergency',
              content: emergencyContent,
              type: 'emergency'
            });
          } else {
            formattedNotes.push({
              label: 'Emergency',
              content: 'No emergency notes provided',
              type: 'emergency-empty'
            });
          }
        } else if (part.includes('Notes:')) {
          const notesContent = part.replace(/.*Notes:/, '').trim();
          if (hasContent(notesContent)) {
            formattedNotes.push({
              label: 'Additional Notes',
              content: notesContent,
              type: 'notes'
            });
          } else {
            formattedNotes.push({
              label: 'Additional Notes',
              content: 'No additional notes provided',
              type: 'notes-empty'
            });
          }
        }
      }
    } else {
      // Regular notes without special formatting
      if (hasContent(cleanNotes)) {
        formattedNotes.push({
          label: 'Patient Notes',
          content: cleanNotes,
          type: 'notes'
        });
      }
    }
    
    return formattedNotes.length > 0 ? formattedNotes : null;
  };

  const hasValidAppointmentTime = (appointment) => {
    return appointment.appointmentStartTime && 
           appointment.appointmentStartTime !== 'Not scheduled' &&
           !isNaN(new Date(appointment.appointmentStartTime).getTime());
  };

  // Enhanced reschedule eligibility check
  const canReschedule = (appointment) => {
    if (!hasValidAppointmentTime(appointment)) {
      return { canReschedule: false, reason: 'No valid appointment time' };
    }

    // Check if appointment has been rescheduled
    if (hasBeenRescheduled(appointment)) {
      return { canReschedule: false, reason: 'Already rescheduled once' };
    }

    try {
      const appointmentTime = new Date(appointment.appointmentStartTime);
      const now = new Date();
      
      const timeDiffMs = appointmentTime.getTime() - now.getTime();
      const hoursUntilAppointment = timeDiffMs / (1000 * 60 * 60);
      
      if (appointment.status === 'APPROVED') {
        if (hoursUntilAppointment <= 24) {
          return { canReschedule: false, reason: 'Less than 24 hours remaining' };
        }
        return { canReschedule: true, reason: 'Eligible for rescheduling' };
      } else if (appointment.status === 'PENDING') {
        if (hoursUntilAppointment <= 0) {
          return { canReschedule: false, reason: 'Appointment time has passed' };
        }
        return { canReschedule: true, reason: 'Eligible for rescheduling' };
      }
      
      return { canReschedule: false, reason: 'Status not eligible for rescheduling' };
    } catch (error) {
      return { canReschedule: false, reason: 'Error checking eligibility' };
    }
  };

  // Enhanced reschedule handler
  const handleReschedule = async (appointment) => {
    const rescheduleCheck = canReschedule(appointment);
    
    if (!rescheduleCheck.canReschedule) {
      let message = 'Cannot reschedule this appointment.';
      
      if (rescheduleCheck.reason === 'Already rescheduled once') {
        message = 'This appointment has already been rescheduled once and cannot be rescheduled again.';
      } else if (rescheduleCheck.reason === 'Less than 24 hours remaining') {
        message = 'Approved appointments can only be rescheduled up to 24 hours before the appointment time.';
      }
      
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Reschedule',
        text: message,
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    setReschedulingAppointmentId(appointment.id);

    const result = await Swal.fire({
      title: `Reschedule Appointment with ${formatDoctorName(appointment.doctorName)}?`,
      html: `
        <div class="text-left">
          <p class="mb-2">${appointment.status === 'APPROVED' 
            ? 'This will require doctor approval again.' 
            : 'Select a new time slot for your appointment.'}</p>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
            <p class="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> Each appointment can only be rescheduled once. 
              After this change, the reschedule option will be permanently removed.
            </p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, reschedule'
    });

    if (!result.isConfirmed) {
      setReschedulingAppointmentId(null);
      return;
    }

    setSelectedAppointment(appointment);
    
    let doctorId = appointment.doctorId || appointment.doctor_id || appointment.doctor?.id;
    
    if (!doctorId) {
      setReschedulingAppointmentId(null);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to find doctor information. Please contact support.'
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Loading Available Slots...',
        text: 'Please wait while we fetch available time slots',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch(`http://localhost:8080/api/patient/doctors/${doctorId}/available-slots`);
      
      if (response.ok) {
        const slots = await response.json();
        
        const now = new Date();
        const futureSlots = slots.filter(slot => {
          const slotTime = new Date(slot.startTime);
          return slotTime > now;
        });
        
        Swal.close();
        setReschedulingAppointmentId(null);
        
        if (futureSlots.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'No Available Slots',
            text: 'There are no available slots for this doctor at the moment.'
          });
          return;
        }
        
        setAvailableSlots(futureSlots);
        setShowRescheduleModal(true);
      } else {
        setReschedulingAppointmentId(null);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Load Slots',
          text: 'Unable to fetch available time slots. Please try again.'
        });
      }
    } catch (error) {
      setReschedulingAppointmentId(null);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Please check your internet connection and try again.'
      });
    }
  };

  // Enhanced submit reschedule with permanent reschedule removal
  const submitReschedule = async () => {
    if (!rescheduleForm.newSlotId || !rescheduleForm.reason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please select a time slot and provide a reason for rescheduling.'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Final Rescheduling',
      html: `
        <div class="text-left">
          <p class="mb-3">Are you sure you want to reschedule this appointment?</p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-800">
              <strong>⚠️ Final Warning:</strong> This appointment can only be rescheduled once. 
              After this change, the reschedule button will be permanently removed and no further rescheduling will be possible.
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, reschedule permanently'
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Rescheduling Appointment...',
        text: 'Please wait while we process your request',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/patient/reschedule-appointment/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          newSlotId: rescheduleForm.newSlotId,
          reason: rescheduleForm.reason.trim()
        })
      });

      if (response.ok) {
        // Immediately update local state to reflect rescheduling
        setAllAppointments(prev => prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { 
                ...apt, 
                rescheduleReason: rescheduleForm.reason.trim(),
                rescheduleCount: (apt.rescheduleCount || 0) + 1,
                isRescheduled: true,
                rescheduled: true,
                status: apt.status === 'APPROVED' ? 'PENDING' : apt.status
              }
            : apt
        ));

        setShowRescheduleModal(false);
        setRescheduleForm({ newSlotId: '', reason: '' });
        setSelectedAppointment(null);
        setAvailableSlots([]);
        
        // Fetch fresh data from server
        await fetchAppointments();
        
        Swal.fire({
          icon: 'success',
          title: 'Appointment Rescheduled!',
          html: `
            <div class="text-left">
              <p class="mb-2">${selectedAppointment.status === 'APPROVED' 
                ? 'Your appointment has been rescheduled. Awaiting doctor confirmation.' 
                : 'Your appointment has been rescheduled successfully!'}</p>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <p class="text-sm text-blue-800">
                  <strong>Note:</strong> This appointment cannot be rescheduled again. The reschedule option has been permanently removed.
                </p>
              </div>
            </div>
          `,
          confirmButtonColor: '#3085d6'
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Rescheduling Failed',
          text: errorData.error || 'Failed to reschedule appointment. Please try again.'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reschedule appointment. Please check your connection.'
      });
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime || dateTime === 'Not scheduled') return '';
    
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <AlertCircle size={20} className="text-yellow-600" />;
      case 'APPROVED': return <CheckCircle size={20} className="text-green-600" />;
      case 'REJECTED': return <XCircle size={20} className="text-red-600" />;
      case 'COMPLETED': return <CheckCircle size={20} className="text-blue-600" />;
      case 'ACCEPTED': return <Shield size={20} className="text-green-600" />;
      default: return <AlertCircle size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter regular appointments (excluding emergency ones)
  const regularAppointments = allAppointments.filter(appointment => !hasEmergencyContent(appointment));
  
  // Filter emergency appointments (from both sources)
  const combinedEmergencyRequests = [
    ...emergencyRequests,
    ...allAppointments.filter(hasEmergencyContent)
  ];

  const filteredAppointments = regularAppointments.filter(appointment =>
    filter === 'ALL' || appointment.status === filter
  );

  const filteredEmergencyRequests = combinedEmergencyRequests.filter(request => {
    const normalizedStatus = normalizeEmergencyStatus(request);
    return emergencyFilter === 'ALL' || normalizedStatus === emergencyFilter;
  });

  // Pagination logic for appointments
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  // Pagination logic for emergency requests
  const emergencyTotalPages = Math.ceil(filteredEmergencyRequests.length / emergencyPerPage);
  const emergencyIndexOfLast = emergencyCurrentPage * emergencyPerPage;
  const emergencyIndexOfFirst = emergencyIndexOfLast - emergencyPerPage;
  const currentEmergencyRequests = filteredEmergencyRequests.slice(emergencyIndexOfFirst, emergencyIndexOfLast);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEmergencyPageChange = (page) => {
    setEmergencyCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFilterCounts = (status) => {
    if (status === 'ALL') return regularAppointments.length;
    return regularAppointments.filter(a => a.status === status).length;
  };

  const getEmergencyFilterCounts = (status) => {
    if (status === 'ALL') return combinedEmergencyRequests.length;
    return combinedEmergencyRequests.filter(r => normalizeEmergencyStatus(r) === status).length;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Health Records</h2>
          <p className="text-gray-600 mt-1">View and manage your medical appointments and emergency requests</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={activeTab === 'appointments' ? fetchAppointments : fetchEmergencyRequests}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700"
            disabled={loading || emergencyLoading}
          >
            <RefreshCw size={16} />
            <span>{(loading || emergencyLoading) ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'border-b-2 border-blue-500 bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Calendar size={18} />
              <span>Regular Appointments ({regularAppointments.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'emergency'
                ? 'border-b-2 border-red-500 bg-red-50 text-red-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle size={18} />
              <span>Emergency Requests ({combinedEmergencyRequests.length})</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'appointments' ? (
            <>
              {/* Appointments Filter Tabs */}
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 mb-6">
                <div className="flex space-x-4 overflow-x-auto">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        filter === status
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {status} ({getFilterCounts(status)})
                    </button>
                  ))}
                </div>
                
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Show</span>
                  <select
                    value={appointmentsPerPage}
                    onChange={(e) => {
                      setAppointmentsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={3}>3 per page</option>
                    <option value={6}>6 per page</option>
                    <option value={9}>9 per page</option>
                    <option value={12}>12 per page</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
              </div>

              {/* Results Summary for Appointments */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredAppointments.length}</span> of <span className="font-semibold">{regularAppointments.length}</span> appointments
                </p>
                {totalPages > 1 && (
                  <p className="text-sm text-gray-600">
                    Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                  </p>
                )}
              </div>

              {/* Appointments List */}
              {currentAppointments.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filter === 'ALL' ? 'No regular appointments yet' : `No ${filter.toLowerCase()} appointments`}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {filter === 'ALL'
                      ? 'Book your first appointment to get started with healthcare consultations.'
                      : `You don't have any ${filter.toLowerCase()} appointments at the moment.`
                    }
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentAppointments.map((appointment) => {
                      const rescheduleCheck = canReschedule(appointment);
                      const formattedNotes = extractAndFormatPatientNotes(appointment.patientNotes);
                      const appointmentDateTime = formatDateTime(appointment.appointmentStartTime);
                      const isRescheduled = hasBeenRescheduled(appointment);
                      
                      return (
                        <div key={appointment.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                          {/* Appointment Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User size={24} className="text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {formatDoctorName(appointment.doctorName)}
                                </h3>
                                {hasContent(appointment.doctorSpecialization) ? (
                                  <p className="text-gray-600 flex items-center">
                                    <Stethoscope size={16} className="mr-1" />
                                    {appointment.doctorSpecialization}
                                  </p>
                                ) : (
                                  <p className="text-gray-400 flex items-center text-sm">
                                    <Stethoscope size={16} className="mr-1" />
                                    Specialization not available
                                  </p>
                                )}
                                {appointmentDateTime ? (
                                  <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <Calendar size={16} className="mr-1" />
                                    {appointmentDateTime}
                                  </div>
                                ) : (
                                  <div className="flex items-center text-sm text-gray-400 mt-1">
                                    <Calendar size={16} className="mr-1" />
                                    Time not scheduled
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1">{appointment.status || 'UNKNOWN'}</span>
                              </div>
                              {isRescheduled && (
                                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium border border-purple-200">
                                  Rescheduled
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Approved Appointment Details */}
                          {appointment.status === 'APPROVED' && (
                            <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                              <h4 className="text-green-900 font-semibold mb-3 flex items-center">
                                <CheckCircle size={18} className="mr-2" />
                                Confirmed Appointment Details
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hasValidAppointmentTime(appointment) ? (
                                  <div className="flex items-start space-x-3">
                                    <Clock size={16} className="text-green-600 mt-1" />
                                    <div>
                                      <p className="font-medium text-green-900">Appointment Time</p>
                                      <p className="text-green-700 text-sm">{appointmentDateTime}</p>
                                      {appointment.appointmentEndTime && (
                                        <p className="text-green-600 text-xs">
                                          Duration: {Math.round((new Date(appointment.appointmentEndTime) - new Date(appointment.appointmentStartTime)) / (1000 * 60))} minutes
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start space-x-3">
                                    <Clock size={16} className="text-gray-400 mt-1" />
                                    <div>
                                      <p className="font-medium text-gray-600">Appointment Time</p>
                                      <p className="text-gray-500 text-sm">Time not yet scheduled</p>
                                    </div>
                                  </div>
                                )}

                                {hasContent(appointment.doctorPhone) ? (
                                  <div className="flex items-start space-x-3">
                                    <Phone size={16} className="text-green-600 mt-1" />
                                    <div>
                                      <p className="font-medium text-green-900">Doctor Contact</p>
                                      <p className="text-green-700 text-sm">{appointment.doctorPhone}</p>
                                      <p className="text-green-600 text-xs">Call if needed</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start space-x-3">
                                    <Phone size={16} className="text-gray-400 mt-1" />
                                    <div>
                                      <p className="font-medium text-gray-600">Doctor Contact</p>
                                      <p className="text-gray-500 text-sm">Contact not available</p>
                                    </div>
                                  </div>
                                )}

                                {hasContent(appointment.consultationFees) ? (
                                  <div className="flex items-start space-x-3">
                                    <CreditCard size={16} className="text-green-600 mt-1" />
                                    <div>
                                      <p className="font-medium text-green-900">Consultation Fee</p>
                                      <p className="text-green-700 text-sm">₹{appointment.consultationFees}</p>
                                      <p className="text-green-600 text-xs">Pay at clinic</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start space-x-3">
                                    <CreditCard size={16} className="text-gray-400 mt-1" />
                                    <div>
                                      <p className="font-medium text-gray-600">Consultation Fee</p>
                                      <p className="text-gray-500 text-sm">Fee information not available</p>
                                    </div>
                                  </div>
                                )}

                                {hasContent(appointment.hospitalName) ? (
                                  <div className="flex items-start space-x-3">
                                    <Building2 size={16} className="text-green-600 mt-1" />
                                    <div>
                                      <p className="font-medium text-green-900">Location</p>
                                      <p className="text-green-700 text-sm">{appointment.hospitalName}</p>
                                      {hasContent(appointment.hospitalAddress) && (
                                        <p className="text-green-600 text-xs">{appointment.hospitalAddress}</p>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start space-x-3">
                                    <Building2 size={16} className="text-gray-400 mt-1" />
                                    <div>
                                      <p className="font-medium text-gray-600">Location</p>
                                      <p className="text-gray-500 text-sm">Hospital information not available</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {hasValidAppointmentTime(appointment) && (
                                <div className="mt-4 pt-4 border-t border-green-200">
                                  <h5 className="font-medium text-green-900 mb-2 flex items-center">
                                    <Info size={16} className="mr-2" />
                                    Important Reminders
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-700">
                                    <div className="flex items-center space-x-2">
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                      <span>Arrive 10 minutes early</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                      <span>Bring valid ID proof</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                      <span>Carry previous reports (if any)</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                      <span>List of current medications</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Patient Notes - Only for non-emergency notes */}
                          {formattedNotes && !hasEmergencyContent(appointment) && (
                            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                              <h4 className="text-blue-900 font-medium mb-3 flex items-center">
                                <FileText size={16} className="mr-2" />
                                Notes to Doctor
                              </h4>
                              <div className="space-y-3">
                                {formattedNotes.map((note, index) => (
                                  <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                                    <div className="flex items-start space-x-2">
                                      <div className={`w-3 h-3 rounded-full mt-1 ${
                                        note.type === 'notes' ? 'bg-blue-500' : 'bg-gray-300'
                                      }`}></div>
                                      <div className="flex-1">
                                        <p className="font-medium text-sm text-blue-800">
                                          {note.label}:
                                        </p>
                                        <p className={`text-sm mt-1 ${
                                          note.type.endsWith('-empty') ? 'text-gray-500 italic' : 'text-blue-700'
                                        }`}>
                                          {note.content}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rejection Reason */}
                          {hasContent(appointment.rejectionReason) && (
                            <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
                              <h4 className="text-red-900 font-medium mb-2 flex items-center">
                                <XCircle size={16} className="mr-2" />
                                Rejection Reason
                              </h4>
                              <p className="text-red-800 text-sm">{appointment.rejectionReason}</p>
                            </div>
                          )}

                          {/* Reschedule Information */}
                          {hasContent(appointment.rescheduleReason) && (
                            <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
                              <h4 className="text-purple-900 font-medium mb-2 flex items-center">
                                <RotateCcw size={16} className="mr-2" />
                                Reschedule Information
                              </h4>
                              <p className="text-purple-800 text-sm mb-2">
                                <strong>Reason:</strong> {appointment.rescheduleReason}
                              </p>
                              <div className="bg-purple-100 rounded-lg p-2">
                                <p className="text-xs text-purple-700">
                                  ℹ️ This appointment has been rescheduled and cannot be rescheduled again.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            {!isRescheduled && rescheduleCheck.canReschedule ? (
                              <button
                                onClick={() => handleReschedule(appointment)}
                                disabled={reschedulingAppointmentId === appointment.id}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                              >
                                {reschedulingAppointmentId === appointment.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw size={16} />
                                    <span>Reschedule (One Time Only)</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                                <AlertCircle size={16} />
                                <span>
                                  {isRescheduled
                                    ? 'Already rescheduled - Cannot reschedule again'
                                    : rescheduleCheck.reason === 'Less than 24 hours remaining'
                                    ? 'Cannot reschedule (less than 24 hours remaining)'
                                    : appointment.status === 'COMPLETED'
                                    ? 'Appointment completed'
                                    : appointment.status === 'REJECTED'
                                    ? 'Appointment was rejected'
                                    : 'Rescheduling not available'
                                  }
                                </span>
                              </div>
                            )}

                            {appointment.status === 'APPROVED' && hasContent(appointment.doctorPhone) && (
                              <a
                                href={`tel:${appointment.doctorPhone}`}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                              >
                                <Phone size={16} />
                                <span>Call Doctor</span>
                              </a>
                            )}

                            {appointment.status === 'APPROVED' && hasContent(appointment.doctorEmail) && (
                              <a
                                href={`mailto:${appointment.doctorEmail}?subject=Regarding Appointment${appointmentDateTime ? ` on ${appointmentDateTime}` : ''}`}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                              >
                                <Mail size={16} />
                                <span>Email</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Component for Appointments */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={filteredAppointments.length}
                    itemsPerPage={appointmentsPerPage}
                    startIndex={indexOfFirstAppointment + 1}
                    endIndex={Math.min(indexOfLastAppointment, filteredAppointments.length)}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {/* Emergency Requests Filter Tabs - Simplified with only 4 options */}
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 mb-6">
                <div className="flex space-x-4 overflow-x-auto">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setEmergencyFilter(status)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        emergencyFilter === status
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {status} ({getEmergencyFilterCounts(status)})
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Show</span>
                  <select
                    value={emergencyPerPage}
                    onChange={(e) => {
                      setEmergencyPerPage(Number(e.target.value));
                      setEmergencyCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value={3}>3 per page</option>
                    <option value={6}>6 per page</option>
                    <option value={9}>9 per page</option>
                    <option value={12}>12 per page</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
              </div>

              {/* Results Summary for Emergency Requests */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredEmergencyRequests.length}</span> of <span className="font-semibold">{combinedEmergencyRequests.length}</span> emergency requests
                </p>
                {emergencyTotalPages > 1 && (
                  <p className="text-sm text-gray-600">
                    Page <span className="font-semibold">{emergencyCurrentPage}</span> of <span className="font-semibold">{emergencyTotalPages}</span>
                  </p>
                )}
              </div>

              {/* Emergency Requests List */}
              {emergencyLoading ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p>Loading emergency requests...</p>
                </div>
              ) : currentEmergencyRequests.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {emergencyFilter === 'ALL' ? 'No emergency requests' : `No ${emergencyFilter.toLowerCase()} emergency requests`}
                  </h3>
                  <p className="text-gray-600">
                    {emergencyFilter === 'ALL'
                      ? 'Emergency appointments and requests will appear here.'
                      : `You don't have any ${emergencyFilter.toLowerCase()} emergency requests.`
                    }
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentEmergencyRequests.map((request) => {
                      const formattedNotes = extractAndFormatPatientNotes(request.patientNotes);
                      const isAppointmentType = !!request.doctorName; // Check if it's an appointment converted to emergency
                      const normalizedStatus = normalizeEmergencyStatus(request);
                      
                      return (
                        <div key={request.id} className="bg-white rounded-lg border border-red-200 p-6 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle size={24} className="text-red-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {isAppointmentType ? 
                                    `Emergency Appointment - ${formatDoctorName(request.doctorName)}` :
                                    `Emergency Request #${request.id}`
                                  }
                                </h3>
                                <p className="text-gray-600 flex items-center">
                                  <Clock size={16} className="mr-1" />
                                  {formatDateTime(request.createdAt || request.appointmentStartTime)}
                                </p>
                                {isAppointmentType && hasContent(request.doctorSpecialization) && (
                                  <p className="text-gray-600 flex items-center mt-1">
                                    <Stethoscope size={16} className="mr-1" />
                                    {request.doctorSpecialization}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {request.priority && (
                                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  {request.priority}
                                </div>
                              )}
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(normalizedStatus)}`}>
                                {getStatusIcon(normalizedStatus)}
                                <span className="ml-1">{normalizedStatus}</span>
                              </div>
                            </div>
                          </div>

                          {/* Emergency Details */}
                          <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
                            <h4 className="text-red-900 font-medium mb-3 flex items-center">
                              <Heart size={16} className="mr-2" />
                              Emergency Information
                            </h4>
                            
                            {formattedNotes ? (
                              <div className="space-y-3">
                                {formattedNotes.map((note, index) => (
                                  <div key={index} className="bg-white rounded-lg p-3 border border-red-100">
                                    <div className="flex items-start space-x-2">
                                      <div className={`w-3 h-3 rounded-full mt-1 ${
                                        note.type === 'emergency' ? 'bg-red-500' : 'bg-blue-500'
                                      }`}></div>
                                      <div className="flex-1">
                                        <p className="font-medium text-sm text-red-800">
                                          {note.label}:
                                        </p>
                                        <p className={`text-sm mt-1 ${
                                          note.type === 'emergency' ? 'text-red-700' : 'text-blue-700'
                                        }`}>
                                          {note.content}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div>
                                  <p className="font-medium text-red-800 text-sm">Condition:</p>
                                  <p className="text-red-700 text-sm">{request.condition || 'Emergency condition not specified'}</p>
                                </div>
                                {request.symptoms && (
                                  <div>
                                    <p className="font-medium text-red-800 text-sm">Symptoms:</p>
                                    <p className="text-red-700 text-sm">{request.symptoms}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Response or Rejection */}
                          {request.doctorResponse && (
                            <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                              <h4 className="text-green-900 font-medium mb-2 flex items-center">
                                <CheckCircle size={16} className="mr-2" />
                                Doctor Response
                              </h4>
                              <p className="text-green-700 text-sm">{request.doctorResponse}</p>
                            </div>
                          )}

                          {normalizedStatus === 'REJECTED' && request.rejectionReason && (
                            <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
                              <h4 className="text-red-900 font-medium mb-2 flex items-center">
                                <XCircle size={16} className="mr-2" />
                                Rejection Reason
                              </h4>
                              <p className="text-red-800 text-sm">{request.rejectionReason}</p>
                            </div>
                          )}

                          {/* Emergency Action Buttons */}
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            {normalizedStatus === 'APPROVED' && request.doctorPhone && (
                              <a
                                href={`tel:${request.doctorPhone}`}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                              >
                                <Phone size={16} />
                                <span>Call Doctor</span>
                              </a>
                            )}
                            
                            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                              <AlertTriangle size={16} />
                              <span>Emergency Request - Priority handling</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination for Emergency Requests */}
                  <Pagination
                    currentPage={emergencyCurrentPage}
                    totalPages={emergencyTotalPages}
                    onPageChange={handleEmergencyPageChange}
                    totalItems={filteredEmergencyRequests.length}
                    itemsPerPage={emergencyPerPage}
                    startIndex={emergencyIndexOfFirst + 1}
                    endIndex={Math.min(emergencyIndexOfLast, filteredEmergencyRequests.length)}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Reschedule Appointment</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ One-Time Reschedule:</strong> This appointment can only be rescheduled once. The reschedule button will be permanently removed after this action.
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Reschedule with {formatDoctorName(selectedAppointment.doctorName)}
              {selectedAppointment.status === 'APPROVED' && (
                <span className="block text-orange-600 font-medium mt-1">
                  ⚠️ This will require doctor approval again
                </span>
              )}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Time Slot *
                </label>
                <select
                  value={rescheduleForm.newSlotId}
                  onChange={(e) => setRescheduleForm(prev => ({ ...prev, newSlotId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a time slot</option>
                  {availableSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {new Date(slot.startTime).toLocaleString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rescheduling *
                </label>
                <textarea
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please explain why you need to reschedule..."
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4 mt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleForm({ newSlotId: '', reason: '' });
                  setSelectedAppointment(null);
                  setAvailableSlots([]);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReschedule}
                disabled={!rescheduleForm.newSlotId || !rescheduleForm.reason.trim()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Final Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
