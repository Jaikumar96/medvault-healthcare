import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Eye, User, Award, Calendar, Phone, Mail, Download, 
  FileText, AlertCircle, Search, Filter, Users, Building, ChevronDown, 
  ChevronUp, X, ZoomIn, ZoomOut, RotateCw, Maximize, ChevronLeft, ChevronRight
} from 'lucide-react';

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  totalItems, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        {/* Items per page selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={15}>15</option>
            <option value={24}>24</option>
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>

        {/* Page info */}
        <div className="text-sm text-gray-700">
          Showing <span className="font-semibold">{startItem}</span> to{' '}
          <span className="font-semibold">{endItem}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> results
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {getVisiblePages().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-2 text-sm text-gray-400">...</span>
                  ) : (
                    <button
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Document Preview Modal with fullscreen capabilities
const DocumentPreviewModal = ({ viewingDocument, onClose, onDownload }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!viewingDocument) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen 
          ? 'w-full h-full rounded-none' 
          : 'w-11/12 h-5/6 max-w-6xl'
      }`}>
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex-shrink-0 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {viewingDocument.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              <p className="text-sm text-gray-600">Document Preview</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                <Maximize size={18} />
              </button>
              
              <button
                onClick={() => onDownload(viewingDocument.url, viewingDocument.filename)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
          <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
            <iframe
              src={`${viewingDocument.url}#view=FitH&toolbar=1&navpanes=1`}
              className="w-full h-full border-none"
              title="Document Preview"
              style={{ minHeight: '600px' }}
              onError={() => {
                console.error('Failed to load document in iframe');
              }}
            />
          </div>
        </div>

        {/* Footer with document info */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex-shrink-0 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>File: {viewingDocument.filename}</span>
            <div className="flex items-center space-x-4">
              <span>Use Ctrl+Mouse Wheel to zoom</span>
              <span>•</span>
              <span>Right-click to save or print</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState('PENDING');
    const [viewingDocument, setViewingDocument] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);

    useEffect(() => {
        fetchDoctors();
    }, []);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm, sortBy]);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/admin/doctors', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const doctorsData = await response.json();
                setDoctors(doctorsData);
                console.log('Doctors loaded:', doctorsData);
            } else {
                setMessage({ type: 'error', text: 'Failed to load doctors' });
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setMessage({ type: 'error', text: 'Error loading doctors' });
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorAction = async (doctorId, action, notes = '') => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/doctors/${doctorId}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({ notes })
            });

            const result = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: result.message });
                fetchDoctors();
                setSelectedDoctor(null);
            } else {
                setMessage({ type: 'error', text: result.error || 'Action failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error processing doctor verification' });
        } finally {
            setActionLoading(false);
        }
    };

    const viewDocument = async (doctorId, documentType) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/admin/doctors/${doctorId}/document/${documentType}`, {
                method: 'GET',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                setViewingDocument({
                    url,
                    type: documentType,
                    blob,
                    filename: `${documentType}_doctor_${doctorId}.pdf`
                });
            } else {
                setMessage({ type: 'error', text: 'Failed to load document' });
            }
        } catch (error) {
            console.error('Error viewing document:', error);
            setMessage({ type: 'error', text: 'Error loading document' });
        }
    };

    const downloadDocument = (url, filename) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const closeDocumentViewer = () => {
        if (viewingDocument) {
            window.URL.revokeObjectURL(viewingDocument.url);
            setViewingDocument(null);
        }
    };

    // Enhanced filtering and sorting with pagination
    const filteredAndSortedDoctors = doctors
        .filter(doctor => {
            const matchesFilter = filter === 'ALL' || doctor.status === filter;
            const matchesSearch = searchTerm === '' || 
                doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case 'specialization':
                    return a.specialization?.localeCompare(b.specialization || '') || 0;
                case 'createdAt':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

    // Pagination logic
    const totalItems = filteredAndSortedDoctors.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageDoctors = filteredAndSortedDoctors.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top of results
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'APPROVED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'INACTIVE':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <AlertCircle size={14} className="text-yellow-600" />;
            case 'APPROVED':
                return <CheckCircle size={14} className="text-green-600" />;
            case 'REJECTED':
                return <XCircle size={14} className="text-red-600" />;
            default:
                return <User size={14} className="text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading doctor verifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Enhanced Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                    <Users size={32} className="mr-3 text-blue-600" />
                                    Doctor Verification Center
                                </h1>
                                <p className="text-gray-600 mt-2">Review and manage doctor registrations and credentials</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{doctors.length}</div>
                                <div className="text-sm text-gray-500">Total Doctors</div>
                            </div>
                        </div>

                        {/* Search and Sort */}
                        <div className="flex flex-col lg:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search doctors by name, email, or specialization..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="createdAt">Sort by Date</option>
                                <option value="name">Sort by Name</option>
                                <option value="specialization">Sort by Specialization</option>
                            </select>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => {
                                const count = status === 'ALL' ? doctors.length : doctors.filter(d => d.status === status).length;
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                            filter === status
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {getStatusIcon(status)}
                                        <span>{status}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                            filter === status ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message Display */}
                    {message.text && (
                        <div className={`mx-6 mt-4 p-4 rounded-lg ${
                            message.type === 'success' 
                                ? 'bg-green-50 border border-green-200 text-green-800' 
                                : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {message.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <XCircle size={20} className="mr-2" />}
                                    <span>{message.text}</span>
                                </div>
                                <button 
                                    onClick={() => setMessage({ type: '', text: '' })} 
                                    className="text-current hover:opacity-70"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Summary */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{totalItems}</span> of <span className="font-semibold">{doctors.length}</span> doctors
                                {searchTerm && <span> matching "{searchTerm}"</span>}
                            </p>
                            {totalPages > 1 && (
                                <p className="text-sm text-gray-600">
                                    Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Doctor Cards */}
                {currentPageDoctors.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No {filter.toLowerCase()} doctors found
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new registrations.'}
                        </p>
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                            {currentPageDoctors.map((doctor) => (
                                <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                                    {/* Card Header */}
                                    <div className="p-6 pb-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User size={20} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">
                                                        Dr. {doctor.firstName} {doctor.lastName}
                                                    </h3>
                                                    <p className="text-blue-600 font-semibold text-sm">{doctor.specialization}</p>
                                                </div>
                                            </div>
                                            <div className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(doctor.status)}`}>
                                                {getStatusIcon(doctor.status)}
                                                <span className="ml-1">{doctor.status}</span>
                                            </div>
                                        </div>

                                        {/* Doctor Details */}
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Award size={14} className="mr-2 text-gray-400" />
                                                <span>{doctor.yearsOfExperience || 0} years experience</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Phone size={14} className="mr-2 text-gray-400" />
                                                <span>{doctor.contactNumber}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Mail size={14} className="mr-2 text-gray-400" />
                                                <span className="truncate">{doctor.email}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar size={14} className="mr-2 text-gray-400" />
                                                <span>Applied: {new Date(doctor.createdAt).toLocaleDateString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <button
                                            onClick={() => setSelectedDoctor(doctor)}
                                            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center font-medium transition-colors"
                                        >
                                            <Eye size={16} className="mr-2" />
                                            Review Application
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Component */}
                        {totalPages > 1 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    itemsPerPage={itemsPerPage}
                                    totalItems={totalItems}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Doctor Details Modal */}
                {selectedDoctor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
                        <div className="bg-white rounded-2xl max-w-5xl max-h-[90vh] overflow-y-auto w-full shadow-2xl">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Doctor Verification Review
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            Dr. {selectedDoctor.firstName} {selectedDoctor.lastName} • {selectedDoctor.specialization}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDoctor(null)}
                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <User size={20} className="mr-2 text-blue-600" />
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                            <p className="text-gray-900 mt-1">{selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Gender</label>
                                            <p className="text-gray-900 mt-1">{selectedDoctor.gender || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
                                            <p className="text-gray-900 mt-1">
                                                {selectedDoctor.dateOfBirth ? new Date(selectedDoctor.dateOfBirth).toLocaleDateString('en-IN') : 'Not specified'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                                            <p className="text-gray-900 mt-1">{selectedDoctor.contactNumber}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Email</label>
                                            <p className="text-gray-900 mt-1">{selectedDoctor.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Address</label>
                                            <p className="text-gray-900 mt-1">{selectedDoctor.address || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <Building size={20} className="mr-2 text-blue-600" />
                                        Professional Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Specialization</label>
                                            <p className="text-gray-900 mt-1">{selectedDoctor.specialization}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Years of Experience</label>
                                            <p className="text-gray-900 mt-1">{selectedDoctor.yearsOfExperience || 0} years</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Medical License Number</label>
                                            <p className="text-gray-900 mt-1">{selectedDoctor.medicalLicenseNumber || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Consultation Fees</label>
                                            <p className="text-gray-900 mt-1">₹{selectedDoctor.consultationFees || 'Not specified'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-semibold text-gray-700">Languages Spoken</label>
                                            <p className="text-gray-900 mt-1">{selectedDoctor.languagesSpoken || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <FileText size={20} className="mr-2 text-blue-600" />
                                        Verification Documents
                                    </h3>

                                    {selectedDoctor.documentsUploaded ? (
                                        <div className="space-y-3">
                                            {selectedDoctor.medicalDegreeCertificate && (
                                                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                    <div className="flex items-center">
                                                        <FileText size={20} className="text-blue-600 mr-3" />
                                                        <div>
                                                            <span className="font-semibold text-gray-900">Medical Degree Certificate</span>
                                                            <p className="text-sm text-gray-600">Professional qualification document</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => viewDocument(selectedDoctor.id, 'medicalDegree')}
                                                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 bg-white px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                        <span>View Document</span>
                                                    </button>
                                                </div>
                                            )}

                                            {selectedDoctor.governmentIdPath && (
                                                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                    <div className="flex items-center">
                                                        <FileText size={20} className="text-blue-600 mr-3" />
                                                        <div>
                                                            <span className="font-semibold text-gray-900">Government ID Proof</span>
                                                            <p className="text-sm text-gray-600">Identity verification document</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => viewDocument(selectedDoctor.id, 'governmentId')}
                                                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 bg-white px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                        <span>View Document</span>
                                                    </button>
                                                </div>
                                            )}

                                            {selectedDoctor.clinicAffiliationPath && (
                                                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                    <div className="flex items-center">
                                                        <FileText size={20} className="text-blue-600 mr-3" />
                                                        <div>
                                                            <span className="font-semibold text-gray-900">Clinic Affiliation Proof</span>
                                                            <p className="text-sm text-gray-600">Professional association document</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => viewDocument(selectedDoctor.id, 'clinicAffiliation')}
                                                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 bg-white px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                        <span>View Document</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
                                            <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
                                            <h4 className="font-semibold text-gray-900 mb-2">Documents Not Uploaded</h4>
                                            <p className="text-gray-600">Doctor needs to complete profile and upload verification documents</p>
                                        </div>
                                    )}
                                </div>

                                {/* Admin Notes (if rejected) */}
                                {selectedDoctor.status === 'REJECTED' && selectedDoctor.adminNotes && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                            <XCircle size={20} className="mr-2 text-red-600" />
                                            Rejection Reason
                                        </h3>
                                        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                                            <p className="text-red-800">{selectedDoctor.adminNotes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {selectedDoctor.status === 'PENDING' && (
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => handleDoctorAction(selectedDoctor.id, 'approve')}
                                            disabled={actionLoading}
                                            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center font-semibold transition-colors"
                                        >
                                            <CheckCircle size={20} className="mr-2" />
                                            {actionLoading ? 'Processing...' : 'Approve Doctor'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                const notes = prompt('Please provide a detailed reason for rejection:');
                                                if (notes && notes.trim()) {
                                                    handleDoctorAction(selectedDoctor.id, 'reject', notes);
                                                }
                                            }}
                                            disabled={actionLoading}
                                            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center font-semibold transition-colors"
                                        >
                                            <XCircle size={20} className="mr-2" />
                                            Reject Application
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Document Preview Modal */}
                <DocumentPreviewModal
                    viewingDocument={viewingDocument}
                    onClose={closeDocumentViewer}
                    onDownload={downloadDocument}
                />
            </div>
        </div>
    );
};

export default DoctorManagement;
