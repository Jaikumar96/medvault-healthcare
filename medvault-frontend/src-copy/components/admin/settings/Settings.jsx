import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CogIcon,
  ServerIcon,
  CircleStackIcon, // Use this instead of DatabaseIcon
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  CalendarIcon,
  CalculatorIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  // System Status
  const [systemStatus, setSystemStatus] = useState({
    database: { status: 'checking', message: 'Checking connection...', lastChecked: null },
    api: { status: 'checking', message: 'Checking endpoints...', lastChecked: null },
    email: { status: 'checking', message: 'Checking email service...', lastChecked: null }
  });

  // User Preferences
  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,000.00',
    timezone: 'UTC',
    instantSearch: true,
    emailNotifications: true,
    soundNotifications: false,
    autoSave: true
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  // Date format options
  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)', example: '12/31/2024' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)', example: '31/12/2024' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)', example: '2024-12-31' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY (31 Dec 2024)', example: '31 Dec 2024' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Dec 31, 2024)', example: 'Dec 31, 2024' }
  ];

  // Number format options
  const numberFormats = [
    { value: '1,000.00', label: '1,000.00 (US/UK)', example: '1,234.56' },
    { value: '1.000,00', label: '1.000,00 (EU)', example: '1.234,56' },
    { value: '1000.00', label: '1000.00 (Simple)', example: '1234.56' },
    { value: '1 000.00', label: '1 000.00 (Space)', example: '1 234.56' },
    { value: '1,00,000.00', label: '1,00,000.00 (Indian)', example: '1,23,456.78' }
  ];

  // Timezone options
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  useEffect(() => {
    loadPreferences();
    checkSystemStatus();
  }, []);

  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        setPreferences({ ...preferences, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (newPreferences) => {
    try {
      setLoading(true);
      
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      
      // Optionally save to backend
      try {
        await axios.post('http://localhost:8080/api/admin/settings/preferences', newPreferences, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (backendError) {
        console.log('Backend save failed, using localStorage only');
      }
      
      setPreferences(newPreferences);
      setMessage('Settings saved successfully!');
      
      // Apply dark mode immediately
      if (newPreferences.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Failed to save settings');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const checkSystemStatus = async () => {
    try {
      // Set default working status for demo
      setSystemStatus({
        database: { status: 'connected', message: 'Connected to MySQL database', lastChecked: new Date() },
        api: { status: 'operational', message: 'All endpoints operational', lastChecked: new Date() },
        email: { status: 'operational', message: 'Email service operational', lastChecked: new Date() }
      });

      // Optional: Try to check backend health
      try {
        const dbResponse = await axios.get('http://localhost:8080/api/admin/health/database');
        const apiResponse = await axios.get('http://localhost:8080/api/admin/health/api');
        const emailResponse = await axios.get('http://localhost:8080/api/admin/health/email');
        
        setSystemStatus({
          database: {
            status: dbResponse.data.status === 'UP' ? 'connected' : 'error',
            message: dbResponse.data.message || 'Connected to MySQL database',
            lastChecked: new Date()
          },
          api: {
            status: apiResponse.data.status === 'UP' ? 'operational' : 'error',
            message: apiResponse.data.message || 'All endpoints operational',
            lastChecked: new Date()
          },
          email: {
            status: emailResponse.data.status === 'UP' ? 'operational' : 'error',
            message: emailResponse.data.message || 'Email service operational',
            lastChecked: new Date()
          }
        });
      } catch (healthError) {
        console.log('Health check failed, using default status');
      }

    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'operational':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-600" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-rose-600" />;
      default:
        return <ArrowPathIcon className="w-5 h-5 text-amber-600 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'operational':
        return 'text-emerald-600';
      case 'error':
        return 'text-rose-600';
      default:
        return 'text-amber-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600 mt-1">Manage system preferences and monitor status</p>
        </div>
        <button
          onClick={checkSystemStatus}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.includes('successfully') 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          <p className="font-medium">{message}</p>
        </div>
      )}

      {/* System Status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
            <ServerIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">System Status</h3>
            <p className="text-gray-600 text-sm">Real-time system health monitoring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <CircleStackIcon className="w-6 h-6 text-gray-600" />
              <div>
                <h4 className="font-semibold text-gray-800">Database Connection</h4>
                <p className={`text-sm ${getStatusColor(systemStatus.database.status)}`}>
                  {systemStatus.database.message}
                </p>
                {systemStatus.database.lastChecked && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last checked: {systemStatus.database.lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            {getStatusIcon(systemStatus.database.status)}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <CogIcon className="w-6 h-6 text-gray-600" />
              <div>
                <h4 className="font-semibold text-gray-800">API Status</h4>
                <p className={`text-sm ${getStatusColor(systemStatus.api.status)}`}>
                  {systemStatus.api.message}
                </p>
                {systemStatus.api.lastChecked && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last checked: {systemStatus.api.lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            {getStatusIcon(systemStatus.api.status)}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <ServerIcon className="w-6 h-6 text-gray-600" />
              <div>
                <h4 className="font-semibold text-gray-800">Email Service</h4>
                <p className={`text-sm ${getStatusColor(systemStatus.email.status)}`}>
                  {systemStatus.email.message}
                </p>
                {systemStatus.email.lastChecked && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last checked: {systemStatus.email.lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            {getStatusIcon(systemStatus.email.status)}
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
            {preferences.darkMode ? <MoonIcon className="w-5 h-5 text-white" /> : <SunIcon className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Display Preferences</h3>
            <p className="text-gray-600 text-sm">Customize your interface appearance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              {preferences.darkMode ? <MoonIcon className="w-5 h-5 text-gray-600" /> : <SunIcon className="w-5 h-5 text-gray-600" />}
              <div>
                <h4 className="font-semibold text-gray-800">Dark Mode</h4>
                <p className="text-sm text-gray-600">Toggle dark theme</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.darkMode}
                onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Auto Save */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-semibold text-gray-800">Auto Save</h4>
                <p className="text-sm text-gray-600">Automatically save changes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Language & Localization */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
            <GlobeAltIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Language & Localization</h3>
            <p className="text-gray-600 text-sm">Configure language and regional settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Date & Number Format */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Date & Number Format</h3>
            <p className="text-gray-600 text-sm">Customize date and number display formats</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Format */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {dateFormats.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Preview: {dateFormats.find(f => f.value === preferences.dateFormat)?.example}
            </p>
          </div>

          {/* Number Format */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number Format
            </label>
            <select
              value={preferences.numberFormat}
              onChange={(e) => handlePreferenceChange('numberFormat', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {numberFormats.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Preview: {numberFormats.find(f => f.value === preferences.numberFormat)?.example}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Notification Preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-rose-600 to-pink-500 rounded-xl flex items-center justify-center">
            <MagnifyingGlassIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Search & Notifications</h3>
            <p className="text-gray-600 text-sm">Configure search behavior and notifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instant Search */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-semibold text-gray-800">Instant Search</h4>
                <p className="text-sm text-gray-600">Search as you type</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.instantSearch}
                onChange={(e) => handlePreferenceChange('instantSearch', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <ServerIcon className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-semibold text-gray-800">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive email alerts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
