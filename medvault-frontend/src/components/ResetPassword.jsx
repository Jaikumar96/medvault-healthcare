// src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  LockClosedIcon 
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckSolid } from '@heroicons/react/24/solid';

// Import your logo
import medvaultLogo from "../assets/medvault-logo.png";

const ResetPassword = () => {
  const [passwords, setPasswords] = useState({ 
    oldPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [user, setUser] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    noCommonWords: false
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  // Common weak passwords to check against
  const commonPasswords = [
    'password', 'password123', '123456', 'admin', 'user', 'test', 'guest',
    'qwerty', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'shadow',
    'football', 'baseball', 'superman', 'michael', 'jordan', 'welcome123'
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    
    // Check if user needs to reset password (first login)
    if (!userData.firstLogin) {
      // Redirect based on role if password already reset
      if (userData.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (userData.role === 'DOCTOR') {
        navigate('/doctor');
      } else if (userData.role === 'PATIENT') {
        navigate('/patient');
      } else {
        navigate('/dashboard');
      }
      return;
    }
    
    setUser(userData);
  }, [navigate]);

  // Enhanced password strength and requirements checker
  const checkPasswordRequirements = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommonWords: !commonPasswords.some(common => 
        password.toLowerCase().includes(common)
      )
    };

    setPasswordRequirements(requirements);

    // Calculate strength score
    let strength = 0;
    Object.values(requirements).forEach(met => {
      if (met) strength++;
    });
    
    // Bonus points for longer passwords
    if (password.length >= 12) strength += 0.5;
    if (password.length >= 16) strength += 0.5;
    
    setPasswordStrength(Math.min(strength, 6));
    
    return requirements;
  };

  // Form validation
  const validateForm = () => {
    const { oldPassword, newPassword, confirmPassword } = passwords;
    const requirements = passwordRequirements;
    
    const isValid = 
      oldPassword.length > 0 &&
      newPassword.length >= 8 &&
      confirmPassword.length > 0 &&
      newPassword === confirmPassword &&
      requirements.length &&
      requirements.uppercase &&
      requirements.lowercase &&
      requirements.number &&
      requirements.special &&
      requirements.noCommonWords;
      
    setIsFormValid(isValid);
    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [passwords, passwordRequirements]);

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess(false);
    
    if (field === 'newPassword') {
      checkPasswordRequirements(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Final validation
    if (!validateForm()) {
      setError('Please ensure all password requirements are met');
      setLoading(false);
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwords.oldPassword === passwords.newPassword) {
      setError('New password must be different from current password');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username: user.username || user.email,
        userId: user.id,
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
        isFirstLogin: true
      };

      const response = await axios.post(
        'http://localhost:8080/api/auth/reset-password', 
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      console.log('Password reset successful:', response.data);
      setSuccess(true);

      // Update user data to reflect password has been reset
      const updatedUser = { ...user, firstLogin: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Show success message and redirect after delay
      setTimeout(() => {
        // Redirect based on user role
        if (user.role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (user.role === 'DOCTOR') {
          navigate('/doctor');
        } else if (user.role === 'PATIENT') {
          navigate('/patient-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 3000);

    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.response?.status === 401) {
        setError('Current password is incorrect');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || 'Invalid password format');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.response?.data?.message || 'Password reset failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthWidth = () => {
    return Math.min((passwordStrength / 6) * 100, 100);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been updated successfully. You will be redirected to your dashboard shortly.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Redirecting...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-200 rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-10 w-24 h-24 bg-indigo-200 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <img
              src={medvaultLogo}
              alt="MedVault Logo"
              className="w-12 h-12 rounded-xl drop-shadow-md object-contain border border-blue-100 bg-white group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              MedVault
            </span>
          </Link>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
            <p className="text-gray-600">
              Welcome, <span className="font-semibold">{user.firstName || user.username}</span>! 
              You must reset your password before continuing.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-rose-800 text-sm">Password Reset Failed</h4>
                <p className="text-rose-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current (Temporary) Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  value={passwords.oldPassword}
                  onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 pr-12"
                  placeholder="Enter your temporary password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.old ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 pr-12"
                  placeholder="Enter your new password"
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.new ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwords.newPassword && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${getStrengthWidth()}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? 'text-red-600' : 
                      passwordStrength <= 3 ? 'text-yellow-600' : 
                      passwordStrength <= 4 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  
                  {/* Password Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center space-x-1 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.length ? '✓' : '○'}</span>
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.uppercase ? '✓' : '○'}</span>
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.lowercase ? '✓' : '○'}</span>
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.number ? '✓' : '○'}</span>
                      <span>Number</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.special ? '✓' : '○'}</span>
                      <span>Special character</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${passwordRequirements.noCommonWords ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.noCommonWords ? '✓' : '○'}</span>
                      <span>Not common word</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 pr-12"
                  placeholder="Confirm your new password"
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                <p className="text-rose-500 text-xs mt-1 flex items-center space-x-1">
                  <span>✗</span>
                  <span>Passwords do not match</span>
                </p>
              )}
              {passwords.confirmPassword && passwords.newPassword === passwords.confirmPassword && passwords.confirmPassword.length > 0 && (
                <p className="text-green-500 text-xs mt-1 flex items-center space-x-1">
                  <span>✓</span>
                  <span>Passwords match</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>Reset Password & Continue</span>
                </>
              )}
            </button>
          </form>

         

          {/* Role Information */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Logged in as: <span className="font-semibold text-blue-600">{user.role}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
