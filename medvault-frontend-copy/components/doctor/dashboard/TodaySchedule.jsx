import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const TodaySchedule = ({ todayAppointments, setActiveTab }) => {
  return (
    <div>
      {todayAppointments > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
            <button 
              onClick={() => setActiveTab('appointments')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
            >
              View All
            </button>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <p className="text-gray-600">Your appointments will appear here...</p>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h2>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
            <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments today</h3>
            <p className="text-gray-600">You have a free day! Enjoy your break.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default TodaySchedule;
