import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const RecentActivity = ({ appointments, records, prescriptions, setActiveTab }) => {
  const hasActivity = appointments.length > 0 || records.length > 0 || prescriptions.length > 0;

  if (hasActivity) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 text-center text-gray-500">
            <p>No recent activity to display</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Get Started</h2>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to MedVault!</h3>
        <p className="text-gray-600 mb-4">Start by booking your first appointment or uploading your medical records.</p>
        <button 
          onClick={() => setActiveTab('appointments')}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-md transition-shadow"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
