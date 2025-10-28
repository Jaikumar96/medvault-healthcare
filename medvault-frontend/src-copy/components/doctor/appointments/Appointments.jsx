import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Loader2, User, AlertCircle, Search, Filter, Clock, CheckCircle, XCircle, FileText, RefreshCw } from 'lucide-react';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [checkingCompletion, setCheckingCompletion] = useState(false);

    // Profile status check
    const [doctorStatus, setDoctorStatus] = useState(null);
    const [profileComplete, setProfileComplete] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

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

    const isProfileApproved = doctorStatus === 'APPROVED' && profileComplete;

    const fetchAppointments = useCallback(async () => {
        if (!isProfileApproved) return;
        
        setLoading(true);
        setError('');
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user?.id) throw new Error("User not found.");

            const response = await fetch(`http://localhost:8080/api/doctor/appointments/${user.id}`);
            
            if (response.ok) {
                const data = await response.json();
                const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
                setAppointments(sortedData);
                setFilteredAppointments(sortedData);
            } else if (response.status === 404) {
                setAppointments([]);
                setFilteredAppointments([]);
            } else {
                throw new Error(`Failed to fetch appointments: ${response.statusText}`);
            }
        } catch (err) {
            setError(err.message || 'An error occurred while fetching appointments.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [isProfileApproved]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Trigger completion check function
    const triggerCompletionCheck = async () => {
        setCheckingCompletion(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/doctor/trigger-completion-check/${user.id}`, {
                method: 'POST'
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.completedAppointments > 0) {
                    alert(`✅ Success! ${result.completedAppointments} appointments marked as completed`);
                    // Refresh the appointments list
                    await fetchAppointments();
                } else {
                    alert('✨ All appointments are already up to date!');
                }
            } else {
                throw new Error('Failed to check completion status');
            }
        } catch (error) {
            console.error('Error triggering completion check:', error);
            alert('❌ Failed to check appointment completion status. Please try again.');
        } finally {
            setCheckingCompletion(false);
        }
    };

    // Filter appointments based on search term, status, and date
    useEffect(() => {
        let filtered = [...appointments];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(app => {
                const patientName = getPatientName(app).toLowerCase();
                const patientNotes = (app.patientNotes || '').toLowerCase();
                return patientName.includes(searchTerm.toLowerCase()) || 
                       patientNotes.includes(searchTerm.toLowerCase());
            });
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        // Date filter
        if (dateFilter !== 'ALL') {
            const now = new Date();
            filtered = filtered.filter(app => {
                if (!app.timeSlot) return dateFilter === 'NO_DATE';
                const appointmentDate = new Date(app.timeSlot.startTime);
                
                switch (dateFilter) {
                    case 'TODAY':
                        return appointmentDate.toDateString() === now.toDateString();
                    case 'THIS_WEEK':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return appointmentDate >= weekAgo;
                    case 'THIS_MONTH':
                        return appointmentDate.getMonth() === now.getMonth() && 
                               appointmentDate.getFullYear() === now.getFullYear();
                    case 'UPCOMING':
                        return appointmentDate > now && app.status === 'APPROVED';
                    case 'PAST':
                        return appointmentDate < now;
                    default:
                        return true;
                }
            });
        }

        setFilteredAppointments(filtered);
    }, [appointments, searchTerm, statusFilter, dateFilter]);

    const getStatusChip = (status) => {
        const config = {
            PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: AlertCircle },
            APPROVED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
            REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
            COMPLETED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle },
        };
        
        const { bg, text, border, icon: Icon } = config[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: AlertCircle };
        
        return (
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
                <Icon size={12} className="mr-1.5" />
                {status}
            </div>
        );
    };
    
    const formatDateTime = (dateTime) => new Date(dateTime).toLocaleString('en-IN', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
    });

    const getPatientName = (appointment) => {
        if (appointment.patient && appointment.patient.firstName) {
            return `${appointment.patient.firstName} ${appointment.patient.lastName || ''}`;
        }
        return `Patient ID: ${appointment.patientId}`;
    };

    const getAppointmentDate = (appointment) => {
        if (!appointment.timeSlot) return 'No date set';
        return formatDateTime(appointment.timeSlot.startTime);
    };

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
                <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
                    <AlertCircle size={64} className="mx-auto mb-4 text-yellow-500" />
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Verification Required</h2>
                    <p className="text-gray-600 mb-6">
                        You need to complete and verify your profile before accessing appointments.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.href = '#profile'}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            Complete Profile
                        </button>
                        <p className="text-sm text-gray-500">
                            Status: {doctorStatus || 'Incomplete'} | Profile: {profileComplete ? 'Complete' : 'Incomplete'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading appointments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 flex items-center">
                        <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Error Loading Appointments</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <FileText size={32} className="mr-3 text-blue-600" />
                            Appointments
                        </h1>
                        <p className="text-gray-600 mt-2">View and manage all your appointment history</p>
                    </div>
                    
                    {/* Completion Check Button */}
                    <div className="mt-4 sm:mt-0">
                        <button 
                            onClick={triggerCompletionCheck}
                            disabled={checkingCompletion}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                        >
                            {checkingCompletion ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={16} className="mr-2" />
                                    Update Completed
                                </>
                            )}
                        </button>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                            Auto-mark past appointments
                        </p>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by patient name or notes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>

                        {/* Date Filter */}
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Dates</option>
                            <option value="TODAY">Today</option>
                            <option value="THIS_WEEK">This Week</option>
                            <option value="THIS_MONTH">This Month</option>
                            <option value="UPCOMING">Upcoming</option>
                            <option value="PAST">Past</option>
                        </select>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                        <p>
                            Showing <span className="font-semibold">{filteredAppointments.length}</span> of <span className="font-semibold">{appointments.length}</span> appointments
                        </p>
                        {(searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('ALL');
                                    setDateFilter('ALL');
                                }}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>
                
                {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {appointments.length === 0 ? 'No Appointments Yet' : 'No Matching Appointments'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {appointments.length === 0 
                                ? 'Appointment requests from patients will appear here.' 
                                : 'Try adjusting your filters to see more results.'
                            }
                        </p>
                        {appointments.length > 0 && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('ALL');
                                    setDateFilter('ALL');
                                }}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Show all appointments
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {filteredAppointments.map((app) => (
                                <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                        {/* Patient Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User size={16} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {getPatientName(app)}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <Clock size={14} className="mr-1" />
                                                            {getAppointmentDate(app)}
                                                        </div>
                                                        <span>•</span>
                                                        <span>Requested {formatDateTime(app.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {app.patientNotes && (
                                                <div className="ml-13 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Patient Notes:</span> {app.patientNotes}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {app.rejectionReason && (
                                                <div className="ml-13 mt-2 bg-red-50 rounded-lg p-3 border border-red-100">
                                                    <p className="text-sm text-red-700">
                                                        <span className="font-medium">Rejection Reason:</span> {app.rejectionReason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="flex justify-end">
                                            {getStatusChip(app.status)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
