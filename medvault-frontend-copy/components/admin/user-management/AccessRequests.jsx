import React from 'react';
import { ClipboardDocumentListIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const AccessRequests = ({ 
  pendingRequests, 
  setPendingRequests, 
  user, 
  onMessage,
  fetchUserStats 
}) => {
  const approveAndRegisterUser = async (request) => {
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

      onMessage(`User ${request.firstName} ${request.lastName} registered successfully! Credentials sent via email.`);
      setPendingRequests(prev => prev.filter(req => req.id !== request.id));
      fetchUserStats();
    } catch (error) {
      onMessage('Failed to register and approve user: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/access-requests/${id}/reject`, null, {
        params: { reviewerId: user.id }
      });
      onMessage('Request rejected successfully!');
      setPendingRequests(prev => prev.filter(request => request.id !== id));
    } catch (error) {
      onMessage('Failed to reject request.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Access Requests</h2>
        <div className="flex space-x-2">
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingRequests.length} Pending
          </span>
        </div>
      </div>
      
      {pendingRequests.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {pendingRequests.map((request, index) => (
            <div
              key={request.id}
              className={`p-6 ${index !== pendingRequests.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.firstName} {request.lastName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        request.requestedRole === 'DOCTOR'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {request.requestedRole}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div><strong>Email:</strong> {request.email}</div>
                    <div><strong>Phone:</strong> {request.phone}</div>
                    {request.specialization && (
                      <div><strong>Specialization:</strong> {request.specialization}</div>
                    )}
                    {request.qualification && (
                      <div><strong>Qualification:</strong> {request.qualification}</div>
                    )}
                    {request.experienceYears && (
                      <div><strong>Experience:</strong> {request.experienceYears} years</div>
                    )}
                    <div><strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}</div>
                  </div>
                  
                  {request.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700"><strong>Message:</strong> {request.message}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-3 ml-6">
                  <button
                    onClick={() => approveAndRegisterUser(request)}
                    className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium shadow-sm hover:shadow-md"
                  >
                    Approve & Register
                  </button>
                  <button
                    onClick={() => rejectRequest(request.id)}
                    className="bg-rose-500 text-white px-6 py-3 rounded-xl hover:bg-rose-600 transition-colors font-medium shadow-sm hover:shadow-md"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">All access requests have been processed.</p>
        </div>
      )}
    </div>
  );
};

export default AccessRequests;
