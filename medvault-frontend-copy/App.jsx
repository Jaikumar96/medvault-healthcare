import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';

// Admin
import AdminDashboard from './components/admin/AdminDashboard';

// Patient
import PatientDashboard from './components/patient/PatientDashboard';
import PatientProfile from './components/patient/profile/PatientProfile';
import BookAppointment from './components/patient/appointments/BookAppointment';
import MyAppointments from './components/patient/appointments/MyAppointments';

// Doctor
import DoctorDashboard from './components/doctor/DoctorDashboard';
import DoctorProfile from './components/doctor/profile/DoctorProfile';
import ScheduleManager from './components/doctor/schedule/Schedule';
import DashboardOverview from './components/doctor/dashboard/DashboardOverview';
import MyPatients from './components/doctor/patients/MyPatients';
import Appointments from './components/doctor/appointments/Appointments';
import Prescriptions from './components/doctor/prescriptions/Prescriptions';
import Analytics from './components/doctor/analytics/Analytics';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Patient Routes */}
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/patient/book-appointment" element={<BookAppointment />} />
          <Route path="/patient/my-appointments" element={<MyAppointments />} />

          {/* Doctor Routes - Nested */}
          <Route path="/doctor" element={<DoctorDashboard />}>
          
            <Route index element={<Navigate to="dashboard" replace />} /> {/* default redirect */}
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="patients" element={<MyPatients />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="schedule" element={<ScheduleManager />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
