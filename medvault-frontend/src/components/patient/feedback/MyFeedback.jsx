import React, { useState, useEffect } from 'react';
import { 
    Star, MessageSquare, Calendar, User, Clock, Send, CheckCircle, 
    Heart, Award, TrendingUp, Filter, Search, Plus, Edit3,
    ChevronRight, ArrowRight, Sparkles, BadgeCheck, Quote,
    X, AlertTriangle, ThumbsUp, ThumbsDown, Smile, Meh, Frown
} from 'lucide-react';

const MyFeedback = () => {
    const [completedAppointments, setCompletedAppointments] = useState([]);
    const [myFeedback, setMyFeedback] = useState([]);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [feedbackData, setFeedbackData] = useState({
        rating: 0,
        comment: '',
        isAnonymous: false,
        categories: {
            communication: 0,
            professionalism: 0,
            wait_time: 0,
            facilities: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            const appointmentsResponse = await fetch(`http://localhost:8080/api/patient/appointments/${user.id}`);
            if (appointmentsResponse.ok) {
                const appointments = await appointmentsResponse.json();
                const completed = appointments.filter(apt => apt.status === 'COMPLETED');
                setCompletedAppointments(completed);
            }

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
                    isAnonymous: feedbackData.isAnonymous,
                    categories: feedbackData.categories
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                setMessage({ type: 'success', text: 'Thank you for your valuable feedback!' });
                setShowFeedbackForm(false);
                setFeedbackData({ 
                    rating: 0, 
                    comment: '', 
                    isAnonymous: false,
                    categories: { communication: 0, professionalism: 0, wait_time: 0, facilities: 0 }
                });
                fetchData();
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to submit feedback' });
        } finally {
            setSubmitting(false);
        }
    };

    // Enhanced Star Rating with hover effects and animations
    const StarRating = ({ rating, onRatingChange, readonly = false, size = 24 }) => {
        const [hoverRating, setHoverRating] = useState(0);

        const getRatingText = (rating) => {
            const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
            return texts[rating] || '';
        };

        return (
            <div className="flex flex-col items-center">
                <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            disabled={readonly}
                            onClick={() => !readonly && onRatingChange(star)}
                            onMouseEnter={() => !readonly && setHoverRating(star)}
                            onMouseLeave={() => !readonly && setHoverRating(0)}
                            className={`transition-all duration-200 ${
                                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
                            }`}
                        >
                            <Star
                                size={size}
                                className={`transition-colors duration-200 ${
                                    star <= (hoverRating || rating) 
                                        ? star <= 2 
                                            ? 'text-red-400 fill-current' 
                                            : star <= 3 
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-green-400 fill-current'
                                        : 'text-gray-300'
                                }`}
                            />
                        </button>
                    ))}
                </div>
                {!readonly && (hoverRating || rating) > 0 && (
                    <span className={`text-sm font-medium mt-2 transition-all duration-200 ${
                        (hoverRating || rating) <= 2 ? 'text-red-600' :
                        (hoverRating || rating) <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                        {getRatingText(hoverRating || rating)}
                    </span>
                )}
            </div>
        );
    };

    // Category Rating Component
    const CategoryRating = ({ title, rating, onRatingChange, icon: Icon }) => (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
                <Icon size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{title}</span>
            </div>
            <StarRating 
                rating={rating} 
                onRatingChange={onRatingChange}
                size={16}
            />
        </div>
    );

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

    const filteredFeedback = myFeedback.filter(feedback => {
        const matchesSearch = searchTerm === '' || 
            feedback.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = activeFilter === 'all' ||
            (activeFilter === 'high' && feedback.rating >= 4) ||
            (activeFilter === 'low' && feedback.rating <= 2);
        
        return matchesSearch && matchesFilter;
    });

    // Enhanced loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-300 rounded-lg w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                    <div className="h-16 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const stats = {
        totalReviews: myFeedback.length,
        avgRating: myFeedback.length > 0 ? (myFeedback.reduce((sum, f) => sum + f.rating, 0) / myFeedback.length).toFixed(1) : 0,
        pendingReviews: getAppointmentsWithoutFeedback().length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Enhanced Header with Stats */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                            <Heart size={28} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Your Healthcare Reviews
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Share your experiences and help build a better healthcare community for everyone
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <MessageSquare size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-gray-900">{stats.totalReviews}</div>
                                    <div className="text-sm text-gray-600">Total Reviews</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Award size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-gray-900">{stats.avgRating}</div>
                                    <div className="text-sm text-gray-600">Average Rating</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Clock size={24} className="text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</div>
                                    <div className="text-sm text-gray-600">Pending Reviews</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Message */}
                {message.text && (
                    <div className={`mb-8 p-6 rounded-2xl border-l-4 shadow-sm ${
                        message.type === 'success' 
                            ? 'bg-green-50 border-green-400 text-green-800' 
                            : 'bg-red-50 border-red-400 text-red-800'
                    }`}>
                        <div className="flex items-center space-x-3">
                            {message.type === 'success' ? (
                                <CheckCircle size={24} className="text-green-600" />
                            ) : (
                                <AlertTriangle size={24} className="text-red-600" />
                            )}
                            <div>
                                <p className="font-semibold">{message.text}</p>
                                {message.type === 'success' && (
                                    <p className="text-sm mt-1 opacity-90">Your feedback helps improve healthcare for everyone.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Pending Reviews Section */}
                {getAppointmentsWithoutFeedback().length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-8 mb-12 border border-amber-200 shadow-sm">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500 rounded-2xl mb-4">
                                <Sparkles size={24} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
                            <p className="text-gray-600">Help other patients by rating your recent appointments</p>
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {getAppointmentsWithoutFeedback().map((appointment) => (
                                <div key={appointment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                                    <div className="flex items-start space-x-4 mb-6">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <User size={20} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                                                {appointment.doctorName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {appointment.doctorSpecialization}
                                            </p>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar size={14} className="mr-1" />
                                                {formatDateTime(appointment.appointmentStartTime)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => {
                                            setSelectedAppointment(appointment);
                                            setShowFeedbackForm(true);
                                            setMessage({ type: '', text: '' });
                                        }}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                                    >
                                        <Star size={18} />
                                        <span>Write Review</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enhanced Feedback Form Modal */}
                {showFeedbackForm && selectedAppointment && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">
                                            Rate Dr. {selectedAppointment.doctorName}
                                        </h3>
                                        <p className="text-blue-100">
                                            {selectedAppointment.doctorSpecialization}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowFeedbackForm(false)}
                                        className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center hover:bg-opacity-30 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Overall Rating */}
                                <div className="text-center">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        How was your overall experience?
                                    </h4>
                                    <StarRating 
                                        rating={feedbackData.rating} 
                                        onRatingChange={(rating) => setFeedbackData({...feedbackData, rating})}
                                        size={40}
                                    />
                                </div>

                                {/* Category Ratings */}
                                {feedbackData.rating > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-semibold text-gray-900">Rate specific aspects:</h4>
                                        <div className="space-y-3">
                                            <CategoryRating
                                                title="Communication"
                                                rating={feedbackData.categories.communication}
                                                onRatingChange={(rating) => setFeedbackData({
                                                    ...feedbackData,
                                                    categories: { ...feedbackData.categories, communication: rating }
                                                })}
                                                icon={MessageSquare}
                                            />
                                            <CategoryRating
                                                title="Professionalism"
                                                rating={feedbackData.categories.professionalism}
                                                onRatingChange={(rating) => setFeedbackData({
                                                    ...feedbackData,
                                                    categories: { ...feedbackData.categories, professionalism: rating }
                                                })}
                                                icon={BadgeCheck}
                                            />
                                            <CategoryRating
                                                title="Wait Time"
                                                rating={feedbackData.categories.wait_time}
                                                onRatingChange={(rating) => setFeedbackData({
                                                    ...feedbackData,
                                                    categories: { ...feedbackData.categories, wait_time: rating }
                                                })}
                                                icon={Clock}
                                            />
                                            <CategoryRating
                                                title="Facilities"
                                                rating={feedbackData.categories.facilities}
                                                onRatingChange={(rating) => setFeedbackData({
                                                    ...feedbackData,
                                                    categories: { ...feedbackData.categories, facilities: rating }
                                                })}
                                                icon={Award}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Comment */}
                                <div>
                                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                                        Share your experience (Optional)
                                    </label>
                                    <textarea
                                        value={feedbackData.comment}
                                        onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})}
                                        rows="4"
                                        placeholder="What went well? How could the experience be improved?"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        Your feedback helps doctors improve their service
                                    </p>
                                </div>

                                {/* Anonymous Option */}
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="anonymous"
                                        checked={feedbackData.isAnonymous}
                                        onChange={(e) => setFeedbackData({...feedbackData, isAnonymous: e.target.checked})}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="anonymous" className="text-gray-700 font-medium">
                                        Submit as anonymous review
                                    </label>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 pt-0">
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setShowFeedbackForm(false)}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitFeedback}
                                        disabled={submitting || feedbackData.rating === 0}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                                    >
                                        {submitting ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                <span>Submit Review</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Previous Reviews Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Review History</h2>
                                <p className="text-gray-600">Track your feedback and help improve healthcare quality</p>
                            </div>
                            
                            {/* Search and Filter */}
                            {myFeedback.length > 0 && (
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search reviews..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    
                                    <select
                                        value={activeFilter}
                                        onChange={(e) => setActiveFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    >
                                        <option value="all">All Reviews</option>
                                        <option value="high">High Rated (4-5 stars)</option>
                                        <option value="low">Needs Improvement (1-2 stars)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {filteredFeedback.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                                <MessageSquare size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {myFeedback.length === 0 ? 'No reviews yet' : 'No matching reviews'}
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                {myFeedback.length === 0 
                                    ? 'Your reviews will appear here after you rate your completed appointments'
                                    : 'Try adjusting your search or filter criteria'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredFeedback.map((feedback, index) => (
                                <div key={feedback.id} className="p-8 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start space-x-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                                            <User size={24} className="text-white" />
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                        Dr. {feedback.doctorName}
                                                    </h3>
                                                    {feedback.appointmentDate && (
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            <Calendar size={14} className="mr-2" />
                                                            {formatDateTime(feedback.appointmentDate)}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <div className="text-right">
                                                    <StarRating rating={feedback.rating} readonly size={20} />
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        {formatDateTime(feedback.feedbackDate)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {feedback.comment && (
                                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border border-blue-100">
                                                    <div className="flex items-start space-x-3">
                                                        <Quote size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                                                        <p className="text-gray-700 italic leading-relaxed">"{feedback.comment}"</p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {feedback.isAnonymous && (
                                                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                            <User size={12} className="mr-1" />
                                                            Anonymous
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <ThumbsUp size={14} className="mr-1" />
                                                    <span>Review #{myFeedback.length - index}</span>
                                                </div>
                                            </div>
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
