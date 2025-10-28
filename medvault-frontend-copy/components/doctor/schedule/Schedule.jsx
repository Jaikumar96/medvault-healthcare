import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from "../../../hooks/useAuth";;// Assuming you have an auth hook for user data

const ScheduleManager = () => {
  const { user } = useAuth(); // Get user from a central auth context
  const [timeSlots, setTimeSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (user) {
      fetchTimeSlots();
      fetchAppointments();
    }
  }, [user]);

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/doctor/slots/${user.id}`);
      if (response.ok) {
        const slots = await response.json();
        setTimeSlots(slots);
      } else if (response.status === 404) {
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/doctor/appointments/${user.id}`);
      if (response.ok) {
        const appointments = await response.json();
        setAppointments(appointments);
      } else if (response.status === 404) {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`http://localhost:8080/api/doctor/slots/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSlot)
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setNewSlot({ startTime: '', endTime: '' });
        setShowAddSlot(false);
        fetchTimeSlots();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error creating time slot' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAppointmentAction = async (appointmentId, action, reason = '') => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const body = action === 'reject' ? { reason } : {};

      const response = await fetch(`http://localhost:8080/api/doctor/appointments/${appointmentId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        fetchAppointments();
        fetchTimeSlots(); // Refresh slots to update availability
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error processing appointment' });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'REJECTED':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600">Manage your time slots and appointments</p>
          </div>
          <button
            onClick={() => setShowAddSlot(!showAddSlot)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Time Slot
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-md mb-4 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
        
        {showAddSlot && (
          <form onSubmit={handleCreateSlot} className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Time Slot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddSlot(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Slot'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Slots Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock size={20} className="inline mr-2 text-blue-600" />
            Your Time Slots
          </h2>
          {timeSlots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No time slots created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {timeSlots.map((slot) => (
                <div key={slot.id} className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${
                  slot.isAvailable ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div>
                    <p className="font-medium text-sm md:text-base">{formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    slot.isAvailable ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {slot.isAvailable ? 'Available' : 'Booked'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment Requests Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar size={20} className="inline mr-2 text-blue-600" />
            Appointment Requests
          </h2>
          
          <div className="flex space-x-2 mb-4">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <button 
                key={status} 
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No {filter !== 'ALL' && filter.toLowerCase()} appointments found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(appointment.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Patient ID: {appointment.patientId}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 mb-3">
                    <p className="font-medium">
                      <Clock size={14} className="inline mr-1 text-gray-500" />
                      {formatDateTime(appointment.slotStartTime)} - {formatDateTime(appointment.slotEndTime)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Calendar size={14} className="inline mr-1 text-gray-500" />
                      Requested: {formatDateTime(appointment.createdAt)}
                    </p>
                  </div>

                  {appointment.patientNotes && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Patient Notes:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{appointment.patientNotes}</p>
                    </div>
                  )}

                  {appointment.rejectionReason && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Rejection Reason:</p>
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{appointment.rejectionReason}</p>
                    </div>
                  )}

                  {appointment.status === 'PENDING' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAppointmentAction(appointment.id, 'approve')}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center text-sm"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for rejection:');
                          if (reason) {
                            handleAppointmentAction(appointment.id, 'reject', reason);
                          }
                        }}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center text-sm"
                      >
                        <XCircle size={16} className="mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;