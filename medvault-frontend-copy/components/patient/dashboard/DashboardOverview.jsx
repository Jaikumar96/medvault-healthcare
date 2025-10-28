import React, { useState, useEffect } from 'react';
import { Calendar, User, Heart, Activity, Bell, AlertCircle, CheckCircle } from 'lucide-react';

const DashboardOverview = () => {
  const [patientData, setPatientData] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/patient/profile/${user.id}`);
      
      if (response.ok) {
        const patient = await response.json();
        setPatientData(patient);
        setProfileComplete(patient.profileComplete || false);
      } else {
        // Profile doesn't exist yet
        setProfileComplete(false);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = () => {
    window.location.href = '/patient/profile';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {patientData?.firstName || 'Patient'}!</h1>
            <p className="opacity-90">Here's your health overview for today</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">
              {new Date().toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            <p className="text-sm opacity-75">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {!profileComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle size={24} className="text-amber-600 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-amber-900 mb-2">Complete Your Profile</h3>
              <p className="text-amber-800 mb-4">
                Please complete your profile to book appointments with doctors and access all features.
              </p>
              <button
                onClick={handleCompleteProfile}
                className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Complete Success */}
      {profileComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircle size={24} className="text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-green-900">Profile Complete!</h3>
              <p className="text-green-800">You can now book appointments and access all features.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar size={24} className="text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Next Appointment</p>
              <p className="text-lg font-semibold">No appointments scheduled</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Heart size={24} className="text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Health Status</p>
              <p className="text-lg font-semibold">Good</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity size={24} className="text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Prescriptions</p>
              <p className="text-lg font-semibold">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/patient/book-appointment"
            className={`p-4 rounded-lg border-2 border-dashed text-center transition-colors ${
              profileComplete 
                ? 'border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50' 
                : 'border-gray-300 text-gray-400 cursor-not-allowed'
            }`}
            onClick={!profileComplete ? (e) => e.preventDefault() : undefined}
          >
            <Calendar size={24} className="mx-auto mb-2" />
            <p className="font-medium">Book Appointment</p>
            {!profileComplete && <p className="text-xs mt-1">Complete profile first</p>}
          </a>

          <a
            href="/patient/my-appointments"
            className="p-4 rounded-lg border-2 border-dashed border-green-300 text-green-600 hover:border-green-500 hover:bg-green-50 text-center transition-colors"
          >
            <Activity size={24} className="mx-auto mb-2" />
            <p className="font-medium">My Appointments</p>
          </a>

          <a
            href="/patient/records"
            className="p-4 rounded-lg border-2 border-dashed border-purple-300 text-purple-600 hover:border-purple-500 hover:bg-purple-50 text-center transition-colors"
          >
            <User size={24} className="mx-auto mb-2" />
            <p className="font-medium">Medical Records</p>
          </a>

          <a
            href="/patient/profile"
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-500 hover:bg-gray-50 text-center transition-colors"
          >
            <User size={24} className="mx-auto mb-2" />
            <p className="font-medium">Update Profile</p>
          </a>
        </div>
      </div>

      {/* Health Tip */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-start">
          <Bell size={20} className="text-green-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-2">Health Tip</h3>
            <p className="text-green-800">
              Don't forget to stay hydrated and take your medications on time!
            </p>
          </div>
        </div>
      </div>

      {/* Profile Summary (if completed) */}
      {profileComplete && patientData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{patientData.firstName} {patientData.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{patientData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-medium">{patientData.contactNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium">{patientData.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">{new Date(patientData.dateOfBirth).toLocaleDateString()}</p>
            </div>
            {patientData.emergencyContact && (
              <div>
                <p className="text-sm text-gray-600">Emergency Contact</p>
                <p className="font-medium">{patientData.emergencyContact}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
