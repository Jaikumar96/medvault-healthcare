import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, User, Award, Calendar, Phone, Mail, Download, FileText, AlertCircle } from 'lucide-react';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filter, setFilter] = useState('PENDING');
    const [viewingDocument, setViewingDocument] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

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
                console.error('Failed to fetch doctors:', response.status);
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
                    filename: `${documentType}_${doctorId}`
                });
            } else {
                console.error('Failed to load document:', response.status);
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

    const filteredDoctors = doctors.filter(doctor =>
        filter === 'ALL' || doctor.status === filter
    );

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

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading doctors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg">
                <div className="border-b border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor Verification</h1>
                    <p className="text-gray-600 mb-4">Review and verify doctor registrations</p>

                    {/* Filter Tabs */}
                    <div className="flex space-x-4">
                        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === status
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                    }`}
                            >
                                {status} ({status === 'ALL' ? doctors.length : doctors.filter(d => d.status === status).length})
                            </button>
                        ))}
                    </div>
                </div>

                {message.text && (
                    <div className={`m-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        <div className="flex items-center justify-between">
                            <span>{message.text}</span>
                            <button onClick={() => setMessage({ type: '', text: '' })} className="text-current">✕</button>
                        </div>
                    </div>
                )}

                <div className="p-6">
                    {filteredDoctors.length === 0 ? (
                        <div className="text-center py-12">
                            <User size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No {filter.toLowerCase()} doctors found
                            </h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredDoctors.map((doctor) => (
                                <div key={doctor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                Dr. {doctor.firstName} {doctor.lastName}
                                            </h3>
                                            <p className="text-blue-600 text-sm">{doctor.specialization}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(doctor.status)}`}>
                                            {doctor.status}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center">
                                            <Award size={14} className="mr-2" />
                                            <span>{doctor.yearsOfExperience || 0} years experience</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone size={14} className="mr-2" />
                                            <span>{doctor.contactNumber}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Mail size={14} className="mr-2" />
                                            <span>{doctor.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar size={14} className="mr-2" />
                                            <span>Registered: {new Date(doctor.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setSelectedDoctor(doctor)}
                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                                        >
                                            <Eye size={14} className="mr-1" />
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Doctor Details Modal */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                        <div className="border-b border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Doctor Verification - Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                                </h2>
                                <button
                                    onClick={() => setSelectedDoctor(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                                        <p className="text-gray-900">{selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Gender</label>
                                        <p className="text-gray-900">{selectedDoctor.gender || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                                        <p className="text-gray-900">
                                            {selectedDoctor.dateOfBirth ? new Date(selectedDoctor.dateOfBirth).toLocaleDateString() : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Contact Number</label>
                                        <p className="text-gray-900">{selectedDoctor.contactNumber}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Email</label>
                                        <p className="text-gray-900">{selectedDoctor.email}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Address</label>
                                        <p className="text-gray-900">{selectedDoctor.address || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Specialization</label>
                                        <p className="text-gray-900">{selectedDoctor.specialization}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                                        <p className="text-gray-900">{selectedDoctor.yearsOfExperience || 0} years</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Medical License Number</label>
                                        <p className="text-gray-900">{selectedDoctor.medicalLicenseNumber || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Consultation Fees</label>
                                        <p className="text-gray-900">₹{selectedDoctor.consultationFees || 'Not specified'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Languages Spoken</label>
                                        <p className="text-gray-900">{selectedDoctor.languagesSpoken || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            {/* Documents Section - only show if documents are uploaded */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>

                                {selectedDoctor.documentsUploaded ? (
                                    <div className="space-y-3">
                                        {selectedDoctor.medicalDegreeCertificate && (
                                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                                                <div className="flex items-center">
                                                    <FileText size={16} className="text-blue-600 mr-2" />
                                                    <span className="text-sm font-medium">Medical Degree Certificate</span>
                                                </div>
                                                <button
                                                    onClick={() => viewDocument(selectedDoctor.id, 'medicalDegree')}
                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center px-3 py-1 border border-blue-200 rounded hover:bg-blue-100"
                                                >
                                                    <Eye size={14} className="mr-1" />
                                                    View
                                                </button>
                                            </div>
                                        )}

                                        {selectedDoctor.medicalLicenseNumber && (
                                            <div className="bg-gray-50 p-3 rounded">
                                                <div className="flex items-center">
                                                    <FileText size={16} className="text-gray-600 mr-2" />
                                                    <div>
                                                        <span className="text-sm font-medium">Medical License Number</span>
                                                        <p className="text-sm text-gray-800">{selectedDoctor.medicalLicenseNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedDoctor.governmentIdPath && (
                                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                                                <div className="flex items-center">
                                                    <FileText size={16} className="text-blue-600 mr-2" />
                                                    <span className="text-sm font-medium">Government ID Proof</span>
                                                </div>
                                                <button
                                                    onClick={() => viewDocument(selectedDoctor.id, 'governmentId')}
                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center px-3 py-1 border border-blue-200 rounded hover:bg-blue-100"
                                                >
                                                    <Eye size={14} className="mr-1" />
                                                    View
                                                </button>
                                            </div>
                                        )}

                                        {selectedDoctor.clinicAffiliationPath && (
                                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                                                <div className="flex items-center">
                                                    <FileText size={16} className="text-blue-600 mr-2" />
                                                    <span className="text-sm font-medium">Clinic Affiliation Proof</span>
                                                </div>
                                                <button
                                                    onClick={() => viewDocument(selectedDoctor.id, 'clinicAffiliation')}
                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center px-3 py-1 border border-blue-200 rounded hover:bg-blue-100"
                                                >
                                                    <Eye size={14} className="mr-1" />
                                                    View
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <AlertCircle size={32} className="mx-auto text-yellow-500 mb-3" />
                                        <p className="text-sm text-gray-600">No documents uploaded yet</p>
                                        <p className="text-xs text-gray-500 mt-1">Doctor needs to complete profile and upload documents</p>
                                    </div>
                                )}
                            </div>


                            {/* Admin Notes (if rejected) */}
                            {selectedDoctor.status === 'REJECTED' && selectedDoctor.adminNotes && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                                    <div className="bg-red-50 p-4 rounded">
                                        <p className="text-red-800">{selectedDoctor.adminNotes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedDoctor.status === 'PENDING' && (
                                <div className="flex space-x-4 pt-4 border-t">
                                    <button
                                        onClick={() => handleDoctorAction(selectedDoctor.id, 'approve')}
                                        disabled={actionLoading}
                                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                                    >
                                        <CheckCircle size={16} className="mr-2" />
                                        {actionLoading ? 'Processing...' : 'Approve Doctor'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const notes = prompt('Please provide a reason for rejection:');
                                            if (notes && notes.trim()) {
                                                handleDoctorAction(selectedDoctor.id, 'reject', notes);
                                            }
                                        }}
                                        disabled={actionLoading}
                                        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                                    >
                                        <XCircle size={16} className="mr-2" />
                                        Reject Doctor
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {viewingDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] w-full flex flex-col">
                        <div className="border-b border-gray-200 p-4 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Document Preview - {viewingDocument.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => downloadDocument(viewingDocument.url, viewingDocument.filename)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center text-sm"
                                    >
                                        <Download size={16} className="mr-2" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.URL.revokeObjectURL(viewingDocument.url);
                                            setViewingDocument(null);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 text-xl px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden p-4">
                            <iframe
                                src={viewingDocument.url}
                                className="w-full h-full border rounded"
                                title="Document Preview"
                                onError={() => {
                                    setMessage({ type: 'error', text: 'Unable to preview this document. Please download to view.' });
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorManagement;
