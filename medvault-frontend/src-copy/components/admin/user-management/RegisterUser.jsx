import React, { useState } from 'react';
import { 
  UserPlus, Users, Stethoscope, Heart, Shield, 
  CheckCircle, AlertCircle, Eye, EyeOff, Loader2, 
  RefreshCw, Save, X 
} from 'lucide-react';
import axios from 'axios';

const RegisterUser = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'PATIENT',
    specialization: '',
    qualification: '',
    experienceYears: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    emergencyContact: '',
    consultationFees: '',
    languagesSpoken: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(33);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email format is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone number must be 10 digits';

    // Role-specific validation
    if (formData.role === 'DOCTOR') {
      if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
      if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
      if (!formData.experienceYears) newErrors.experienceYears = 'Experience is required';
      else if (formData.experienceYears < 0) newErrors.experienceYears = 'Experience cannot be negative';
    }

    if (formData.role === 'PATIENT') {
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      onError('Please fix the form errors before submitting.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', formData);
      onSuccess(`✅ User registered successfully! Login credentials have been sent to ${formData.email}`);
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Registration failed. Please try again.';
      onError(`❌ Registration failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'PATIENT',
      specialization: '',
      qualification: '',
      experienceYears: '',
      dateOfBirth: '',
      gender: 'MALE',
      address: '',
      emergencyContact: '',
      consultationFees: '',
      languagesSpoken: ''
    });
    setErrors({});
    setCurrentStep(1);
    setFormProgress(33);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update progress based on filled fields
    updateProgress();
  };

  const updateProgress = () => {
    const requiredFields = getRequiredFields();
    const filledFields = requiredFields.filter(field => formData[field]?.toString().trim());
    const progress = Math.round((filledFields.length / requiredFields.length) * 100);
    setFormProgress(progress);
  };

  const getRequiredFields = () => {
    const baseFields = ['firstName', 'lastName', 'email', 'phone'];
    if (formData.role === 'DOCTOR') {
      return [...baseFields, 'specialization', 'qualification', 'experienceYears'];
    }
    if (formData.role === 'PATIENT') {
      return [...baseFields, 'dateOfBirth', 'address', 'emergencyContact'];
    }
    return baseFields;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'DOCTOR':
        return <Stethoscope size={20} className="text-blue-600" />;
      case 'PATIENT':
        return <Heart size={20} className="text-red-500" />;
      case 'ADMIN':
        return <Shield size={20} className="text-purple-600" />;
      default:
        return <Users size={20} className="text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'DOCTOR':
        return 'from-blue-500 to-blue-600';
      case 'PATIENT':
        return 'from-red-500 to-pink-600';
      case 'ADMIN':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${getRoleColor(formData.role)} rounded-xl flex items-center justify-center`}>
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Register New User</h1>
                  <p className="text-gray-600 mt-1">Add new healthcare professionals and patients to the system</p>
                </div>
              </div>
              
            </div>

            {/* Progress Bar */}
            
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            
            {/* Role Selection Section */}
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Users size={24} className="mr-3 text-indigo-600" />
                User Role & Type
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['PATIENT', 'DOCTOR', 'ADMIN'].map((role) => (
                  <label
                    key={role}
                    className={`relative flex flex-col items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.role === role
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center">
                      {getRoleIcon(role)}
                      <span className="mt-2 font-semibold text-gray-900">{role}</span>
                      <span className="text-sm text-gray-500 text-center mt-1">
                        {role === 'PATIENT' && 'Healthcare service recipient'}
                        {role === 'DOCTOR' && 'Medical professional'}
                        {role === 'ADMIN' && 'System administrator'}
                      </span>
                    </div>
                    {formData.role === role && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle size={20} className="text-indigo-600" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                {getRoleIcon(formData.role)}
                <span className="ml-3">Basic Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="user@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role-specific Information */}
            {formData.role === 'DOCTOR' && (
              <div className="p-8 bg-blue-50">
                <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                  <Stethoscope size={24} className="mr-3" />
                  Medical Professional Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medical Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.specialization ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select specialization</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.specialization && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.specialization}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medical Qualification <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.qualification ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="e.g., MBBS, MD, MS"
                    />
                    {errors.qualification && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.qualification}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.experienceYears ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Years of practice"
                      min="0"
                      max="50"
                    />
                    {errors.experienceYears && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.experienceYears}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Consultation Fees (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.consultationFees}
                      onChange={(e) => handleInputChange('consultationFees', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="e.g., 500"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Languages Spoken
                    </label>
                    <input
                      type="text"
                      value={formData.languagesSpoken}
                      onChange={(e) => handleInputChange('languagesSpoken', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="e.g., English, Hindi, Tamil"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'PATIENT' && (
              <div className="p-8 bg-red-50">
                <h2 className="text-xl font-bold text-red-900 mb-6 flex items-center">
                  <Heart size={24} className="mr-3" />
                  Patient Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                        errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      max={new Date().toISOString().split('T')}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    >
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
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                        errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter complete address with city, state, and pin code"
                      rows="3"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Emergency Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                        errors.emergencyContact ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Emergency contact number"
                    />
                    {errors.emergencyContact && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.emergencyContact}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-8 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium flex items-center justify-center"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Reset Form
                </button>
                
                <button
                  type="submit"
                  disabled={loading || formProgress < 80}
                  className={`px-8 py-3 text-white rounded-xl font-medium shadow-lg transition-all flex items-center justify-center ${
                    loading || formProgress < 80
                      ? 'bg-gray-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${getRoleColor(formData.role)} hover:shadow-xl`
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Register User
                    </>
                  )}
                </button>
              </div>
              
              {formProgress < 80 && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                 
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
