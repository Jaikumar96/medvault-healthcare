import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Clock, User, Phone, Mail, Stethoscope, University, Languages, 
  Briefcase, Loader2, CheckCircle, ArrowLeft, ChevronDown, ChevronUp, Shield 
} from 'lucide-react';

const ProgressSteps = ({ currentStep }) => {
    const steps = [
        { id: 'doctors', label: 'Choose Doctor', icon: User },
        { id: 'slots', label: 'Select Time', icon: Calendar },
        { id: 'confirm', label: 'Confirm', icon: CheckCircle }
    ];

    return (
        <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
                {steps.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                    const StepIcon = step.icon;
                    
                    return (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                                isActive ? 'bg-blue-100 text-blue-700' : 
                                isCompleted ? 'bg-green-100 text-green-700' : 
                                'bg-gray-100 text-gray-500'
                            }`}>
                                <StepIcon size={16} />
                                <span className="text-sm font-medium">{step.label}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-8 h-0.5 ${
                                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const DoctorCard = ({ doctor, onSelectDoctor, loading, isExpanded, onToggleExpanded }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-6">
                <div className="flex items-start space-x-4">
                    <div className="relative flex-shrink-0">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=3B82F6&color=fff&size=64&rounded=true`}
                            alt={`Dr. ${doctor.firstName}`}
                            className="w-16 h-16 rounded-full"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white">
                            <Shield size={8} className="text-white m-0.5" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-blue-600 font-semibold text-sm mb-2">{doctor.specialization}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                                <Briefcase size={12} className="mr-1 text-gray-400" />
                                <span>{doctor.yearsOfExperience} years</span>
                            </div>
                            <div className="flex items-center">
                                <University size={12} className="mr-1 text-gray-400" />
                                <span>{doctor.qualification || 'MBBS'}</span>
                            </div>
                            {doctor.languagesSpoken && (
                                <div className="flex items-center">
                                    <Languages size={12} className="mr-1 text-gray-400" />
                                    <span>{doctor.languagesSpoken}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Dr. {doctor.firstName} is an experienced {doctor.specialization.toLowerCase()} with {doctor.yearsOfExperience} years of practice, providing comprehensive healthcare with a patient-centered approach.
                        </p>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                        <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">₹{doctor.consultationFees || '500'}</div>
                            <div className="text-xs text-gray-500">Consultation</div>
                        </div>
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            Available Today
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone size={14} className="mr-2 text-blue-500" />
                                <span>{doctor.contactNumber}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail size={14} className="mr-2 text-blue-500" />
                                <span className="truncate">{doctor.email}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <button 
                        onClick={onToggleExpanded}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        <span>{isExpanded ? 'Show Less' : 'View Details'}</span>
                    </button>
                    
                    <button 
                        onClick={() => onSelectDoctor(doctor)}
                        disabled={loading}
                        className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Loading...</span>
                            </>
                        ) : (
                            <>
                                <Calendar size={16} />
                                <span>Book Appointment</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BookAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpec, setSelectedSpec] = useState('All');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [patientNotes, setPatientNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentStep, setCurrentStep] = useState('doctors');
    const [expandedDoctors, setExpandedDoctors] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const DOCTORS_PER_PAGE = 8;

    const [slotDateFilter, setSlotDateFilter] = useState('All');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        fetchApprovedDoctors();
    }, []);

    const fetchApprovedDoctors = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/patient/doctors/approved');
            if (response.ok) {
                const doctorsData = await response.json();
                setDoctors(doctorsData);
                const uniqueSpecs = ['All', ...new Set(doctorsData.map(d => d.specialization))];
                setSpecializations(uniqueSpecs);
            } else {
                setMessage({ type: 'error', text: 'Failed to load doctors' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Error loading doctors' });
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async (doctorId) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/api/patient/doctors/${doctorId}/available-slots`);
            if (response.ok) {
                const slots = await response.json();
                setAvailableSlots(slots);
                setCurrentStep('slots');
                setSelectedSlot(null);
                setSlotDateFilter('All');
                setBookingSuccess(false);
            } else {
                setMessage({ type: 'error', text: 'Failed to load available slots' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Error loading available slots' });
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/patient/appointments/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: selectedDoctor.id,
                    slotId: selectedSlot.id,
                    patientNotes: patientNotes
                })
            });

            const result = await response.json().catch(() => ({
                error: 'Network error occurred',
                action: 'RETRY'
            }));

            if (response.ok) {
                // Instead of navigating back, show success screen
                setBookingSuccess(true);
                setMessage({ type: 'success', text: '' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Booking failed' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleExpanded = (doctorId) => {
        setExpandedDoctors(prev => {
            const newSet = new Set(prev);
            if (newSet.has(doctorId)) newSet.delete(doctorId);
            else newSet.add(doctorId);
            return newSet;
        });
    };

    const formatDateTime = (dateTime) =>
        new Date(dateTime).toLocaleString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

    const formatDateOnly = (dateTime) =>
        new Date(dateTime).toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });

    // Filter and paginate doctors
    const filteredDoctors = doctors
        .filter(doctor => selectedSpec === 'All' || doctor.specialization === selectedSpec)
        .filter(doctor =>
            doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const totalPages = Math.ceil(filteredDoctors.length / DOCTORS_PER_PAGE);
    const paginatedDoctors = filteredDoctors.slice(
        (currentPage - 1) * DOCTORS_PER_PAGE,
        currentPage * DOCTORS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSpec, searchTerm]);

    // Group slots by date
    const groupedSlots = availableSlots.reduce((groups, slot) => {
        const dateKey = formatDateOnly(slot.startTime);
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(slot);
        return groups;
    }, {});

    const sortedDateKeys = Object.keys(groupedSlots).sort((a, b) => new Date(b) - new Date(a));

    // Filter slots by selected date or show all
    const slotDateFilterKeys = slotDateFilter === 'All'
        ? sortedDateKeys
        : sortedDateKeys.filter(key => key === slotDateFilter);

    // Render Success Confirmation screen
    const renderBookingSuccess = () => (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md border border-green-300 text-center">
            <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-green-800">Appointment Booked Successfully!</h2>
            <p className="mb-4 text-gray-700">
                Your appointment with <strong>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</strong> is scheduled on <strong>{formatDateTime(selectedSlot.startTime)}</strong>.
            </p>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => {
                        // Reset booking states to book new appointment
                        setSelectedDoctor(null);
                        setSelectedSlot(null);
                        setPatientNotes('');
                        setCurrentStep('doctors');
                        setBookingSuccess(false);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Book Another Appointment
                </button>
                {/* Placeholder for View Appointments */}
                {/* <button
                    onClick={() => {
                        // Navigate to user appointments if implemented
                    }}
                    className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                    View My Appointments
                </button> */}
            </div>
        </div>
    );

    const renderDoctorSelection = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
                        <Stethoscope size={24} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Healthcare Provider</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">Connect with experienced doctors and book appointments easily</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center mb-4">
                        <div className="relative flex-1 max-w-md">
                            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search doctors by name or specialization..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {specializations.map(spec => (
                            <button
                                key={spec}
                                onClick={() => setSelectedSpec(spec)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                    selectedSpec === spec
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                                }`}
                            >
                                {spec} {spec !== 'All' && `(${doctors.filter(d => d.specialization === spec).length})`}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                        Showing <span className="font-semibold">{paginatedDoctors.length}</span> of <span className="font-semibold">{filteredDoctors.length}</span>{' '}
                        doctors
                    </p>
                    {totalPages > 1 && (
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">Loading doctors...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 mb-8">
                            {paginatedDoctors.map(doctor => (
                                <DoctorCard
                                    key={doctor.id}
                                    doctor={doctor}
                                    onSelectDoctor={doctor => {
                                        setSelectedDoctor(doctor);
                                        fetchAvailableSlots(doctor.id);
                                    }}
                                    loading={loading}
                                    isExpanded={expandedDoctors.has(doctor.id)}
                                    onToggleExpanded={() => handleToggleExpanded(doctor.id)}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        {filteredDoctors.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User size={24} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedSpec('All');
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    const renderSlotSelection = () => {
        if (!selectedDoctor) return null;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img
                                src={`https://ui-avatars.com/api/?name=${selectedDoctor.firstName}+${selectedDoctor.lastName}&background=3B82F6&color=fff&size=64&rounded=true`}
                                alt={`Dr. ${selectedDoctor.firstName}`}
                                className="w-16 h-16 rounded-xl"
                            />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                                </h2>
                                <p className="text-blue-600 font-semibold">{selectedDoctor.specialization}</p>
                                <p className="text-sm text-gray-600">₹{selectedDoctor.consultationFees || '500'} • 30 min consultation</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setCurrentStep('doctors');
                                setSelectedDoctor(null);
                                setAvailableSlots([]);
                            }}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Doctors</span>
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Appointment Time</h3>

                    {availableSlots.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">No available slots</h4>
                            <p className="text-gray-600 mb-6">Dr. {selectedDoctor.firstName} doesn't have available slots right now.</p>
                            <button
                                onClick={() => fetchAvailableSlots(selectedDoctor.id)}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Refresh availability
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Date filter buttons */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <button
                                    onClick={() => setSlotDateFilter('All')}
                                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                        slotDateFilter === 'All'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                                    }`}
                                >
                                    All
                                </button>
                                {sortedDateKeys.map(dateKey => (
                                    <button
                                        key={dateKey}
                                        onClick={() => setSlotDateFilter(dateKey)}
                                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                            slotDateFilter === dateKey
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                                        }`}
                                    >
                                        {dateKey} ({groupedSlots[dateKey].length})
                                    </button>
                                ))}
                            </div>

                            {/* Render filtered slots grouped by date */}
                            {slotDateFilterKeys.map(date => (
                                <div key={date} className="mb-6">
                                    <h4 className="text-md font-semibold text-gray-700 mb-3">{date}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedSlots[date].map(slot => (
                                            <div
                                                key={slot.id}
                                                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                    selectedSlot?.id === slot.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                                onClick={() => {
                                                    setSelectedSlot(slot);
                                                    setCurrentStep('confirm');
                                                }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <Clock size={16} className="text-blue-600 mr-2" />
                                                        <span className="text-sm font-medium text-green-600">Available</span>
                                                    </div>
                                                    {selectedSlot?.id === slot.id && (
                                                        <CheckCircle size={16} className="text-blue-600" />
                                                    )}
                                                </div>
                                                <p className="font-semibold text-gray-900">{formatDateTime(slot.startTime)}</p>
                                                <p className="text-sm text-gray-600">30 minutes session</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderConfirmation = () => {
        if (!selectedDoctor || !selectedSlot) return null;
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Confirm Your Appointment</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Doctor Details</h3>
                            <div className="flex items-center space-x-3 mb-3">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${selectedDoctor.firstName}+${selectedDoctor.lastName}&background=3B82F6&color=fff&size=48&rounded=true`}
                                    alt={`Dr. ${selectedDoctor.firstName}`}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <p className="font-semibold">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                                    <p className="text-sm text-blue-600">{selectedDoctor.specialization}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Phone size={14} className="mr-2" />
                                    {selectedDoctor.contactNumber}
                                </div>
                                <div className="flex items-center">
                                    <Mail size={14} className="mr-2" />
                                    {selectedDoctor.email}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Appointment Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Date & Time</p>
                                    <p className="font-semibold">{formatDateTime(selectedSlot.startTime)}</p>
                                    <p className="text-sm text-gray-500">Duration: 30 minutes</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Consultation Fee</p>
                                    <p className="text-2xl font-bold text-green-600">₹{selectedDoctor.consultationFees || '500'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Notes for Dr. {selectedDoctor.firstName} <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <textarea
                        value={patientNotes}
                        onChange={e => setPatientNotes(e.target.value)}
                        rows="4"
                        placeholder="Share your symptoms, concerns, or questions..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-2">This helps the doctor prepare for your consultation.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => {
                            setCurrentStep('slots');
                            setSelectedSlot(null);
                        }}
                        className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft size={16} />
                        <span>Change Time</span>
                    </button>
                    <button
                        onClick={handleBookAppointment}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 font-semibold transition-colors"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Booking...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                <span>Confirm Appointment</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {bookingSuccess ? (
                renderBookingSuccess()
            ) : currentStep === 'doctors' ? (
                renderDoctorSelection()
            ) : currentStep === 'slots' ? (
                renderSlotSelection()
            ) : (
                renderConfirmation()
            )}
        </div>
    );
};

export default BookAppointment;
