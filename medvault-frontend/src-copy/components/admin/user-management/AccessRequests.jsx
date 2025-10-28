import React, { useState } from 'react';
import { 
  ClipboardList, CheckCircle, XCircle, User, Heart, Stethoscope, 
  Shield, Mail, Phone, Calendar, Award, MapPin, Clock, 
  AlertTriangle, Loader2, Eye, FileText, Users
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AccessRequests = ({ 
  pendingRequests, 
  setPendingRequests, 
  user, 
  onMessage,
  fetchUserStats 
}) => {
  const [loading, setLoading] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const approveAndRegisterUser = async (request) => {
    const result = await Swal.fire({
      title: 'Approve Registration',
      html: `
        <div class="text-left">
          <p class="mb-3">Are you sure you want to approve and register:</p>
          <div class="bg-blue-50 p-3 rounded-lg mb-3">
            <p class="font-semibold text-blue-900">${request.firstName} ${request.lastName}</p>
            <p class="text-sm text-blue-700">${request.email}</p>
            <p class="text-sm text-blue-700">Role: ${request.requestedRole}</p>
          </div>
          <p class="text-sm text-gray-600">This will create their account and send login credentials via email.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Approve & Register',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'text-left'
      }
    });

    if (!result.isConfirmed) return;

    setLoading(request.id);
    try {
      // Create registration data from access request
      const registrationData = {
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        phone: request.phone,
        role: request.requestedRole,
        specialization: request.specialization || '',
        qualification: request.qualification || '',
        experienceYears: request.experienceYears || '',
        dateOfBirth: request.dateOfBirth || '',
        gender: request.gender || 'MALE',
        address: request.address || '',
        emergencyContact: request.emergencyContact || ''
      };

      // Register the user
      await axios.post('http://localhost:8080/api/auth/register', registrationData);
      
      // Approve the request
      await axios.post(`http://localhost:8080/api/access-requests/${request.id}/approve`, null, {
        params: { reviewerId: user.id }
      });

      // Success alert
      await Swal.fire({
        title: '🎉 Success!',
        html: `
          <div class="text-center">
            <p class="mb-2">User <strong>${request.firstName} ${request.lastName}</strong> has been approved and registered successfully!</p>
            <p class="text-sm text-gray-600">Login credentials have been sent to <strong>${request.email}</strong></p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Great!',
        timer: 5000,
        timerProgressBar: true
      });

      onMessage(`User ${request.firstName} ${request.lastName} has been approved and registered successfully! Login credentials have been sent to ${request.email}.`);
      setPendingRequests(prev => prev.filter(req => req.id !== request.id));
      fetchUserStats();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      
      // Error alert
      await Swal.fire({
        title: 'Error',
        text: `Failed to approve and register user: ${errorMessage}`,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });

      onMessage(`Failed to approve and register user: ${errorMessage}`);
    } finally {
      setLoading(null);
    }
  };

  const rejectRequest = async (id, name) => {
    const result = await Swal.fire({
      title: '❌ Reject Access Request',
      html: `
        <div class="text-left">
          <p class="mb-3">Are you sure you want to reject the access request from:</p>
          <div class="bg-red-50 p-3 rounded-lg mb-4">
            <p class="font-semibold text-red-900">${name}</p>
          </div>
          <p class="text-sm text-gray-600 mb-3">Please provide a reason for rejection (this will be sent to the applicant):</p>
        </div>
      `,
      input: 'textarea',
      inputPlaceholder: 'Enter reason for rejection...',
      inputAttributes: {
        'aria-label': 'Rejection reason',
        'class': 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
        'rows': 4
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Reject Request',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Please provide a reason for rejection';
        }
      },
      customClass: {
        popup: 'text-left'
      }
    });

    if (!result.isConfirmed || !result.value) return;

    setLoading(id);
    try {
      await axios.post(`http://localhost:8080/api/access-requests/${id}/reject`, 
        { reason: result.value.trim() },
        { params: { reviewerId: user.id } }
      );

      // Success alert
      await Swal.fire({
        title: '✅ Request Rejected',
        html: `
          <div class="text-center">
            <p class="mb-2">Access request from <strong>${name}</strong> has been rejected successfully.</p>
            <p class="text-sm text-gray-600">The applicant has been notified via email.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Done',
        timer: 3000,
        timerProgressBar: true
      });

      onMessage(`Access request from ${name} has been rejected successfully.`);
      setPendingRequests(prev => prev.filter(request => request.id !== id));
    } catch (error) {
      // Error alert
      await Swal.fire({
        title: 'Error',
        text: 'Failed to reject request. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });

      onMessage('Failed to reject request. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'DOCTOR':
        return <Stethoscope size={16} className="text-blue-600" />;
      case 'PATIENT':
        return <Heart size={16} className="text-red-500" />;
      case 'ADMIN':
        return <Shield size={16} className="text-purple-600" />;
      default:
        return <User size={16} className="text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'DOCTOR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PATIENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRequests = pendingRequests.filter(request => 
    filter === 'ALL' || request.requestedRole === filter
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <ClipboardList size={32} className="mr-3 text-orange-600" />
                  Access Requests Management
                </h1>
                <p className="text-gray-600 mt-2">Review and process new user registration requests</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{pendingRequests.length}</div>
                <div className="text-sm text-gray-500">Pending Requests</div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {['ALL', 'DOCTOR', 'PATIENT', 'ADMIN'].map((roleFilter) => {
                const count = roleFilter === 'ALL' 
                  ? pendingRequests.length 
                  : pendingRequests.filter(r => r.requestedRole === roleFilter).length;
                
                return (
                  <button
                    key={roleFilter}
                    onClick={() => setFilter(roleFilter)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      filter === roleFilter
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {roleFilter !== 'ALL' && getRoleIcon(roleFilter)}
                    <span>{roleFilter}</span>
                    {count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        filter === roleFilter ? 'bg-white text-orange-600' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Results Summary */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredRequests.length}</span> of <span className="font-semibold">{pendingRequests.length}</span> requests
              </p>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'ALL' ? 'No Pending Requests' : `No ${filter.toLowerCase()} requests`}
            </h3>
            <p className="text-gray-600">
              {filter === 'ALL' 
                ? 'All access requests have been processed.' 
                : `No pending ${filter.toLowerCase()} access requests at this time.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                {/* Request Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        {getRoleIcon(request.requestedRole)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {request.firstName} {request.lastName}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-lg border ${getRoleColor(request.requestedRole)}`}>
                            {getRoleIcon(request.requestedRole)}
                            <span className="ml-1">{request.requestedRole}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock size={14} className="mr-1" />
                            Applied {new Date(request.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-600">{request.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="text-gray-600">{request.phone}</span>
                    </div>
                    
                    {request.specialization && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Stethoscope size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-700">Specialization:</span>
                        <span className="text-gray-600">{request.specialization}</span>
                      </div>
                    )}
                    
                    {request.qualification && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Award size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-700">Qualification:</span>
                        <span className="text-gray-600">{request.qualification}</span>
                      </div>
                    )}
                    
                    {request.experienceYears && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-700">Experience:</span>
                        <span className="text-gray-600">{request.experienceYears} years</span>
                      </div>
                    )}

                    {request.address && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-700">Location:</span>
                        <span className="text-gray-600">{request.address.substring(0, 30)}...</span>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {selectedRequest === request.id && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <FileText size={16} className="mr-2" />
                        Additional Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {request.dateOfBirth && (
                          <div>
                            <span className="font-medium text-gray-700">Date of Birth:</span>
                            <span className="ml-2 text-gray-600">{new Date(request.dateOfBirth).toLocaleDateString('en-IN')}</span>
                          </div>
                        )}
                        {request.gender && (
                          <div>
                            <span className="font-medium text-gray-700">Gender:</span>
                            <span className="ml-2 text-gray-600">{request.gender}</span>
                          </div>
                        )}
                        {request.emergencyContact && (
                          <div>
                            <span className="font-medium text-gray-700">Emergency Contact:</span>
                            <span className="ml-2 text-gray-600">{request.emergencyContact}</span>
                          </div>
                        )}
                        {request.address && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Full Address:</span>
                            <span className="ml-2 text-gray-600">{request.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Personal Message */}
                  {request.message && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <FileText size={16} className="mr-2 text-gray-600" />
                        Personal Message
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{request.message}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => approveAndRegisterUser(request)}
                      disabled={loading === request.id}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                      {loading === request.id ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          <span>Approve & Register</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => rejectRequest(request.id, `${request.firstName} ${request.lastName}`)}
                      disabled={loading === request.id}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                      <XCircle size={18} />
                      <span>Reject Request</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessRequests;
