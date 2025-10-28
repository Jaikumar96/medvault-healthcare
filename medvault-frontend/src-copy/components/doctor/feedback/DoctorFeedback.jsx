import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

const DoctorFeedback = () => {
    const [feedbackData, setFeedbackData] = useState({
        feedbacks: [],
        averageRating: 0,
        totalFeedbacks: 0,
        ratingDistribution: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/doctor/feedback/${user.id}`);
            
            if (response.ok) {
                const data = await response.json();
                setFeedbackData(data);
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const StarRating = ({ rating }) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>Loading feedback...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <MessageSquare size={32} className="mr-3 text-blue-600" />
                        Patient Reviews & Feedback
                    </h1>
                    <p className="text-gray-600 mt-2">See what your patients are saying about you</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Average Rating</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {feedbackData.averageRating.toFixed(1)}
                                </p>
                                <StarRating rating={Math.round(feedbackData.averageRating)} />
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Star size={24} className="text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Reviews</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {feedbackData.totalFeedbacks}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MessageSquare size={24} className="text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rating Trend</p>
                                <p className="text-3xl font-bold text-green-600">↑</p>
                                <p className="text-sm text-green-600">Positive</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUp size={24} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Rating Distribution</h2>
                    </div>
                    <div className="p-6">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const count = feedbackData.ratingDistribution[rating] || 0;
                            const percentage = feedbackData.totalFeedbacks > 0 
                                ? (count / feedbackData.totalFeedbacks) * 100 
                                : 0;
                            
                            return (
                                <div key={rating} className="flex items-center space-x-4 mb-2">
                                    <div className="flex items-center space-x-1 w-16">
                                        <span className="text-sm text-gray-600">{rating}</span>
                                        <Star size={14} className="text-yellow-400 fill-current" />
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600 w-12">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
                    </div>
                    
                    {feedbackData.feedbacks.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                            <p className="text-gray-600">Patient reviews will appear here after completed appointments</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {feedbackData.feedbacks.map((feedback) => (
                                <div key={feedback.id} className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User size={20} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {feedback.patientName}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <StarRating rating={feedback.rating} />
                                                        <span className="text-sm text-gray-500">
                                                            {formatDateTime(feedback.feedbackDate)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {feedback.appointmentDate && (
                                                    <span className="text-sm text-gray-500 flex items-center">
                                                        <Calendar size={14} className="mr-1" />
                                                        {formatDateTime(feedback.appointmentDate)}
                                                    </span>
                                                )}
                                            </div>
                                            
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

export default DoctorFeedback;
