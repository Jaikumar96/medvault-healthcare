// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';

// Admin
import AdminDashboard from './components/admin/AdminDashboard';

// Patient Components
import PatientDashboard from './components/patient/PatientDashboard';
import PatientDashboardOverview from './components/patient/dashboard/DashboardOverview'; // Renamed for clarity
import PatientProfile from './components/patient/profile/PatientProfile';
import BookAppointment from './components/patient/appointments/BookAppointment';
import MyAppointments from './components/patient/appointments/MyAppointments';

// Doctor Components
import DoctorDashboard from './components/doctor/DoctorDashboard';
import DoctorDashboardOverview from './components/doctor/dashboard/DashboardOverview'; // Renamed for clarity
import DoctorProfile from './components/doctor/profile/DoctorProfile';
import Schedule from './components/doctor/schedule/Schedule';
import MyPatients from './components/doctor/patients/MyPatients';
import Appointments from './components/doctor/appointments/Appointments';
import Prescriptions from './components/doctor/prescriptions/Prescriptions';
import Analytics from './components/doctor/analytics/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Route */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* ✅ CORRECTED: Patient Routes (Nested) */}
        <Route path="/patient" element={<PatientDashboard />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboardOverview />} />
          <Route path="my-appointments" element={<MyAppointments />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="records" element={<div>Medical Records Page</div>} />
          <Route path="prescriptions" element={<div>Prescriptions Page</div>} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>
        
        {/* Doctor Routes (Nested) */}
        <Route path="/doctor" element={<DoctorDashboard />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboardOverview />} />
          <Route path="patients" element={<MyPatients />} />
          <Route path="appointments" element={<Appointments />} /> 
          <Route path="schedule" element={<Schedule />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;