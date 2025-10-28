import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, FileText, Phone, Mail } from 'lucide-react';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  // ✅ FIX: Call fetchAppointments in useEffect
  useEffect(() => {
    fetchAppointments();
  }, []); // Empty dependency array means it runs once on mount

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('Fetching appointments for user:', user.id);
      
      const response = await fetch(`http://localhost:8080/api/patient/appointments/${user.id}`);
      
      if (response.ok) {
        const appointmentsData = await response.json();
        console.log('Appointments loaded:', appointmentsData);
        setAppointments(appointmentsData);
      } else {
        console.error('Failed to fetch appointments:', response.status, response.statusText);
        if (response.status === 400) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load appointments. Please check your account status.');
        } else {
          setError('Failed to load appointments. Please try again later.');
        }
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Network error. Please check your connection and try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not scheduled';
    
    try {
      return new Date(dateTime).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'REJECTED':
        return <XCircle size={20} className="text-red-600" />;
      case 'COMPLETED':
        return <CheckCircle size={20} className="text-blue-600" />;
      default:
        return <AlertCircle size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusMessage = (appointment) => {
    if (!appointment) return '';
    
    switch (appointment.status) {
      case 'PENDING':
        return 'Your appointment request is pending doctor approval.';
      case 'APPROVED':
        return 'Your appointment has been confirmed by the doctor.';
      case 'REJECTED':
        return appointment.rejectionReason || 'Your appointment was rejected by the doctor.';
      case 'COMPLETED':
        return 'Your appointment has been completed.';
      default:
        return 'Appointment status unknown.';
    }
  };

  const filteredAppointments = appointments.filter(appointment => 
    filter === 'ALL' || appointment.status === filter
  );

  const getFilterCounts = (status) => {
    if (status === 'ALL') return appointments.length;
    return appointments.filter(a => a.status === status).length;
  };

  // ✅ FIX: Add error handling UI
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          </div>
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
              <XCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Appointments</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="space-x-4">
                <button 
                  onClick={fetchAppointments}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
                <button 
                  onClick={() => setError(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600">Track your appointment requests and confirmations</p>
            </div>
            {/* ✅ FIX: Add refresh button */}
            <button
              onClick={fetchAppointments}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Filter Tabs */}
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
        </div>

        <div className="p-6">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'ALL' ? 'No appointments yet' : `No ${filter.toLowerCase()} appointments`}
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'ALL' 
                  ? 'Book your first appointment to get started with healthcare consultations.'
                  : `You don't have any ${filter.toLowerCase()} appointments at the moment.`
                }
              </p>
              {filter === 'ALL' && (
                <button
                  onClick={() => window.location.href = '/patient/book-appointment'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Calendar size={16} className="mr-2" />
                  Book Your First Appointment
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(appointment.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {appointment.doctorName || 'Doctor Name Unavailable'}
                        </h3>
                        <p className="text-sm text-blue-600 font-medium">
                          {appointment.doctorSpecialization || 'Specialization not specified'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                      {appointment.status || 'UNKNOWN'}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock size={16} />
                      <div>
                        {appointment.appointmentStartTime ? (
                          <>
                            <p className="font-medium">{formatDateTime(appointment.appointmentStartTime)}</p>
                            <p className="text-sm">to {formatDateTime(appointment.appointmentEndTime)}</p>
                          </>
                        ) : (
                          <p className="text-sm italic">Time slot not yet assigned</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar size={16} />
                      <span>Requested: {formatDateTime(appointment.createdAt)}</span>
                    </div>
                  </div>

                  {/* Doctor Contact Info */}
                  {appointment.status === 'APPROVED' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {appointment.doctorContact && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone size={16} />
                          <span>{appointment.doctorContact}</span>
                        </div>
                      )}
                      {appointment.consultationFees && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <span>₹</span>
                          <span>Fee: ₹{appointment.consultationFees}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Patient Notes */}
                  {appointment.patientNotes && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FileText size={16} className="mr-1" />
                        Your Notes
                      </h4>
                      <div className="bg-gray-50 rounded-md p-3">
                        <p className="text-sm text-gray-700">{appointment.patientNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Status Message */}
                  <div className={`p-4 rounded-md border ${getStatusColor(appointment.status)}`}>
                    <p className="text-sm font-medium">{getStatusMessage(appointment)}</p>
                    
                    {appointment.status === 'APPROVED' && (
                      <div className="mt-2 text-sm">
                        {appointment.doctorContact && (
                          <p>📞 Contact the doctor at: {appointment.doctorContact}</p>
                        )}
                        <p>💡 Please arrive 10 minutes early for your appointment</p>
                        <p>🆔 Bring a valid ID and any relevant medical records</p>
                      </div>
                    )}
                    
                    {appointment.status === 'PENDING' && (
                      <div className="mt-2 text-sm">
                        <p>⏳ The doctor will review your request shortly</p>
                        <p>📱 You'll receive a notification once approved</p>
                      </div>
                    )}

                    {appointment.status === 'REJECTED' && appointment.rejectionReason && (
                      <div className="mt-2 text-sm">
                        <p className="font-medium">Reason:</p>
                        <p>{appointment.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Last updated: {formatDateTime(appointment.updatedAt)}
                    </span>
                    
                    {appointment.status === 'APPROVED' && (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Confirmed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
