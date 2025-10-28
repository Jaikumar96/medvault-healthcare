// src/components/RequestAccess.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const RequestAccess = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('PATIENT');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Doctor fields
    specialization: '',
    qualification: '',
    experienceYears: '',
    // Patient fields
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    // Common
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setStep(1);
    setUserType('PATIENT');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: '',
      qualification: '',
      experienceYears: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      emergencyContact: '',
      message: ''
    });
    setLoading(false);
    setSuccess(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Validation function for each step
  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      const { firstName, lastName, email, phone } = formData;
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
        setError('Please fill in all required fields');
        return false;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return false;
      }
      
      // Phone validation (basic)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        setError('Please enter a valid phone number');
        return false;
      }
    }

    if (stepNumber === 2) {
      if (userType === 'DOCTOR') {
        const { specialization, qualification } = formData;
        if (!specialization.trim() || !qualification.trim()) {
          setError('Please fill in all required doctor fields');
          return false;
        }
        
        // Experience years validation
        if (formData.experienceYears && (formData.experienceYears < 0 || formData.experienceYears > 50)) {
          setError('Please enter valid years of experience (0-50)');
          return false;
        }
      }
      
      if (userType === 'PATIENT') {
        const { dateOfBirth, gender, address, emergencyContact } = formData;
        
        // Check mandatory fields for patients
        if (!dateOfBirth.trim() || !gender.trim() || !address.trim() || !emergencyContact.trim()) {
          setError('Please fill in all required patient fields (Date of Birth, Gender, Address, and Emergency Contact)');
          return false;
        }
        
        // Date of birth validation
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 0 || age > 120) {
          setError('Please enter a valid date of birth');
          return false;
        }
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (!validateStep(1) || !validateStep(2)) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Prepare payload based on user type and database schema
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        requestedRole: userType,
        message: formData.message.trim() || null,
        
        // Doctor specific fields
        ...(userType === 'DOCTOR' && {
          specialization: formData.specialization.trim(),
          qualification: formData.qualification.trim(),
          experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : null
        }),
        
        // Patient specific fields
        ...(userType === 'PATIENT' && {
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          address: formData.address.trim() || null,
          emergencyContact: formData.emergencyContact.trim() || null
        }),
        
        // Metadata
        submittedAt: new Date().toISOString(),
        status: 'PENDING'
      };

      console.log('Submitting request:', payload);
      
      // Submit to backend
      const response = await axios.post(
        'http://localhost:8080/api/access-requests/submit', 
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Request submitted successfully:', response.data);
      setSuccess(true);
      
    } catch (error) {
      console.error('Submission error:', error);
      
      if (error.response?.status === 409) {
        setError('An account with this email already exists.');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || 'Invalid data provided. Please check your inputs.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.response?.data?.message || 'Failed to submit request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Request Access to MedVault</h2>
              <p className="text-gray-600 mt-1">Join our healthcare platform</p>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-6">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-semibold text-sm ${
                step >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="font-medium">Basic Info</span>
            </div>
            <div className={`h-px flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-semibold text-sm ${
                step >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="font-medium">Details</span>
            </div>
            <div className={`h-px flex-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-semibold text-sm ${
                step >= 3 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
              }`}>
                3
              </div>
              <span className="font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Success State */}
          {success && (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully!</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Thank you for your interest in MedVault. We'll review your request and get back to you within 24-48 hours.
              </p>
              <button 
                onClick={handleClose}
                type="button"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          )}

          {/* Form Steps */}
          {!success && (
            <>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">I am a:</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setUserType('PATIENT')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          userType === 'PATIENT' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">👤</div>
                          <div className="font-semibold">Patient</div>
                          <div className="text-sm text-gray-500">Seeking medical care</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('DOCTOR')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          userType === 'DOCTOR' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">🩺</div>
                          <div className="font-semibold">Doctor</div>
                          <div className="text-sm text-gray-500">Healthcare provider</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your first name"
                        required
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your last name"
                        required
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your email"
                        required
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your phone number"
                        required
                        maxLength={20}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Additional Details */}
              {step === 2 && (
                <div className="space-y-6">
                  {userType === 'DOCTOR' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Specialization <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.specialization}
                          onChange={(e) => handleInputChange('specialization', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="e.g., Cardiology, Neurology"
                          required
                          maxLength={255}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Qualification <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.qualification}
                          onChange={(e) => handleInputChange('qualification', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="e.g., MBBS, MD, MS"
                          required
                          maxLength={255}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (Years)</label>
                        <input
                          type="number"
                          value={formData.experienceYears}
                          onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Years of experience"
                          min="0"
                          max="50"
                        />
                      </div>
                    </div>
                  )}

                  {userType === 'PATIENT' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter your full address"
                          maxLength={500}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Emergency Contact <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Emergency contact number"
                          maxLength={20}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Any additional information you'd like to share..."
                      maxLength={1000}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Review Your Information</h3>
                  
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Account Type:</span>
                        <p className="font-medium">{userType === 'DOCTOR' ? 'Doctor' : 'Patient'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Full Name:</span>
                        <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Email:</span>
                        <p className="font-medium">{formData.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Phone:</span>
                        <p className="font-medium">{formData.phone}</p>
                      </div>
                    </div>

                    {userType === 'DOCTOR' && (
                      <>
                        {formData.specialization && (
                          <div>
                            <span className="text-sm text-gray-500">Specialization:</span>
                            <p className="font-medium">{formData.specialization}</p>
                          </div>
                        )}
                        {formData.qualification && (
                          <div>
                            <span className="text-sm text-gray-500">Qualification:</span>
                            <p className="font-medium">{formData.qualification}</p>
                          </div>
                        )}
                        {formData.experienceYears && (
                          <div>
                            <span className="text-sm text-gray-500">Experience:</span>
                            <p className="font-medium">{formData.experienceYears} years</p>
                          </div>
                        )}
                      </>
                    )}

                    {userType === 'PATIENT' && (
                      <>
                        {formData.dateOfBirth && (
                          <div>
                            <span className="text-sm text-gray-500">Date of Birth:</span>
                            <p className="font-medium">{new Date(formData.dateOfBirth).toLocaleDateString()}</p>
                          </div>
                        )}
                        {formData.gender && (
                          <div>
                            <span className="text-sm text-gray-500">Gender:</span>
                            <p className="font-medium">{formData.gender}</p>
                          </div>
                        )}
                        {formData.address && (
                          <div>
                            <span className="text-sm text-gray-500">Address:</span>
                            <p className="font-medium">{formData.address}</p>
                          </div>
                        )}
                        {formData.emergencyContact && (
                          <div>
                            <span className="text-sm text-gray-500">Emergency Contact:</span>
                            <p className="font-medium">{formData.emergencyContact}</p>
                          </div>
                        )}
                      </>
                    )}

                    {formData.message && (
                      <div>
                        <span className="text-sm text-gray-500">Additional Message:</span>
                        <p className="font-medium">{formData.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex">
                      <ExclamationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900">What happens next?</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Our team will review your request and contact you within 24-48 hours. 
                          You'll receive an email confirmation shortly after submission.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="flex">
                    <ExclamationCircleIcon className="w-5 h-5 text-rose-600 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-rose-600 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
                <div>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      ← Back
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Request</span>
                          <span>📝</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestAccess;
