import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';
import DoctorHeader from './DoctorHeader';
import DashboardOverview from './dashboard/DashboardOverview';
import MyPatients from './patients/MyPatients';
import ScheduleManager from './schedule/Schedule'; // Renamed import to match the file
import Prescriptions from './prescriptions/Prescriptions';
import Analytics from './analytics/Analytics';
import DoctorProfile from './profile/DoctorProfile';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  // New state for loading data from API
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchData(userData.id);
  }, [navigate]);

  const fetchData = async (userId) => {
    setDataLoading(true);
    try {
      // Fetch appointments
      const appointmentsResponse = await fetch(`http://localhost:8080/api/doctor/appointments/${userId}`);
      if (appointmentsResponse.ok) {
        const fetchedAppointments = await appointmentsResponse.json();
        setAppointments(fetchedAppointments);
      } else {
        setAppointments([]); // Reset if fetch fails
      }

      // Fetch patients (assuming a similar API endpoint exists)
      const patientsResponse = await fetch(`http://localhost:8080/api/doctor/patients/${userId}`);
      if (patientsResponse.ok) {
        const fetchedPatients = await patientsResponse.json();
        setPatients(fetchedPatients);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Handle error, maybe show an alert
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Calculate stats
  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    return new Date(apt.slotStartTime).toDateString() === today; // Using slotStartTime
  }).length;
  
  const totalPatients = patients.length;
  const pendingReviews = appointments.filter(apt => apt.status === 'PENDING').length;

  const monthlyEarnings = appointments.filter(apt => {
    const now = new Date();
    const aptDate = new Date(apt.slotStartTime);
    return aptDate.getMonth() === now.getMonth() &&
      aptDate.getFullYear() === now.getFullYear() &&
      apt.status === 'APPROVED';
  }).length * 1000; // Assume ₹1000 per approved appointment

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DoctorSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-hidden">
        <DoctorHeader
          user={user}
          todayAppointments={todayAppointments}
          pendingReviews={pendingReviews}
        />

        <div className="p-6 overflow-y-auto h-full">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              todayAppointments={todayAppointments}
              totalPatients={totalPatients}
              pendingReviews={pendingReviews}
              monthlyEarnings={monthlyEarnings}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'patients' && (
            <MyPatients patients={patients} />
          )}

          {/* This is the key change: pass the appointments data to the component */}
          {activeTab === 'appointments' && (
            <ScheduleManager />
          )}

          {activeTab === 'schedule' && (
            <ScheduleManager /> // Using the same component for both
          )}

          {activeTab === 'prescriptions' && (
            <Prescriptions prescriptions={appointments} />
          )}

          {activeTab === 'analytics' && (
            <Analytics />
          )}

          {activeTab === 'profile' && (
            <DoctorProfile />
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;