// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Import your logo (make sure the path matches your actual logo location)
import medvaultLogo from "../assets/medvault-logo.png";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  // ✅ handleSubmit with better error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        credentials,
        { withCredentials: true } // allow cookies if backend sends them
      );

      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));

      if (user.firstLogin) {
        navigate('/reset-password');
      } else if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'DOCTOR') {
        navigate('/doctor');
      } else if (user.role === 'PATIENT') {
        navigate('/patient');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'password', color: 'bg-purple-100 text-purple-800' },
    { role: 'Doctor', username: 'doctor@medvault.com', password: 'temp123', color: 'bg-emerald-100 text-emerald-800' },
    { role: 'Patient', username: 'patient@medvault.com', password: 'temp123', color: 'bg-blue-100 text-blue-800' }
  ];

  const fillCredentials = (username, password) => {
    setCredentials({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navbar - Fixed at top */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={medvaultLogo}
              alt="MedVault Logo"
              className="w-10 h-10 rounded-xl drop-shadow-md object-contain border border-blue-100"
              style={{ background: 'white', borderRadius: '12px' }}
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              MedVault
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Features
            </Link>
            <Link to="/#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              About
            </Link>
            <Link to="/#services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Services
            </Link>
            <Link to="/#contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Contact
            </Link>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              ← Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - With proper top padding to avoid navbar overlap */}
      <div className="pt-20 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md relative z-10">
          {/* Logo Section - Smaller since we have navbar logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 group">
              <img
                src={medvaultLogo}
                alt="MedVault Logo"
                className="w-12 h-12 rounded-xl drop-shadow-md object-contain border border-blue-100 bg-white group-hover:scale-105 transition-transform duration-200"
              />
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                MedVault
              </span>
            </div>
            <p className="text-gray-600 mt-3 font-medium">Secure Healthcare Management</p>
          </div>

          {/* Login Box */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to access your healthcare dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-800 text-sm">Authentication Failed</h4>
                  <p className="text-rose-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      focusedField === 'username' ? 'border-blue-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter username or email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      focusedField === 'password' ? 'border-blue-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>{loading ? "Signing in..." : "Sign In"}</span>
                {!loading && (
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </form>

            
            

            
          </div>

          {/* Additional branding/security note */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              🔒 Secured with enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
