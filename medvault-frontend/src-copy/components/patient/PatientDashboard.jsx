import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from './PatientSidebar';
import PatientHeader from './PatientHeader';
import DashboardOverview from './dashboard/DashboardOverview';
import MyAppointments from './appointments/MyAppointments';
import BookAppointment from './appointments/BookAppointment';
import MedicalRecords from './records/MedicalRecords';
import Prescriptions from './prescriptions/Prescriptions';
import PatientProfile from './profile/PatientProfile';
import MyFeedback from './feedback/MyFeedback';

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    records: [],
    prescriptions: [],
    stats: {
      upcomingAppointments: 0,
      completedVisits: 0,
      activePrescriptions: 0,
      pendingReports: 0
    }
  });
  const [loading, setLoading] = useState(true);
  
  // Add these new states for profile status checking
  const [patientStatus, setPatientStatus] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const navigate = useNavigate();

  // Add this new function to fetch patient profile status
  const fetchPatientProfile = async (userId) => {
    try {
      setProfileLoading(true);
      const response = await fetch(`http://localhost:8080/api/patient/profile/${userId}`);
      
      if (response.ok) {
        const patient = await response.json();
        setPatientStatus(patient.status);
        setProfileComplete(patient.profileComplete && patient.documentUploaded);
        
        // If profile is not complete, redirect to profile tab
        if (!patient.profileComplete || patient.status !== 'APPROVED') {
          setActiveTab('profile');
        }
      } else {
        // Profile doesn't exist yet
        setPatientStatus('INACTIVE');
        setProfileComplete(false);
        setActiveTab('profile'); // Redirect to profile for completion
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setPatientStatus('INACTIVE');
      setProfileComplete(false);
      setActiveTab('profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchPatientData = useCallback(async (userId) => {
    try {
      console.log('Fetching patient data for user:', userId);
      setLoading(true);
      
      // Fetch appointments
      const appointmentsResponse = await fetch(`http://localhost:8080/api/patient/appointments/${userId}`);
      let appointments = [];
      if (appointmentsResponse.ok) {
        appointments = await appointmentsResponse.json();
        console.log('Appointments loaded:', appointments);
      }

      // TODO: Add other API calls when ready
      const records = [];
      const prescriptions = [];

      // Calculate stats
      const stats = {
        upcomingAppointments: appointments.filter(apt => 
          apt.status === 'APPROVED' && 
          apt.timeSlot && 
          new Date(apt.timeSlot.startTime) > new Date()
        ).length,
        completedVisits: appointments.filter(apt => apt.status === 'COMPLETED').length,
        activePrescriptions: prescriptions.filter(pres => pres.status === 'active').length,
        pendingReports: records.filter(record => record.status === 'pending').length
      };

      setDashboardData({
        appointments,
        records,
        prescriptions,
        stats
      });
      
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setDashboardData({
        appointments: [],
        records: [],
        prescriptions: [],
        stats: { upcomingAppointments: 0, completedVisits: 0, activePrescriptions: 0, pendingReports: 0 }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'PATIENT') {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    if (userData.id) {
      fetchPatientData(userData.id);
      fetchPatientProfile(userData.id); // Add this line
    }
  }, [navigate, fetchPatientData]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  // Add this function to refresh profile status when profile is updated
  const refreshProfileStatus = () => {
    if (user) {
      fetchPatientProfile(user.id);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {profileLoading ? 'Checking profile status...' : 'Loading your health dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PatientSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        notificationCount={dashboardData.stats.upcomingAppointments + dashboardData.stats.pendingReports}
        patientStatus={patientStatus}
        profileComplete={profileComplete}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PatientHeader
          user={user}
          stats={dashboardData.stats}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                stats={dashboardData.stats}
                appointments={dashboardData.appointments}
                records={dashboardData.records}
                prescriptions={dashboardData.prescriptions}
                setActiveTab={setActiveTab}
                patientStatus={patientStatus}
                profileComplete={profileComplete}
              />
            )}

            {activeTab === 'book-appointment' && (
              <BookAppointment />
            )}

            {activeTab === 'my-appointments' && (
              <MyAppointments appointments={dashboardData.appointments} />
            )}

            {activeTab === 'records' && (
              <MedicalRecords records={dashboardData.records} />
            )}

            {activeTab === 'prescriptions' && (
              <Prescriptions prescriptions={dashboardData.prescriptions} />
            )}

            {activeTab === 'feedback' && (
              <MyFeedback />
            )}

            {activeTab === 'profile' && (
              <PatientProfile user={user} onProfileUpdate={refreshProfileStatus} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
