import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, Award, DollarSign, Phone, Mail } from 'lucide-react';

const BookAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null); // ✅ Initialize as null
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [patientNotes, setPatientNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentStep, setCurrentStep] = useState('doctors');

    // Add this debug code to your BookAppointment component
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('User from localStorage:', user);

        // Check if user ID matches what you expect

        fetchApprovedDoctors();
    }, []);


    const fetchApprovedDoctors = async () => {
        try {
            console.log('Fetching approved doctors...');
            const response = await fetch('http://localhost:8080/api/patient/doctors/approved');
            if (response.ok) {
                const doctorsData = await response.json();
                setDoctors(doctorsData);
                console.log('Approved doctors loaded:', doctorsData);
            } else {
                console.error('Failed to fetch doctors:', response.status);
                setMessage({ type: 'error', text: 'Failed to load doctors' });
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setMessage({ type: 'error', text: 'Error loading doctors' });
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
            } else {
                setMessage({ type: 'error', text: 'Failed to load available slots' });
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
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
                headers: {
                    'Content-Type': 'application/json',
                },
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
                setMessage({
                    type: 'success',
                    text: result.message || 'Appointment booked successfully!'
                });

                // Reset form
                setSelectedDoctor(null);
                setSelectedSlot(null);
                setPatientNotes('');
                setCurrentStep('doctors');

            } else {
                // Handle specific error actions
                switch (result.action) {
                    case 'COMPLETE_PROFILE':
                        setMessage({
                            type: 'error',
                            text: result.error + ' Click here to complete your profile.',
                            action: () => navigate('/patient/profile')
                        });
                        break;

                    case 'WAIT_APPROVAL':
                        setMessage({
                            type: 'warning',
                            text: `Account Status: ${result.status}. Please wait for admin approval or contact support.`
                        });
                        break;

                    case 'SELECT_DIFFERENT_SLOT':
                        setMessage({
                            type: 'error',
                            text: result.error + ' Please select another time slot.'
                        });
                        setCurrentStep('slots');
                        fetchAvailableSlots(selectedDoctor.id); // Refresh slots
                        break;

                    case 'REFRESH_SLOTS':
                        setMessage({
                            type: 'error',
                            text: result.error
                        });
                        fetchAvailableSlots(selectedDoctor.id);
                        break;

                    default:
                        setMessage({ type: 'error', text: result.error || 'Booking failed' });
                }
            }
        } catch (error) {
            console.error('Network error:', error);
            setMessage({
                type: 'error',
                text: 'Network error. Please check your connection and try again.'
            });
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

    const filteredDoctors = doctors.filter(doctor =>
        doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderDoctorSelection = () => (
        <div className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by doctor name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Dr. {doctor.firstName} {doctor.lastName}
                                </h3>
                                <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                                <Clock size={16} className="mr-2" />
                                <span>{doctor.yearsOfExperience} years experience</span>
                            </div>
                            {doctor.consultationFees && (
                                <div className="flex items-center">
                                    <DollarSign size={16} className="mr-2" />
                                    <span>₹{doctor.consultationFees} consultation fee</span>
                                </div>
                            )}
                            <div className="flex items-center">
                                <Phone size={16} className="mr-2" />
                                <span>{doctor.contactNumber}</span>
                            </div>
                            <div className="flex items-center">
                                <Mail size={16} className="mr-2" />
                                <span>{doctor.email}</span>
                            </div>
                            {doctor.languagesSpoken && (
                                <div className="flex items-center">
                                    <span className="mr-2">🗣️</span>
                                    <span>{doctor.languagesSpoken}</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setSelectedDoctor(doctor);
                                fetchAvailableSlots(doctor.id);
                            }}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Loading Slots...' : 'View Available Slots'}
                        </button>
                    </div>
                ))}
            </div>

            {filteredDoctors.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-600">No doctors found matching your search.</p>
                </div>
            )}
        </div>
    );

    // ✅ FIX: Add null checks in renderSlotSelection
    const renderSlotSelection = () => {
        // Add null check to prevent crashes
        if (!selectedDoctor) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-600">Please select a doctor first.</p>
                    <button
                        onClick={() => setCurrentStep('doctors')}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        ← Back to Doctor Selection
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Available Slots - Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                        </h2>
                        <p className="text-gray-600">{selectedDoctor.specialization}</p>
                    </div>
                    <button
                        onClick={() => {
                            setCurrentStep('doctors');
                            setSelectedDoctor(null);
                            setAvailableSlots([]);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Back to Doctors
                    </button>
                </div>

                {availableSlots.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No available slots at the moment.</p>
                        <p className="text-sm text-gray-500">Please check back later or choose another doctor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableSlots.map((slot) => (
                            <div
                                key={slot.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedSlot?.id === slot.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                onClick={() => {
                                    setSelectedSlot(slot);
                                    setCurrentStep('confirm');
                                }}
                            >
                                <div className="flex items-center mb-2">
                                    <Clock size={16} className="text-blue-600 mr-2" />
                                    <span className="font-medium">Available</span>
                                </div>
                                <p className="font-semibold">{formatDateTime(slot.startTime)}</p>
                                <p className="text-sm text-gray-600">to {formatDateTime(slot.endTime)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ✅ FIX: Add null checks in renderConfirmation
    const renderConfirmation = () => {
        if (!selectedDoctor || !selectedSlot) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-600">Missing selection information.</p>
                    <button
                        onClick={() => setCurrentStep('doctors')}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        ← Start Over
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Confirm Appointment</h2>
                    <button
                        onClick={() => {
                            setCurrentStep('slots');
                            setSelectedSlot(null);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Back to Slots
                    </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">Doctor</h3>
                        <p>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                        <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900">Appointment Time</h3>
                        <p>{formatDateTime(selectedSlot.startTime)} - {formatDateTime(selectedSlot.endTime)}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900">Contact Information</h3>
                        <p className="text-sm text-gray-600">{selectedDoctor.contactNumber}</p>
                        <p className="text-sm text-gray-600">{selectedDoctor.email}</p>
                    </div>

                    {selectedDoctor.consultationFees && (
                        <div>
                            <h3 className="font-semibold text-gray-900">Consultation Fee</h3>
                            <p>₹{selectedDoctor.consultationFees}</p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes (Optional)
                    </label>
                    <textarea
                        value={patientNotes}
                        onChange={(e) => setPatientNotes(e.target.value)}
                        rows="3"
                        placeholder="Any specific symptoms, concerns, or questions for the doctor..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    onClick={handleBookAppointment}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 font-medium"
                >
                    {loading ? 'Booking Appointment...' : 'Book Appointment'}
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg">
                <div className="border-b border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
                    <p className="text-gray-600">Find and book appointments with verified doctors</p>
                </div>

                {message.text && (
                    <div className={`m-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="p-6">
                    {currentStep === 'doctors' && renderDoctorSelection()}
                    {currentStep === 'slots' && renderSlotSelection()}
                    {currentStep === 'confirm' && renderConfirmation()}
                </div>
            </div>
        </div>
    );
};

export default BookAppointment;
