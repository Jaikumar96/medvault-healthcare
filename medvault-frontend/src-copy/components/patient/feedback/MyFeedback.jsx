import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, User, Clock, Send, CheckCircle } from 'lucide-react';

const MyFeedback = () => {
    const [completedAppointments, setCompletedAppointments] = useState([]);
    const [myFeedback, setMyFeedback] = useState([]);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [feedbackData, setFeedbackData] = useState({
        rating: 0,
        comment: '',
        isAnonymous: false
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            // Fetch completed appointments
            const appointmentsResponse = await fetch(`http://localhost:8080/api/patient/appointments/${user.id}`);
            if (appointmentsResponse.ok) {
                const appointments = await appointmentsResponse.json();
                const completed = appointments.filter(apt => apt.status === 'COMPLETED');
                setCompletedAppointments(completed);
            }

            // Fetch existing feedback
            const feedbackResponse = await fetch(`http://localhost:8080/api/patient/my-feedback/${user.id}`);
            if (feedbackResponse.ok) {
                const feedback = await feedbackResponse.json();
                setMyFeedback(feedback);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (feedbackData.rating === 0) {
            setMessage({ type: 'error', text: 'Please select a rating' });
            return;
        }

        setSubmitting(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/patient/feedback/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId: selectedAppointment.id,
                    rating: feedbackData.rating,
                    comment: feedbackData.comment,
                    isAnonymous: feedbackData.isAnonymous
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                setMessage({ type: 'success', text: 'Feedback submitted successfully!' });
                setShowFeedbackForm(false);
                setFeedbackData({ rating: 0, comment: '', isAnonymous: false });
                fetchData(); // Refresh data
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to submit feedback' });
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ rating, onRatingChange, readonly = false }) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => !readonly && onRatingChange(star)}
                        className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
                    >
                        <Star
                            size={24}
                            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                    </button>
                ))}
            </div>
        );
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

    const getAppointmentsWithoutFeedback = () => {
        return completedAppointments.filter(apt => 
            !myFeedback.some(feedback => feedback.appointmentId === apt.id)
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>Loading feedback data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <MessageSquare size={32} className="mr-3 text-blue-600" />
                        My Reviews & Feedback
                    </h1>
                    <p className="text-gray-600 mt-2">Share your experience and help other patients</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                        message.type === 'success' 
                            ? 'bg-green-50 border-green-400 text-green-800' 
                            : 'bg-red-50 border-red-400 text-red-800'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Pending Reviews */}
                {getAppointmentsWithoutFeedback().length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Pending Reviews</h2>
                            <p className="text-gray-600 text-sm">Rate your recent appointments</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {getAppointmentsWithoutFeedback().map((appointment) => (
                                <div key={appointment.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {appointment.doctorName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {appointment.doctorSpecialization}
                                            </p>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Calendar size={14} className="mr-1" />
                                                {formatDateTime(appointment.appointmentStartTime)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedAppointment(appointment);
                                            setShowFeedbackForm(true);
                                            setMessage({ type: '', text: '' });
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                    >
                                        <Star size={16} />
                                        <span>Rate Doctor</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Feedback Form Modal */}
                {showFeedbackForm && selectedAppointment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Rate {selectedAppointment.doctorName}
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        How was your experience?
                                    </label>
                                    <StarRating 
                                        rating={feedbackData.rating} 
                                        onRatingChange={(rating) => setFeedbackData({...feedbackData, rating})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Comments (Optional)
                                    </label>
                                    <textarea
                                        value={feedbackData.comment}
                                        onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})}
                                        rows="3"
                                        placeholder="Share your experience..."
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={feedbackData.isAnonymous}
                                        onChange={(e) => setFeedbackData({...feedbackData, isAnonymous: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <label className="text-sm text-gray-700">Submit anonymously</label>
                                </div>
                            </div>
                            
                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => setShowFeedbackForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitFeedback}
                                    disabled={submitting || feedbackData.rating === 0}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {submitting ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            <Send size={16} className="mr-2" />
                                            Submit
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Previous Reviews */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">My Previous Reviews</h2>
                        <p className="text-gray-600 text-sm">Your feedback history</p>
                    </div>
                    
                    {myFeedback.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                            <p className="text-gray-600">Your reviews will appear here after you rate your completed appointments</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {myFeedback.map((feedback) => (
                                <div key={feedback.id} className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User size={20} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {feedback.doctorName}
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <StarRating rating={feedback.rating} readonly />
                                                    <span className="text-sm text-gray-500">
                                                        {formatDateTime(feedback.feedbackDate)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {feedback.appointmentDate && (
                                                <p className="text-sm text-gray-600 mb-2 flex items-center">
                                                    <Calendar size={14} className="mr-1" />
                                                    Appointment: {formatDateTime(feedback.appointmentDate)}
                                                </p>
                                            )}
                                            
                                            {feedback.comment && (
                                                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                                                    <p className="text-sm text-gray-700">{feedback.comment}</p>
                                                </div>
                                            )}
                                            
                                            {feedback.isAnonymous && (
                                                <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                    Anonymous Review
                                                </span>
                                            )}
                                        </div>
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

export default MyFeedback;
