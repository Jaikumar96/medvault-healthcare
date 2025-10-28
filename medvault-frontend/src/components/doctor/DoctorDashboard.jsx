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
import PatientRecords from './records/PatientRecords';
import EmergencyRequests from './schedule/EmergencyRequests';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // Make sure this starts with 'dashboard'
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingReviews: 0,
    monthlyEarnings: 0,
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState({
    status: 'INACTIVE',
    profileComplete: false,
    documentsUploaded: false,
    hasAllDocuments: false,
    isFullyVerified: false
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  // Debug logging to track activeTab changes
  console.log('🎯 Current activeTab:', activeTab);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchDashboardData(userData.id);
    fetchDoctorProfile(userData.id);
  }, [navigate]);

  const fetchDoctorProfile = async (doctorId) => {
    try {
      setProfileLoading(true);
      console.log('🔍 Fetching doctor profile for ID:', doctorId);
      
      const response = await fetch(`http://localhost:8080/api/doctor/profile/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Doctor profile response:', data);
        
        const profileData = {
          status: data.status || 'INACTIVE',
          profileComplete: Boolean(data.profileComplete),
          documentsUploaded: Boolean(data.documentsUploaded),
          hasAllDocuments: Boolean(data.hasAllDocuments),
          isFullyVerified: Boolean(data.isFullyVerified)
        };
        
        console.log('✅ Processed profile data:', profileData);
        setDoctorData(profileData);
        
        // Only redirect to profile if not fully verified AND not already on a specific tab
        if (!profileData.isFullyVerified && activeTab === 'dashboard') {
          console.log('⚠️ Profile not fully verified, redirecting to profile');
          setActiveTab('profile');
        } else {
          console.log('🎉 Doctor is fully verified or tab already set!');
        }
      } else {
        console.error('❌ Failed to fetch profile:', response.status);
        setDoctorData({
          status: 'INACTIVE',
          profileComplete: false,
          documentsUploaded: false,
          hasAllDocuments: false,
          isFullyVerified: false
        });
        if (activeTab === 'dashboard') {
          setActiveTab('profile');
        }
      }
    } catch (error) {
      console.error('💥 Error fetching profile:', error);
      setDoctorData({
        status: 'INACTIVE',
        profileComplete: false,
        documentsUploaded: false,
        hasAllDocuments: false,
        isFullyVerified: false
      });
      if (activeTab === 'dashboard') {
        setActiveTab('profile');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchDashboardData = async (doctorId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/doctor/dashboard-stats/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      } else {
        setDashboardStats({
          todayAppointments: 0,
          totalPatients: 0,
          pendingReviews: 0,
          monthlyEarnings: 0,
          upcomingAppointments: []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const refreshProfileStatus = async () => {
    console.log('🔄 Refreshing profile status...');
    if (user) {
      await fetchDoctorProfile(user.id);
    }
  };

  // Enhanced tab change handler with logging
  const handleTabChange = (newTab) => {
    console.log('🔄 Tab change requested:', newTab, 'from:', activeTab);
    setActiveTab(newTab);
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

  // Render the appropriate component based on activeTab
  const renderActiveTabContent = () => {
    console.log('🎨 Rendering tab content for:', activeTab);
    
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            stats={dashboardStats}
            setActiveTab={handleTabChange}
            loading={loading}
            doctorData={doctorData}
          />
        );
      case 'patients':
        return <MyPatients />;
      case 'appointments':
        return <Appointments />;
      case 'emergency':
        return <EmergencyRequests />;
      case 'schedule':
        return <Schedule />;
      case 'records':
        return <PatientRecords />;
      case 'feedback':
        return <DoctorFeedback />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return (
          <DoctorProfileProvider>
            <DoctorProfile onProfileUpdate={refreshProfileStatus} />
          </DoctorProfileProvider>
        );
      default:
        console.warn('⚠️ Unknown tab:', activeTab, 'falling back to dashboard');
        return (
          <DashboardOverview
            stats={dashboardStats}
            setActiveTab={handleTabChange}
            loading={loading}
            doctorData={doctorData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DoctorSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={handleTabChange} // Use the enhanced handler
        onLogout={handleLogout}
        pendingReviews={dashboardStats.pendingReviews}
        doctorData={doctorData}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DoctorHeader
          user={user}
          stats={dashboardStats}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="w-full"> {/* Changed from max-w-7xl mx-auto to full width */}
            {renderActiveTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
