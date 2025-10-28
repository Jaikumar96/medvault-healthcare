import React, { useState, useEffect, useCallback } from 'react';
import RejectCommentBox from "../../common/RejectCommentBox";
import Swal from 'sweetalert2';
import {
    Calendar, Clock, Plus, Trash2, CheckCircle, XCircle, AlertCircle,
    Loader2, User, CalendarPlus, Settings, Copy, RefreshCw, MessageSquare,
    Coffee, Clock as UserClock, ChevronDown, ChevronUp, Phone, Mail,
    MapPin, Heart, Activity, Users, TrendingUp, Filter, Search, Bell,
    Star, Shield, Stethoscope, Calendar as CalendarIcon
} from 'lucide-react';
// REMOVED: import EmergencyRequests from './EmergencyRequests';

const Schedule = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [showAddSlot, setShowAddSlot] = useState(false);
    const [newSlot, setNewSlot] = useState({
        startDate: '',
        endDate: '',
        workingHours: {
            morningStart: '09:00',
            morningEnd: '13:00',
            eveningStart: '14:00',
            eveningEnd: '18:00'
        },
        slotDuration: '30',
        lunchBreakDuration: '60',
        isRecurring: false,
        recurringType: 'daily',
        recurringEndDate: '',
        recurringDays: [],
        excludeDates: []
    });

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [rejectingAppointment, setRejectingAppointment] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    
    // Individual appointment processing states
    const [processingAppointments, setProcessingAppointments] = useState(new Set());

    // Profile status check
    const [doctorStatus, setDoctorStatus] = useState(null);
    const [profileComplete, setProfileComplete] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    // Bulk slot creation mode
    const [bulkMode, setBulkMode] = useState(true);

    // UI state for slots display
    const [expandedDates, setExpandedDates] = useState(new Set());
    const [slotsViewMode, setSlotsViewMode] = useState('grouped');
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Profile approval check
    const isProfileApproved = doctorStatus === 'APPROVED' && profileComplete;

    // Check profile status first
    useEffect(() => {
        checkProfileStatus();
    }, []);

    const checkProfileStatus = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/doctor/profile/${user.id}`);

            if (response.ok) {
                const doctor = await response.json();
                setDoctorStatus(doctor.status);
                setProfileComplete(doctor.profileComplete && doctor.documentsUploaded);
            } else {
                setProfileComplete(false);
                setDoctorStatus('INACTIVE');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfileComplete(false);
            setDoctorStatus('INACTIVE');
        } finally {
            setProfileLoading(false);
        }
    };

    // Helper function to check if slot is expired
    const isSlotExpired = (slot) => {
        const slotStartTime = new Date(slot.startTime);
        const now = new Date();
        return slotStartTime < now && slot.isAvailable;
    };

    // Fetch all data function
    const fetchAllData = useCallback(async () => {
        if (!isProfileApproved) return;

        setInitialLoading(true);
        clearMessages();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user?.id) throw new Error("User not found.");

            const [slotsResponse, appointmentsResponse] = await Promise.all([
                fetch(`http://localhost:8080/api/doctor/slots/${user.id}`),
                fetch(`http://localhost:8080/api/doctor/appointments/${user.id}`)
            ]);

            if (slotsResponse.ok) {
                const slots = await slotsResponse.json();
                const validSlots = (slots || []).filter(slot => !isSlotExpired(slot));
                const sortedSlots = validSlots.sort((a, b) => {
                    return new Date(a.startTime) - new Date(b.startTime);
                });
                setTimeSlots(sortedSlots);
            } else if (slotsResponse.status !== 404) {
                throw new Error(`Failed to fetch time slots: ${slotsResponse.statusText}`);
            } else {
                setTimeSlots([]);
            }

            if (appointmentsResponse.ok) {
                const appointmentsData = await appointmentsResponse.json();
                const sortedAppointments = Array.isArray(appointmentsData) 
                    ? appointmentsData.sort((a, b) => {
                        if (!a.appointmentStartTime && !b.appointmentStartTime) return 0;
                        if (!a.appointmentStartTime) return 1;
                        if (!b.appointmentStartTime) return -1;
                        return new Date(a.appointmentStartTime) - new Date(b.appointmentStartTime);
                    })
                    : [];
                setAppointments(sortedAppointments);
            } else if (appointmentsResponse.status !== 404) {
                throw new Error(`Failed to fetch appointments: ${appointmentsResponse.statusText}`);
            } else {
                setAppointments([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setErrorMessage(error.message || 'Failed to load schedule data. Please try again later.');
        } finally {
            setInitialLoading(false);
        }
    }, [isProfileApproved]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Working hours presets based on real medical practice schedules
    const workingHoursPresets = [
        {
            name: 'Standard Hours',
            morning: { start: '09:00', end: '13:00' },
            evening: { start: '14:00', end: '18:00' }
        },
        {
            name: 'Extended Hours',
            morning: { start: '08:00', end: '13:00' },
            evening: { start: '14:30', end: '20:00' }
        },
        {
            name: 'Morning Only',
            morning: { start: '09:00', end: '13:00' },
            evening: { start: '', end: '' }
        },
        {
            name: 'Evening Only',
            morning: { start: '', end: '' },
            evening: { start: '15:00', end: '20:00' }
        },
        {
            name: 'Hospital Hours',
            morning: { start: '07:00', end: '12:00' },
            evening: { start: '13:00', end: '19:00' }
        }
    ];

    // Duration options based on medical consultation types
    const durationOptions = [
        { value: '15', label: '15 min - Quick Consultation' },
        { value: '20', label: '20 min - Follow-up' },
        { value: '30', label: '30 min - Standard Consultation' },
        { value: '45', label: '45 min - Detailed Consultation' },
        { value: '60', label: '60 min - Comprehensive Checkup' }
    ];

    const clearMessages = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    const resetSlotForm = () => {
        setNewSlot({
            startDate: '',
            endDate: '',
            workingHours: {
                morningStart: '09:00',
                morningEnd: '13:00',
                eveningStart: '14:00',
                eveningEnd: '18:00'
            },
            slotDuration: '30',
            lunchBreakDuration: '60',
            isRecurring: false,
            recurringType: 'daily',
            recurringEndDate: '',
            recurringDays: [],
            excludeDates: []
        });
    };

    // Group slots by date with proper chronological sorting
    const groupSlotsByDate = (slots) => {
        const grouped = {};
        slots.forEach(slot => {
            const date = new Date(slot.startTime).toDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(slot);
        });

        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        });

        const sortedEntries = Object.entries(grouped).sort((a, b) => {
            const dateA = new Date(a[0]);
            const dateB = new Date(b[0]);
            return dateA - dateB;
        });

        const sortedGrouped = {};
        sortedEntries.forEach(([date, slots]) => {
            sortedGrouped[date] = slots;
        });

        return sortedGrouped;
    };

    // Toggle date expansion
    const toggleDateExpansion = (date) => {
        const newExpanded = new Set(expandedDates);
        if (newExpanded.has(date)) {
            newExpanded.delete(date);
        } else {
            newExpanded.add(date);
        }
        setExpandedDates(newExpanded);
    };

    // Generate time slots based on working hours
    const generateTimeSlots = (date, workingHours, slotDuration, lunchBreakDuration) => {
        const slots = [];
        const duration = parseInt(slotDuration);

        // Morning slots
        if (workingHours.morningStart && workingHours.morningEnd) {
            const morningStart = new Date(`${date}T${workingHours.morningStart}`);
            const morningEnd = new Date(`${date}T${workingHours.morningEnd}`);

            let currentTime = new Date(morningStart);
            while (currentTime < morningEnd) {
                const endTime = new Date(currentTime.getTime() + duration * 60000);
                if (endTime <= morningEnd) {
                    slots.push({
                        startTime: currentTime.toISOString(),
                        endTime: endTime.toISOString()
                    });
                }
                currentTime.setTime(currentTime.getTime() + duration * 60000);
            }
        }

        // Evening slots (after lunch break)
        if (workingHours.eveningStart && workingHours.eveningEnd) {
            const eveningStart = new Date(`${date}T${workingHours.eveningStart}`);
            const eveningEnd = new Date(`${date}T${workingHours.eveningEnd}`);

            let currentTime = new Date(eveningStart);
            while (currentTime < eveningEnd) {
                const endTime = new Date(currentTime.getTime() + duration * 60000);
                if (endTime <= eveningEnd) {
                    slots.push({
                        startTime: currentTime.toISOString(),
                        endTime: endTime.toISOString()
                    });
                }
                currentTime.setTime(currentTime.getTime() + duration * 60000);
            }
        }

        return slots;
    };

    // Calculate total slots that will be created
    const calculateTotalSlots = () => {
        if (!newSlot.startDate || (!newSlot.endDate && bulkMode)) return 0;

        const startDate = new Date(newSlot.startDate);
        const endDate = bulkMode ? new Date(newSlot.endDate) : new Date(newSlot.startDate);
        let totalSlots = 0;

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const daySlots = generateTimeSlots(
                date.toISOString().split('T')[0],
                newSlot.workingHours,
                newSlot.slotDuration,
                newSlot.lunchBreakDuration
            );
            totalSlots += daySlots.length;
        }

        return totalSlots;
    };

    // Validate time slot configuration
    const validateTimeSlot = () => {
        if (!newSlot.startDate || (bulkMode && !newSlot.endDate)) {
            setErrorMessage('Please fill in all required date fields.');
            return false;
        }

        if (!newSlot.workingHours.morningStart && !newSlot.workingHours.eveningStart) {
            setErrorMessage('Please set at least one working session (morning or evening).');
            return false;
        }

        const startDate = new Date(newSlot.startDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (startDate < now) {
            setErrorMessage('Start date cannot be in the past.');
            return false;
        }

        if (bulkMode) {
            const endDate = new Date(newSlot.endDate);
            if (endDate < startDate) {
                setErrorMessage('End date must be after start date.');
                return false;
            }
        }

        return true;
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        if (!validateTimeSlot()) {
            setLoading(false);
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const startDate = new Date(newSlot.startDate);
            const endDate = bulkMode ? new Date(newSlot.endDate) : new Date(newSlot.startDate);

            let allSlotsToCreate = [];

            // Generate slots for each day
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                const dateString = date.toISOString().split('T')[0];
                const daySlots = generateTimeSlots(
                    dateString,
                    newSlot.workingHours,
                    newSlot.slotDuration,
                    newSlot.lunchBreakDuration
                );
                allSlotsToCreate.push(...daySlots);
            }

            // Batch create slots
            const batchSize = 20;
            let successCount = 0;
            let failureCount = 0;

            for (let i = 0; i < allSlotsToCreate.length; i += batchSize) {
                const batch = allSlotsToCreate.slice(i, i + batchSize);
                const promises = batch.map(slot =>
                    fetch(`http://localhost:8080/api/doctor/slots/${user.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(slot)
                    })
                );

                try {
                    const results = await Promise.all(promises);
                    const batchSuccesses = results.filter(result => result.ok).length;
                    successCount += batchSuccesses;
                    failureCount += (batch.length - batchSuccesses);
                } catch (error) {
                    failureCount += batch.length;
                }
            }

            if (successCount > 0) {
                setSuccessMessage(
                    failureCount === 0
                        ? `Successfully created ${successCount} time slots!`
                        : `Created ${successCount} slots successfully. ${failureCount} failed to create.`
                );
                resetSlotForm();
                setShowAddSlot(false);
                fetchAllData();
            } else {
                setErrorMessage('Failed to create any time slots. Please try again.');
            }
        } catch (error) {
            setErrorMessage('An unexpected error occurred while creating time slots.');
            console.error('Error creating slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        const result = await Swal.fire({
            title: 'Delete Time Slot',
            text: "Are you sure you want to delete this time slot? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            focusCancel: true
        });

        if (result.isConfirmed) {
            setLoading(true);
            clearMessages();

            try {
                const response = await fetch(`http://localhost:8080/api/doctor/slots/${slotId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    await Swal.fire({
                        title: 'Deleted!',
                        text: 'Time slot has been deleted successfully.',
                        icon: 'success',
                        confirmButtonColor: '#10b981',
                        timer: 2000,
                        timerProgressBar: true
                    });

                    setSuccessMessage('Time slot deleted successfully.');
                    fetchAllData();
                } else {
                    const result = await response.json();

                    await Swal.fire({
                        title: 'Error!',
                        text: result.error || 'Failed to delete time slot.',
                        icon: 'error',
                        confirmButtonColor: '#ef4444'
                    });

                    setErrorMessage(result.error || 'Failed to delete time slot.');
                }
            } catch (error) {
                await Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while deleting the slot.',
                    icon: 'error',
                    confirmButtonColor: '#ef4444'
                });

                setErrorMessage('An error occurred while deleting the slot.');
            } finally {
                setLoading(false);
            }
        }
    };

    // Individual appointment action handling
    const handleAppointmentAction = async (appointmentId, action) => {
        // Add appointment to processing set
        setProcessingAppointments(prev => new Set([...prev, appointmentId]));
        clearMessages();

        try {
            const endpoint = action === 'approve' ? 'approve' : 'reject';
            const body = action === 'reject' ? { reason: rejectionReason } : {};

            const response = await fetch(`http://localhost:8080/api/doctor/appointments/${appointmentId}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await response.json();
            if (response.ok) {
                setSuccessMessage(result.message || `Appointment ${action}d successfully.`);
                setRejectingAppointment(null);
                setRejectionReason('');
                fetchAllData();
            } else {
                setErrorMessage(result.error || 'Failed to process appointment.');
            }
        } catch (error) {
            setErrorMessage('An unexpected error occurred.');
        } finally {
            // Remove appointment from processing set
            setProcessingAppointments(prev => {
                const newSet = new Set(prev);
                newSet.delete(appointmentId);
                return newSet;
            });
        }
    };

    const handlePresetSelect = (preset) => {
        setNewSlot(prev => ({
            ...prev,
            workingHours: {
                morningStart: preset.morning.start,
                morningEnd: preset.morning.end,
                eveningStart: preset.evening.start,
                eveningEnd: preset.evening.end
            }
        }));
    };

    const formatDateTime = (dateTime) => new Date(dateTime).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    const formatTimeOnly = (dateTime) => new Date(dateTime).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const formatDateOnly = (dateTime) => new Date(dateTime).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const getStatusChip = (status) => {
        const styles = {
            PENDING: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm',
            APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
            REJECTED: 'bg-red-50 text-red-700 border-red-200 shadow-sm'
        };
        const icons = {
            PENDING: <AlertCircle size={16} className="mr-2" />,
            APPROVED: <CheckCircle size={16} className="mr-2" />,
            REJECTED: <XCircle size={16} className="mr-2" />
        };
        return (
            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                {icons[status]} {status}
            </div>
        );
    };

    const getPatientName = (appointment) => {
        if (appointment.patient && appointment.patient.firstName) {
            return `${appointment.patient.firstName} ${appointment.patient.lastName || ''}`;
        }
        return `Patient ID: ${appointment.patientId}`;
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Filter appointments based on search and status
    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = searchTerm === '' || 
            getPatientName(appointment).toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.patientNotes?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'ALL' || appointment.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    // Show loading while checking profile status
    if (profileLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Checking profile status...</p>
                </div>
            </div>
        );
    }

    // Show profile verification required message
    if (!isProfileApproved) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} className="text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Verification Required</h2>
                    <p className="text-gray-600 mb-6">
                        Complete your profile verification to access the Schedule Manager and start managing appointments.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.href = '#profile'}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold transition-colors"
                        >
                            Complete Profile
                        </button>
                        <div className="text-sm text-gray-500 space-y-1">
                            <p>Status: <span className="font-medium">{doctorStatus || 'Incomplete'}</span></p>
                            <p>Profile: <span className="font-medium">{profileComplete ? 'Complete' : 'Incomplete'}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your schedule...</p>
                </div>
            </div>
        );
    }

    const pendingAppointments = appointments.filter(a => a.status === 'PENDING');
    const groupedSlots = groupSlotsByDate(timeSlots);

    // Modern appointment card with individual processing states
    const AppointmentCard = ({ app }) => {
        const isProcessing = processingAppointments.has(app.id);
        
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                {/* Patient Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                            <User size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{getPatientName(app)}</h3>
                            {app.appointmentStartTime ? (
                                <div className="flex items-center text-gray-600 mt-1">
                                    <CalendarIcon size={16} className="mr-2" />
                                    <span className="text-sm">{formatDateTime(app.appointmentStartTime)}</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-500 mt-1">
                                    <AlertCircle size={16} className="mr-2" />
                                    <span className="text-sm">Time slot data missing</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {getStatusChip(app.status)}
                </div>

                {/* Patient Contact Info */}
                {app.patient && (
                    <div className="flex items-center space-x-6 mb-4 p-3 bg-gray-50 rounded-xl">
                        {app.patient.phone && (
                            <div className="flex items-center text-gray-600">
                                <Phone size={16} className="mr-2" />
                                <span className="text-sm">{app.patient.phone}</span>
                            </div>
                        )}
                        {app.patient.email && (
                            <div className="flex items-center text-gray-600">
                                <Mail size={16} className="mr-2" />
                                <span className="text-sm">{app.patient.email}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Patient Notes */}
                {app.patientNotes && (
                    <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                        <div className="flex items-start space-x-3">
                            <MessageSquare size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-blue-900 text-sm mb-2">Patient Notes:</p>
                                <p className="text-sm text-blue-800 leading-relaxed">{app.patientNotes}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejection Reason */}
                {app.rejectionReason && (
                    <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
                        <div className="flex items-start space-x-3">
                            <XCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-red-900 text-sm mb-2">Rejection Reason:</p>
                                <p className="text-sm text-red-800 leading-relaxed">{app.rejectionReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {app.status === 'PENDING' && (
                    rejectingAppointment === app.id ? (
                        <RejectCommentBox
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            onCancel={() => {
                                setRejectingAppointment(null);
                                setRejectionReason('');
                            }}
                            onConfirm={() => handleAppointmentAction(app.id, 'reject')}
                            isSubmitting={isProcessing}
                            placeholder="Please provide a detailed reason for rejecting this appointment..."
                        />
                    ) : (
                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleAppointmentAction(app.id, 'approve')}
                                disabled={isProcessing || !app.appointmentStartTime}
                                className="flex-1 bg-emerald-600 text-white py-3 px-4 text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={18} className="mr-2 animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} className="mr-2" />
                                        Approve
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setRejectingAppointment(app.id)}
                                disabled={isProcessing}
                                className="flex-1 bg-red-600 text-white py-3 px-4 text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <XCircle size={18} className="mr-2" />
                                Reject
                            </button>
                        </div>
                    )
                )}
            </div>
        );
    };

    // Slots rendering component with improved organization
    const SlotsDisplay = () => {
        if (timeSlots.length === 0) {
            return (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Clock size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No time slots available</h3>
                    <p className="text-gray-500 mb-6">Create your first time slots to start accepting appointments</p>
                    <button
                        onClick={() => setShowAddSlot(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold transition-colors"
                    >
                        Create Time Slots
                    </button>
                </div>
            );
        }

        if (slotsViewMode === 'list') {
            return (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                    {timeSlots.map((slot) => (
                        <div key={slot.id} className={`rounded-xl p-4 border-2 transition-all duration-200 ${
                            slot.isAvailable
                                ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {formatDateTime(slot.startTime)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        to {formatTimeOnly(slot.endTime)}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                        slot.isAvailable
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {slot.isAvailable ? 'Available' : 'Booked'}
                                    </span>
                                    {slot.isAvailable && (
                                        <button
                                            onClick={() => handleDeleteSlot(slot.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                            title="Delete Slot"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Grouped view by date
        return (
            <div className="max-h-[70vh] overflow-y-auto space-y-4">
                {Object.entries(groupedSlots).map(([dateString, slots]) => {
                    const isExpanded = expandedDates.has(dateString);
                    const availableCount = slots.filter(slot => slot.isAvailable).length;
                    const totalCount = slots.length;

                    return (
                        <div key={dateString} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            {/* Date Header */}
                            <button
                                onClick={() => toggleDateExpansion(dateString)}
                                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Calendar size={18} className="text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">
                                            {formatDateOnly(slots[0].startTime)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {availableCount} available of {totalCount} slots
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                                        {totalCount} slots
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUp size={18} className="text-gray-400" />
                                    ) : (
                                        <ChevronDown size={18} className="text-gray-400" />
                                    )}
                                </div>
                            </button>

                            {/* Slots for this date */}
                            {isExpanded && (
                                <div className="p-4 space-y-3 bg-white max-h-72 overflow-y-auto">
                                    {slots.map((slot) => (
                                        <div key={slot.id} className={`rounded-xl p-4 border-2 transition-all duration-200 ${
                                            slot.isAvailable
                                                ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                                : 'bg-red-50 border-red-200'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {formatTimeOnly(slot.startTime)} - {formatTimeOnly(slot.endTime)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {newSlot.slotDuration} minutes session
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                                        slot.isAvailable
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {slot.isAvailable ? 'Available' : 'Booked'}
                                                    </span>
                                                    {slot.isAvailable && (
                                                        <button
                                                            onClick={() => handleDeleteSlot(slot.id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                                            title="Delete Slot"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Enhanced Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div className="mb-6 lg:mb-0">
                        <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                <Stethoscope size={24} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900">Schedule Manager</h1>
                        </div>
                        <p className="text-gray-600 text-lg">Manage time slots and appointment requests efficiently</p>
                        
                        {/* Quick Stats */}
                        <div className="flex items-center space-x-6 mt-4">
                            <div className="flex items-center text-emerald-600">
                                <Activity size={18} className="mr-2" />
                                <span className="font-semibold">{timeSlots.filter(s => s.isAvailable).length} Available Slots</span>
                            </div>
                            <div className="flex items-center text-amber-600">
                                <Bell size={18} className="mr-2" />
                                <span className="font-semibold">{pendingAppointments.length} Pending Requests</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {/* REMOVED: <EmergencyRequests /> */}
                        <button
                            onClick={() => setShowAddSlot(!showAddSlot)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center shadow-lg transition-all duration-200 hover:shadow-xl font-semibold"
                        >
                            <Plus size={20} className="mr-2" />
                            {showAddSlot ? 'Close Form' : 'Create Time Slots'}
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {errorMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start shadow-sm">
                        <XCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                        <p className="font-medium">{errorMessage}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start shadow-sm">
                        <CheckCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                        <p className="font-medium">{successMessage}</p>
                    </div>
                )}

                {/* Enhanced Bulk Time Slot Creation Form */}
                {showAddSlot && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
                        <div className="flex items-center mb-8">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                <Clock size={20} className="text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Bulk Time Slot Creation</h3>
                        </div>

                        <form onSubmit={handleCreateSlot} className="space-y-8">
                            {/* Mode Toggle */}
                            <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-xl">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!bulkMode}
                                        onChange={() => setBulkMode(false)}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <span className="font-semibold text-gray-700">Single Day</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={bulkMode}
                                        onChange={() => setBulkMode(true)}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <span className="font-semibold text-gray-700">Multiple Days</span>
                                </label>
                            </div>

                            {/* Date Selection */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        {bulkMode ? 'Start Date' : 'Date'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={newSlot.startDate}
                                        min={getTodayDate()}
                                        onChange={(e) => setNewSlot({ ...newSlot, startDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                </div>
                                {bulkMode && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={newSlot.endDate}
                                            min={newSlot.startDate || getTodayDate()}
                                            onChange={(e) => setNewSlot({ ...newSlot, endDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            required={bulkMode}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Working Hours Presets */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-4">
                                    <Settings size={18} className="inline mr-2" />
                                    Quick Working Hours Setup
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {workingHoursPresets.map((preset, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handlePresetSelect(preset)}
                                            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-colors border-2 border-transparent hover:border-blue-200 font-medium"
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Working Hours Configuration */}
                            <div className="border border-gray-200 rounded-xl p-6">
                                <h4 className="font-bold text-gray-900 mb-6 flex items-center text-lg">
                                    <Clock size={20} className="mr-3" />
                                    Working Hours Configuration
                                </h4>

                                {/* Morning Session */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Morning Session (Optional)
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="time"
                                            value={newSlot.workingHours.morningStart}
                                            onChange={(e) => setNewSlot({
                                                ...newSlot,
                                                workingHours: { ...newSlot.workingHours, morningStart: e.target.value }
                                            })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="Start Time"
                                        />
                                        <input
                                            type="time"
                                            value={newSlot.workingHours.morningEnd}
                                            onChange={(e) => setNewSlot({
                                                ...newSlot,
                                                workingHours: { ...newSlot.workingHours, morningEnd: e.target.value }
                                            })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="End Time"
                                        />
                                    </div>
                                </div>

                                {/* Lunch Break Info */}
                                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <div className="flex items-center text-amber-800">
                                        <Coffee size={18} className="mr-3" />
                                        <span className="font-semibold">
                                            Lunch break automatically calculated between morning and evening sessions
                                        </span>
                                    </div>
                                </div>

                                {/* Evening Session */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Evening Session (Optional)
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="time"
                                            value={newSlot.workingHours.eveningStart}
                                            onChange={(e) => setNewSlot({
                                                ...newSlot,
                                                workingHours: { ...newSlot.workingHours, eveningStart: e.target.value }
                                            })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="Start Time"
                                        />
                                        <input
                                            type="time"
                                            value={newSlot.workingHours.eveningEnd}
                                            onChange={(e) => setNewSlot({
                                                ...newSlot,
                                                workingHours: { ...newSlot.workingHours, eveningEnd: e.target.value }
                                            })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                            placeholder="End Time"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Slot Duration */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Appointment Duration <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newSlot.slotDuration}
                                    onChange={(e) => setNewSlot({ ...newSlot, slotDuration: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    required
                                >
                                    {durationOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Slots Preview */}
                            {(newSlot.startDate && (!bulkMode || newSlot.endDate)) && (
                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                    <div className="flex items-center mb-3">
                                        <CalendarPlus size={20} className="mr-3 text-blue-600" />
                                        <span className="font-bold text-blue-900">Slots Preview</span>
                                    </div>
                                    <p className="text-blue-800">
                                        <span className="font-semibold">Total slots to create:</span> {calculateTotalSlots()} slots
                                        {bulkMode && (
                                            <>
                                                <br />
                                                <span className="font-semibold">Date range:</span> {' '}
                                                {new Date(newSlot.startDate).toLocaleDateString('en-IN')} to{' '}
                                                {new Date(newSlot.endDate).toLocaleDateString('en-IN')}
                                            </>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddSlot(false);
                                        resetSlotForm();
                                    }}
                                    className="px-8 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || calculateTotalSlots() === 0}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="mr-2 animate-spin" />
                                            Creating {calculateTotalSlots()} slots...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} className="mr-2" />
                                            Create {calculateTotalSlots()} Slots
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Main Dashboard Grid */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Time Slots Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                                        <Clock size={20} className="text-emerald-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Available Time Slots</h2>
                                </div>
                                {timeSlots.length > 0 && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setSlotsViewMode('grouped')}
                                            className={`px-3 py-2 text-xs rounded-lg transition-colors font-semibold ${
                                                slotsViewMode === 'grouped'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Grouped
                                        </button>
                                        <button
                                            onClick={() => setSlotsViewMode('list')}
                                            className={`px-3 py-2 text-xs rounded-lg transition-colors font-semibold ${
                                                slotsViewMode === 'list'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            List
                                        </button>
                                    </div>
                                )}
                            </div>
                            <SlotsDisplay />
                        </div>
                    </div>

                    {/* Appointment Requests Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                                <div className="flex items-center mb-4 sm:mb-0">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-3">
                                        <AlertCircle size={20} className="text-amber-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Appointment Requests
                                        {pendingAppointments.length > 0 && (
                                            <span className="ml-3 bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full">
                                                {pendingAppointments.length}
                                            </span>
                                        )}
                                    </h2>
                                </div>
                                
                                {/* Search and Filter */}
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search patients..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                                        />
                                    </div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                                    >
                                        <option value="ALL">All Status</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            
                            {filteredAppointments.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Users size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {searchTerm || filterStatus !== 'ALL' ? 'No matching appointments' : 'All caught up!'}
                                    </h3>
                                    <p className="text-gray-500 text-lg">
                                        {searchTerm || filterStatus !== 'ALL' 
                                            ? 'Try adjusting your search or filter criteria'
                                            : 'No new appointment requests at the moment.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                                    {filteredAppointments.map(app => (
                                        <AppointmentCard key={app.id} app={app} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
