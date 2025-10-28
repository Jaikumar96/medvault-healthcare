import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

const DoctorHeader = ({ user, todayAppointments, pendingReviews }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Dr. {user.firstName}!</h1>
          <p className="text-gray-600 text-sm mt-1">
            You have {todayAppointments} appointment{todayAppointments !== 1 ? 's' : ''} scheduled today
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div className="relative">
            <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
              <BellIcon className="w-5 h-5" />
            </button>
            {(todayAppointments > 0 || pendingReviews > 0) && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {todayAppointments + pendingReviews}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;
