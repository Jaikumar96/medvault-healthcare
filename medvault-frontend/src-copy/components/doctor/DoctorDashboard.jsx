import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';
import DoctorHeader from './DoctorHeader';
import DashboardOverview from './dashboard/DashboardOverview';
import MyPatients from './patients/MyPatients';
import Appointments from './appointments/Appointments';
import Schedule from './schedule/Schedule';
import Prescriptions from './prescriptions/Prescriptions';
import Analytics from './analytics/Analytics';
import DoctorProfile from './profile/DoctorProfile';
import DoctorFeedback from './feedback/DoctorFeedback';
import { DoctorProfileProvider } from '../../context/DoctorProfileContext';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingReviews: 0,
    monthlyEarnings: 0,
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);
  
  // Add these new states for profile status checking
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchDashboardData(userData.id);
    fetchDoctorProfile(userData.id); // Add this line
  }, [navigate]);

  // Add this new function to fetch doctor profile status
  const fetchDoctorProfile = async (doctorId) => {
    try {
      setProfileLoading(true);
      const response = await fetch(`http://localhost:8080/api/doctor/profile/${doctorId}`);
      
      if (response.ok) {
        const doctor = await response.json();
        setDoctorStatus(doctor.status);
        setProfileComplete(doctor.profileComplete && doctor.documentsUploaded);
        
        // If profile is not complete, redirect to profile tab
        if (!doctor.profileComplete || doctor.status !== 'APPROVED') {
          setActiveTab('profile');
        }
      } else {
        // Profile doesn't exist yet
        setDoctorStatus('INACTIVE');
        setProfileComplete(false);
        setActiveTab('profile'); // Redirect to profile for completion
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setDoctorStatus('INACTIVE');
      setProfileComplete(false);
      setActiveTab('profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchDashboardData = async (doctorId) => {
    try {
      setLoading(true);
      // Fetch real data from API
      const response = await fetch(`http://localhost:8080/api/doctor/dashboard-stats/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      } else {
        // Fallback to mock data if API fails
        setDashboardStats({
          todayAppointments: 3,
          totalPatients: 127,
          pendingReviews: 2,
          monthlyEarnings: 85000,
          upcomingAppointments: []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data
      setDashboardStats({
        todayAppointments: 0,
        totalPatients: 0,
        pendingReviews: 0,
        monthlyEarnings: 0,
        upcomingAppointments: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Add this function to refresh profile status when profile is updated
  const refreshProfileStatus = () => {
    if (user) {
      fetchDoctorProfile(user.id);
    }
  };

  if (!user || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {profileLoading ? 'Checking profile status...' : 'Loading MedVault...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DoctorSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        pendingReviews={dashboardStats.pendingReviews}
        doctorStatus={doctorStatus}
        profileComplete={profileComplete}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DoctorHeader
          user={user}
          stats={dashboardStats}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                stats={dashboardStats}
                setActiveTab={setActiveTab}
                loading={loading}
                doctorStatus={doctorStatus}
                profileComplete={profileComplete}
              />
            )}

            {activeTab === 'patients' && (
              <MyPatients />
            )}

            {activeTab === 'appointments' && (
              <Appointments />
            )}

            {activeTab === 'schedule' && (
              <Schedule />
            )}

            {activeTab === 'prescriptions' && (
              <Prescriptions />
            )}

            {activeTab === 'feedback' && (
              <DoctorFeedback />
            )}

            {activeTab === 'analytics' && (
              <Analytics />
            )}

            {activeTab === 'profile' && (
              <DoctorProfileProvider>
                <DoctorProfile onProfileUpdate={refreshProfileStatus} />
              </DoctorProfileProvider>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
