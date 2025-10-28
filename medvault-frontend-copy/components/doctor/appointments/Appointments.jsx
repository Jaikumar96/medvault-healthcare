import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const Appointments = ({ appointments }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Appointments</h2>
      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No appointments scheduled.</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600">Your appointments will appear here...</p>
          {/* Add appointments list implementation here */}
        </div>
      )}
    </div>
  );
};

export default Appointments;
