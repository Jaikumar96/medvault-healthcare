import React, { useState, useEffect } from 'react';
import { 
    AlertTriangle, User, Clock, CheckCircle, XCircle, Loader2, Phone, 
    Calendar, FileText, Heart, Activity, Search, ChevronDown, ChevronUp,
    Filter, ArrowUp, ArrowDown, SortAsc, RefreshCw, Plus
} from 'lucide-react';

const EmergencyRequests = () => {
    const [emergencyRequests, setEmergencyRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [expandedCard, setExpandedCard] = useState(null);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Filter and search states
    const [urgencyFilter, setUrgencyFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('urgency');
    const [sortOrder, setSortOrder] = useState('desc');
    const [timeFilter, setTimeFilter] = useState('ALL');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch emergency requests
    const fetchEmergencyRequests = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/doctor/emergency-requests/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setEmergencyRequests(data);
            }
        } catch (error) {
            console.error('Error fetching emergency requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptEmergency = async (emergencyId, proposedTime) => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/doctor/accept-emergency/${user.id}/${emergencyId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposedTime: proposedTime || null
                })
            });

            const result = await response.json();
            if (response.ok) {
                setSuccessMessage('Emergency request accepted successfully!');
                fetchEmergencyRequests();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(result.error || 'Failed to accept emergency request');
                setTimeout(() => setErrorMessage(''), 5000);
            }
        } catch (error) {
            console.error('Error accepting emergency:', error);
            setErrorMessage('Network error. Please try again.');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmergencyRequests();
        const interval = autoRefresh ? setInterval(fetchEmergencyRequests, 30000) : null;
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    // Filter and search logic
    useEffect(() => {
        let filtered = [...emergencyRequests];

        if (searchTerm) {
            filtered = filtered.filter(req => 
                req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.contactNumber.includes(searchTerm)
            );
        }

        if (urgencyFilter !== 'ALL') {
            filtered = filtered.filter(req => req.urgencyLevel === urgencyFilter);
        }

        if (timeFilter !== 'ALL') {
            const now = new Date();
            const filterTime = {
                'LAST_HOUR': 1 * 60 * 60 * 1000,
                'LAST_6_HOURS': 6 * 60 * 60 * 1000,
                'TODAY': 24 * 60 * 60 * 1000,
                'LAST_3_DAYS': 3 * 24 * 60 * 60 * 1000
            };
            
            if (filterTime[timeFilter]) {
                filtered = filtered.filter(req => 
                    (now - new Date(req.createdAt)) <= filterTime[timeFilter]
                );
            }
        }

        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'urgency':
                    const urgencyOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                    comparison = urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
                    break;
                case 'time':
                    comparison = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
                case 'name':
                    comparison = a.patientName.localeCompare(b.patientName);
                    break;
                default:
                    comparison = 0;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredRequests(filtered);
        setCurrentPage(1);
    }, [emergencyRequests, searchTerm, urgencyFilter, timeFilter, sortBy, sortOrder]);

    const formatDateTime = (dateTime) => new Date(dateTime).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const getTimeAgo = (dateTime) => {
        const now = new Date();
        const then = new Date(dateTime);
        const diffInMinutes = Math.floor((now - then) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const parseSymptoms = (symptomsText) => {
        if (!symptomsText) return { main: '', notes: '' };
        const parts = symptomsText.split('|');
        const main = parts[0]?.trim() || '';
        const notes = parts.slice(1).join('|').trim();
        return { main, notes };
    };

    const getUrgencyConfig = (level) => {
        switch (level) {
            case 'HIGH':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-800',
                    badge: 'bg-red-500',
                    icon: 'text-red-600',
                    pulse: 'animate-pulse',
                    borderLeft: 'border-l-red-500'
                };
            case 'MEDIUM':
                return {
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    text: 'text-amber-800',
                    badge: 'bg-amber-500',
                    icon: 'text-amber-600',
                    pulse: '',
                    borderLeft: 'border-l-amber-500'
                };
            case 'LOW':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-800',
                    badge: 'bg-blue-500',
                    icon: 'text-blue-600',
                    pulse: '',
                    borderLeft: 'border-l-blue-500'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-800',
                    badge: 'bg-gray-500',
                    icon: 'text-gray-600',
                    pulse: '',
                    borderLeft: 'border-l-gray-500'
                };
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRequests = filteredRequests.slice(startIndex, endIndex);

    // Quick stats
    const urgencyStats = emergencyRequests.reduce((acc, req) => {
        acc[req.urgencyLevel] = (acc[req.urgencyLevel] || 0) + 1;
        return acc;
    }, {});

    // Emergency Card Component
    const EmergencyCard = ({ emergency }) => {
        const [proposedTime, setProposedTime] = useState('');
        const [accepting, setAccepting] = useState(false);
        const urgencyConfig = getUrgencyConfig(emergency.urgencyLevel);
        const { main: mainSymptoms, notes: symptomNotes } = parseSymptoms(emergency.symptoms);
        const isExpanded = expandedCard === emergency.id;

        const handleAccept = async () => {
            setAccepting(true);
            await handleAcceptEmergency(emergency.id, proposedTime);
            setAccepting(false);
        };

        return (
            <div className={`bg-white border-l-4 ${urgencyConfig.borderLeft} rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 ${urgencyConfig.bg} rounded-full flex items-center justify-center ${urgencyConfig.pulse} flex-shrink-0`}>
                                <Heart size={20} className={urgencyConfig.icon} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-xl font-bold text-gray-900 truncate">{emergency.patientName}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                    <div className="flex items-center">
                                        <Clock size={14} className="mr-1" />
                                        <span>{getTimeAgo(emergency.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar size={14} className="mr-1" />
                                        <span>{formatDateTime(emergency.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${urgencyConfig.badge} text-white shadow-sm`}>
                                <AlertTriangle size={12} className="mr-1" />
                                {emergency.urgencyLevel} PRIORITY
                            </span>
                            <button
                                onClick={() => setExpandedCard(isExpanded ? null : emergency.id)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Primary Symptoms - Always Visible */}
                    <div className={`${urgencyConfig.bg} rounded-lg p-4 border ${urgencyConfig.border} mb-4`}>
                        <div className="flex items-start space-x-3">
                            <Activity size={18} className={`${urgencyConfig.icon} mt-0.5 flex-shrink-0`} />
                            <div className="flex-1">
                                <h4 className={`font-semibold ${urgencyConfig.text} mb-2`}>Emergency Symptoms</h4>
                                <p className={`${urgencyConfig.text} leading-relaxed`}>{mainSymptoms}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information - Always Visible */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-3 text-gray-700">
                            <Phone size={18} className="text-gray-500" />
                            <span className="font-medium text-lg">{emergency.contactNumber}</span>
                        </div>
                        <a 
                            href={`tel:${emergency.contactNumber}`}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                        >
                            <Phone size={16} className="mr-2" />
                            Call Now
                        </a>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                        <div className="space-y-4 border-t border-gray-200 pt-6 mb-6">
                            {symptomNotes && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-start space-x-3">
                                        <FileText size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Additional Notes</h4>
                                            <p className="text-gray-700 leading-relaxed">{symptomNotes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {emergency.patientNotes && (
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-start space-x-3">
                                        <User size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-blue-900 mb-2">Patient's Message</h4>
                                            <p className="text-blue-800 leading-relaxed">{emergency.patientNotes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Section */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar size={18} className="mr-2 text-blue-600" />
                            Schedule Emergency Consultation
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proposed Appointment Time (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={proposedTime}
                                    onChange={(e) => setProposedTime(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Leave empty to contact patient directly for scheduling
                                </p>
                            </div>

                            <button
                                onClick={handleAccept}
                                disabled={accepting || loading}
                                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                                    urgencyConfig.badge === 'bg-red-500' 
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {accepting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Accepting Emergency...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        <span>Accept & Respond to Emergency</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                        <div className="mb-4 lg:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Requests</h1>
                            <p className="text-gray-600 text-lg">Manage urgent patient requests requiring immediate attention</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                    autoRefresh 
                                        ? 'bg-green-50 border-green-200 text-green-700' 
                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                                <span className="font-medium">Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
                            </button>
                            <button
                                onClick={fetchEmergencyRequests}
                                disabled={loading}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                <span className="font-medium">Refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <AlertTriangle size={24} className="text-red-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-red-600">{urgencyStats.HIGH || 0}</div>
                                    <div className="text-sm font-medium text-red-700">High Priority</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Clock size={24} className="text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-amber-600">{urgencyStats.MEDIUM || 0}</div>
                                    <div className="text-sm font-medium text-amber-700">Medium Priority</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Activity size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-blue-600">{urgencyStats.LOW || 0}</div>
                                    <div className="text-sm font-medium text-blue-700">Low Priority</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <Heart size={24} className="text-gray-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-gray-600">{emergencyRequests.length}</div>
                                    <div className="text-sm font-medium text-gray-700">Total Active</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col xl:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by patient name, symptoms, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <select
                                    value={urgencyFilter}
                                    onChange={(e) => setUrgencyFilter(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                >
                                    <option value="ALL">All Urgency</option>
                                    <option value="HIGH">High Priority</option>
                                    <option value="MEDIUM">Medium Priority</option>
                                    <option value="LOW">Low Priority</option>
                                </select>
                                <select
                                    value={timeFilter}
                                    onChange={(e) => setTimeFilter(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                >
                                    <option value="ALL">All Time</option>
                                    <option value="LAST_HOUR">Last Hour</option>
                                    <option value="LAST_6_HOURS">Last 6 Hours</option>
                                    <option value="TODAY">Today</option>
                                    <option value="LAST_3_DAYS">Last 3 Days</option>
                                </select>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                >
                                    <option value={10}>10 per page</option>
                                    <option value={25}>25 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {(errorMessage || successMessage) && (
                    <div className="mb-8">
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                                <XCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-red-800">{errorMessage}</p>
                            </div>
                        )}
                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                                <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-green-800">{successMessage}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Emergency Requests List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">Loading emergency requests...</p>
                        </div>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {emergencyRequests.length === 0 ? 'No Emergency Requests' : 'No Matching Emergencies'}
                        </h3>
                        <p className="text-gray-600 text-lg max-w-md mx-auto">
                            {emergencyRequests.length === 0 
                                ? 'All emergency requests have been handled successfully' 
                                : 'Try adjusting your filters to see more results'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6 mb-8">
                            {currentRequests.map(emergency => (
                                <EmergencyCard 
                                    key={emergency.id} 
                                    emergency={emergency}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
                                <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredRequests.length)}</span> of <span className="font-medium">{filteredRequests.length}</span> emergencies
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EmergencyRequests;
