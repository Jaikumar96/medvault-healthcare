import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { 
    Calendar, 
    Loader2, 
    User, 
    AlertCircle, 
    Search, 
    Filter, 
    Clock, 
    CheckCircle, 
    XCircle, 
    FileText, 
    RefreshCw, 
    ChevronLeft, 
    ChevronRight,
    MapPin,
    Phone,
    Mail,
    Heart,
    Activity,
    Stethoscope,
    CalendarDays,
    Timer,
    UserCheck
} from 'lucide-react';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [checkingCompletion, setCheckingCompletion] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

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

    // Trigger completion check function with SweetAlert2
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
                    // Success alert
                    await Swal.fire({
                        icon: 'success',
                        title: 'Status Updated Successfully!',
                        html: `<strong>${result.completedAppointments}</strong> appointments have been marked as completed`,
                        confirmButtonText: 'Great!',
                        confirmButtonColor: '#10b981',
                        timer: 3000,
                        timerProgressBar: true
                    });
                    await fetchAppointments();
                } else {
                    // Info alert
                    await Swal.fire({
                        icon: 'info',
                        title: 'All Up to Date!',
                        text: 'All appointments are already current with their proper status',
                        confirmButtonText: 'Perfect!',
                        confirmButtonColor: '#3b82f6'
                    });
                }
            } else {
                throw new Error('Failed to check completion status');
            }
        } catch (error) {
            console.error('Error triggering completion check:', error);
            // Error alert
            await Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to check appointment completion status. Please try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setCheckingCompletion(false);
        }
    };

    // Filter appointments based on search term, status, and date
    useEffect(() => {
        let filtered = [...appointments];

        if (searchTerm) {
            filtered = filtered.filter(app => {
                const patientName = getPatientName(app).toLowerCase();
                const patientNotes = (app.patientNotes || '').toLowerCase();
                return patientName.includes(searchTerm.toLowerCase()) || 
                       patientNotes.includes(searchTerm.toLowerCase());
            });
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

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
        setCurrentPage(1);
    }, [appointments, searchTerm, statusFilter, dateFilter]);

    // Pagination calculations
    const totalItems = filteredAppointments.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

    // Statistics calculations
    const stats = {
        total: appointments.length,
        pending: appointments.filter(app => app.status === 'PENDING').length,
        approved: appointments.filter(app => app.status === 'APPROVED').length,
        completed: appointments.filter(app => app.status === 'COMPLETED').length,
        rejected: appointments.filter(app => app.status === 'REJECTED').length
    };

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: { 
                bg: 'bg-amber-50', 
                text: 'text-amber-700', 
                border: 'border-amber-200', 
                icon: Timer,
                color: 'amber'
            },
            APPROVED: { 
                bg: 'bg-emerald-50', 
                text: 'text-emerald-700', 
                border: 'border-emerald-200', 
                icon: CheckCircle,
                color: 'emerald'
            },
            REJECTED: { 
                bg: 'bg-red-50', 
                text: 'text-red-700', 
                border: 'border-red-200', 
                icon: XCircle,
                color: 'red'
            },
            COMPLETED: { 
                bg: 'bg-blue-50', 
                text: 'text-blue-700', 
                border: 'border-blue-200', 
                icon: UserCheck,
                color: 'blue'
            },
        };
        
        return configs[status] || { 
            bg: 'bg-gray-50', 
            text: 'text-gray-700', 
            border: 'border-gray-200', 
            icon: AlertCircle,
            color: 'gray'
        };
    };

    const getStatusChip = (status) => {
        const config = getStatusConfig(status);
        const Icon = config.icon;
        
        return (
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
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
        if (!appointment.timeSlot) return null;
        return formatDateTime(appointment.timeSlot.startTime);
    };

    const parsePatientNotes = (patientNotes) => {
        if (!patientNotes) return null;
        
        const sections = patientNotes.split(' | ');
        const parsedSections = [];
        
        sections.forEach(section => {
            if (section.includes(':')) {
                const [label, value] = section.split(':', 2);
                parsedSections.push({
                    label: label.trim(),
                    value: value.trim()
                });
            } else if (section.trim()) {
                parsedSections.push({
                    label: 'Note',
                    value: section.trim()
                });
            }
        });
        
        return parsedSections;
    };

    // Pagination component
    const Pagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} appointments
                </div>
                
                <div className="flex items-center space-x-2">
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={8}>8 per page</option>
                        <option value={16}>16 per page</option>
                        <option value={24}>24 per page</option>
                        <option value={32}>32 per page</option>
                    </select>
                    
                    <nav className="flex items-center space-x-1">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {pageNumbers.map((number) => (
                            <button
                                key={number}
                                onClick={() => setCurrentPage(number)}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    currentPage === number
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {number}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </nav>
                </div>
            </div>
        );
    };

    // Appointment Card Component
    const AppointmentCard = ({ appointment }) => {
        const appointmentDate = getAppointmentDate(appointment);
        const config = getStatusConfig(appointment.status);
        const StatusIcon = config.icon;

        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                                {getPatientName(appointment).charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                    {getPatientName(appointment)}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Requested {formatDateTime(appointment.createdAt)}
                                </p>
                            </div>
                        </div>
                        
                        <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
                            <StatusIcon size={14} className="mr-2" />
                            {appointment.status}
                        </div>
                    </div>

                    {appointmentDate && (
                        <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
                            <CalendarDays size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                                Scheduled for: {appointmentDate}
                            </span>
                        </div>
                    )}

                    {appointment.patientNotes && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            {parsePatientNotes(appointment.patientNotes) ? (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-blue-900 flex items-center">
                                        <Stethoscope size={14} className="mr-2" />
                                        Patient Information
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {parsePatientNotes(appointment.patientNotes).map((section, index) => (
                                            <div key={index} className="flex justify-between items-start">
                                                <span className="text-sm font-medium text-blue-800 min-w-fit">
                                                    {section.label}:
                                                </span>
                                                <span className="text-sm text-gray-700 text-right flex-1 ml-2">
                                                    {section.value || 'Not specified'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">Patient Notes:</h4>
                                    <p className="text-sm text-gray-700">{appointment.patientNotes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {appointment.rejectionReason && (
                        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                            <h4 className="text-sm font-medium text-red-900 mb-2">Rejection Reason:</h4>
                            <p className="text-sm text-red-700">{appointment.rejectionReason}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Loading state
    if (profileLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex justify-center items-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                    </div>
                    <p className="text-gray-600 font-medium">Checking profile status...</p>
                </div>
            </div>
        );
    }

    // Profile verification required
    if (!isProfileApproved) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex justify-center items-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} className="text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Verification Required</h2>
                    <p className="text-gray-600 mb-8">
                        Complete your profile verification to start managing appointments and connecting with patients.
                    </p>
                    <button
                        onClick={() => window.location.href = '#profile'}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold transition-colors"
                    >
                        Complete Profile
                    </button>
                    <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                        Status: <span className="font-medium">{doctorStatus || 'Incomplete'}</span> | 
                        Profile: <span className="font-medium">{profileComplete ? 'Complete' : 'Incomplete'}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex justify-center items-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                    </div>
                    <p className="text-gray-600 font-medium">Loading appointments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 flex items-center">
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header with Stats */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                                    <Activity size={24} className="text-blue-600" />
                                </div>
                                Appointments
                            </h1>
                            <p className="text-gray-600">Manage and track all your patient appointments</p>
                        </div>
                        
                        <div className="mt-6 lg:mt-0">
                            <button 
                                onClick={triggerCompletionCheck}
                                disabled={checkingCompletion}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
                            >
                                {checkingCompletion ? (
                                    <>
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={16} className="mr-2" />
                                        Update Status
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-500">Total</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                            <div className="text-sm text-gray-500">Pending</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
                            <div className="text-sm text-gray-500">Approved</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                            <div className="text-sm text-gray-500">Completed</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                            <div className="text-sm text-gray-500">Rejected</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by patient name or notes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>

                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Dates</option>
                            <option value="TODAY">Today</option>
                            <option value="THIS_WEEK">This Week</option>
                            <option value="THIS_MONTH">This Month</option>
                            <option value="UPCOMING">Upcoming</option>
                            <option value="PAST">Past</option>
                        </select>
                    </div>

                    {(searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL') && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {filteredAppointments.length} of {appointments.length} appointments
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('ALL');
                                    setDateFilter('ALL');
                                }}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Appointments */}
                {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {appointments.length === 0 ? 'No Appointments Yet' : 'No Matching Appointments'}
                        </h3>
                        <p className="text-gray-500 mb-8">
                            {appointments.length === 0 
                                ? 'Appointment requests from patients will appear here once you complete your profile verification.' 
                                : 'Try adjusting your search criteria or filters to find specific appointments.'
                            }
                        </p>
                        {appointments.length > 0 && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('ALL');
                                    setDateFilter('ALL');
                                }}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium"
                            >
                                Show all appointments
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            {currentItems.map((appointment) => (
                                <AppointmentCard key={appointment.id} appointment={appointment} />
                            ))}
                        </div>
                        
                        <Pagination />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
