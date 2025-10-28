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

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ FIXED: Memoize the function to prevent infinite loops
  const fetchPatientData = useCallback(async (userId) => {
    try {
      console.log('Fetching patient data for user:', userId);
      
      // Fetch appointments
      const appointmentsResponse = await fetch(`http://localhost:8080/api/patient/appointments/${userId}`);
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        console.log('Appointments loaded:', appointmentsData);
        setAppointments(appointmentsData);
      } else {
        console.error('Failed to fetch appointments:', appointmentsResponse.status);
        setAppointments([]);
      }

      // Initialize empty arrays for other data for now
      setRecords([]);
      setPrescriptions([]);
      
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setAppointments([]);
      setRecords([]);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  // ✅ FIXED: useEffect runs only once on mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'PATIENT') {
      navigate('/login');
      return;
    }
    
    console.log('Setting user data:', userData);
    setUser(userData);
    
    // Fetch data only once when component mounts
    if (userData.id) {
      fetchPatientData(userData.id);
    }
  }, [navigate, fetchPatientData]); // Only depend on navigate and memoized fetch function

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="ml-4">Loading patient dashboard...</p>
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

  // ✅ FIXED: Safe calculation with null checks
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'APPROVED' && 
    apt.appointmentStartTime && 
    new Date(apt.appointmentStartTime) > new Date()
  ).length;
  
  const completedVisits = appointments.filter(apt => 
    apt.status === 'COMPLETED'
  ).length;
  
  const activePrescriptions = prescriptions.filter(pres => 
    pres.status === 'active'
  ).length;
  
  const pendingReports = records.filter(record => 
    record.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PatientSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-hidden">
        <PatientHeader
          user={user}
          upcomingAppointments={upcomingAppointments}
          pendingReports={pendingReports}
        />

        <div className="p-6 overflow-y-auto h-full">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              upcomingAppointments={upcomingAppointments}
              completedVisits={completedVisits}
              activePrescriptions={activePrescriptions}
              pendingReports={pendingReports}
              appointments={appointments}
              records={records}
              prescriptions={prescriptions}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'appointments' && (
            <MyAppointments appointments={appointments} />
          )}

          {activeTab === 'book-appointment' && (
            <BookAppointment />
          )}

          {activeTab === 'my-appointments' && (
            <MyAppointments appointments={appointments} />
          )}

          {activeTab === 'records' && (
            <MedicalRecords records={records} />
          )}

          {activeTab === 'prescriptions' && (
            <Prescriptions prescriptions={prescriptions} />
          )}

          {activeTab === 'profile' && (
            <PatientProfile user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
