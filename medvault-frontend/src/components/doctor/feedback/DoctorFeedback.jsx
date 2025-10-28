import React, { useState, useEffect } from 'react';
import { 
    Star, 
    MessageSquare, 
    User, 
    Calendar, 
    TrendingUp, 
    BarChart3, 
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    Heart,
    Award,
    Users,
    Clock,
    ThumbsUp,
    Quote,
    Shield
} from 'lucide-react';

const DoctorFeedback = () => {
    const [feedbackData, setFeedbackData] = useState({
        feedbacks: [],
        averageRating: 0,
        totalFeedbacks: 0,
        ratingDistribution: {}
    });
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);

    useEffect(() => {
        fetchFeedback();
    }, []);

    useEffect(() => {
        filterFeedbacks();
    }, [feedbackData.feedbacks, searchTerm, ratingFilter, dateFilter]);

    const fetchFeedback = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/doctor/feedback/${user.id}`);
            
            if (response.ok) {
                const data = await response.json();
                setFeedbackData(data);
                setFilteredFeedbacks(data.feedbacks || []);
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterFeedbacks = () => {
        let filtered = [...feedbackData.feedbacks];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(feedback => 
                feedback.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (feedback.comment && feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Rating filter
        if (ratingFilter !== 'ALL') {
            filtered = filtered.filter(feedback => feedback.rating === parseInt(ratingFilter));
        }

        // Date filter
        if (dateFilter !== 'ALL') {
            const now = new Date();
            filtered = filtered.filter(feedback => {
                const feedbackDate = new Date(feedback.feedbackDate);
                
                switch (dateFilter) {
                    case 'THIS_WEEK':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return feedbackDate >= weekAgo;
                    case 'THIS_MONTH':
                        return feedbackDate.getMonth() === now.getMonth() && 
                               feedbackDate.getFullYear() === now.getFullYear();
                    case 'THIS_YEAR':
                        return feedbackDate.getFullYear() === now.getFullYear();
                    default:
                        return true;
                }
            });
        }

        setFilteredFeedbacks(filtered);
        setCurrentPage(1);
    };

    // Pagination calculations
    const totalItems = filteredFeedbacks.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);

    const StarRating = ({ rating, size = 16 }) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={size}
                        className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                ))}
            </div>
        );
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTimeAgo = (dateTime) => {
        const now = new Date();
        const date = new Date(dateTime);
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return `${Math.ceil(diffDays / 30)} months ago`;
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'text-emerald-600';
        if (rating >= 3.5) return 'text-blue-600';
        if (rating >= 2.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRatingLabel = (rating) => {
        if (rating >= 4.5) return 'Excellent';
        if (rating >= 3.5) return 'Good';
        if (rating >= 2.5) return 'Average';
        return 'Needs Improvement';
    };

    // Pagination component
    const Pagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} reviews
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
                        <option value={6}>6 per page</option>
                        <option value={12}>12 per page</option>
                        <option value={18}>18 per page</option>
                        <option value={24}>24 per page</option>
                    </select>
                    
                    <nav className="flex items-center space-x-1">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                        currentPage === pageNum
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex justify-center items-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                    </div>
                    <p className="text-gray-600 font-medium">Loading feedback...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                                    <Heart size={24} className="text-blue-600" />
                                </div>
                                Patient Reviews & Feedback
                            </h1>
                            <p className="text-gray-600">Monitor patient satisfaction and improve your care quality</p>
                        </div>
                        
                        <div className="text-right">
                            <div className={`text-3xl font-bold ${getRatingColor(feedbackData.averageRating)}`}>
                                {feedbackData.averageRating.toFixed(1)}★
                            </div>
                            <div className="text-sm text-gray-500">
                                {getRatingLabel(feedbackData.averageRating)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                                <p className="text-2xl font-bold text-gray-900 mb-2">
                                    {feedbackData.averageRating.toFixed(1)}
                                </p>
                                <StarRating rating={Math.round(feedbackData.averageRating)} size={14} />
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                                <Star size={20} className="text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                                <p className="text-2xl font-bold text-gray-900 mb-2">
                                    {feedbackData.totalFeedbacks}
                                </p>
                                <p className="text-xs text-gray-500">All time</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <MessageSquare size={20} className="text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">5-Star Reviews</p>
                                <p className="text-2xl font-bold text-gray-900 mb-2">
                                    {feedbackData.ratingDistribution[5] || 0}
                                </p>
                                <p className="text-xs text-emerald-600">
                                    {feedbackData.totalFeedbacks > 0 
                                        ? `${Math.round((feedbackData.ratingDistribution[5] || 0) / feedbackData.totalFeedbacks * 100)}%` 
                                        : '0%'
                                    }
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <Award size={20} className="text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Patient Satisfaction</p>
                                <p className="text-2xl font-bold text-gray-900 mb-2">
                                    {feedbackData.totalFeedbacks > 0 
                                        ? `${Math.round(((feedbackData.ratingDistribution[4] || 0) + (feedbackData.ratingDistribution[5] || 0)) / feedbackData.totalFeedbacks * 100)}%`
                                        : '0%'
                                    }
                                </p>
                                <p className="text-xs text-gray-500">4+ stars</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <ThumbsUp size={20} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <BarChart3 size={20} className="mr-2 text-blue-600" />
                            Rating Distribution
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = feedbackData.ratingDistribution[rating] || 0;
                                const percentage = feedbackData.totalFeedbacks > 0 
                                    ? (count / feedbackData.totalFeedbacks) * 100 
                                    : 0;
                                
                                return (
                                    <div key={rating} className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2 w-20">
                                            <span className="text-sm font-medium text-gray-700">{rating}</span>
                                            <Star size={16} className="text-yellow-400 fill-current" />
                                        </div>
                                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 w-20">
                                            <span className="text-sm font-medium text-gray-700">{count}</span>
                                            <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
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
                                    placeholder="Search reviews by patient name or comment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>

                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">All Time</option>
                            <option value="THIS_WEEK">This Week</option>
                            <option value="THIS_MONTH">This Month</option>
                            <option value="THIS_YEAR">This Year</option>
                        </select>
                    </div>

                    {(searchTerm || ratingFilter !== 'ALL' || dateFilter !== 'ALL') && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {filteredFeedbacks.length} of {feedbackData.totalFeedbacks} reviews
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setRatingFilter('ALL');
                                    setDateFilter('ALL');
                                }}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Reviews */}
                {filteredFeedbacks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {feedbackData.totalFeedbacks === 0 ? 'No Reviews Yet' : 'No Matching Reviews'}
                        </h3>
                        <p className="text-gray-500 mb-8">
                            {feedbackData.totalFeedbacks === 0 
                                ? 'Patient reviews will appear here after completed appointments. Provide excellent care to earn positive feedback!'
                                : 'Try adjusting your search criteria or filters to find specific reviews.'
                            }
                        </p>
                        {feedbackData.totalFeedbacks > 0 && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setRatingFilter('ALL');
                                    setDateFilter('ALL');
                                }}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium"
                            >
                                Show all reviews
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            {currentItems.map((feedback) => (
                                <div key={feedback.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold">
                                            {feedback.patientName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {feedback.isAnonymous ? 'Anonymous Patient' : feedback.patientName}
                                                </h3>
                                                {feedback.isAnonymous && (
                                                    <Shield size={14} className="text-gray-400" />
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center space-x-3 mb-3">
                                                <StarRating rating={feedback.rating} size={14} />
                                                <span className="text-sm text-gray-500">
                                                    {getTimeAgo(feedback.feedbackDate)}
                                                </span>
                                            </div>
                                            
                                            {feedback.comment && (
                                                <div className="bg-white rounded-lg p-4 border border-gray-100 mb-3 relative">
                                                    <Quote size={16} className="absolute top-2 left-2 text-gray-300" />
                                                    <p className="text-sm text-gray-700 leading-relaxed pl-6">
                                                        {feedback.comment}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {feedback.appointmentDate && (
                                                <div className="flex items-center text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
                                                    <Calendar size={12} className="mr-2" />
                                                    Appointment: {formatDateTime(feedback.appointmentDate)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <Pagination />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorFeedback;
