import React from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';

const MyPatients = ({ patients }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">My Patients</h2>
      {patients.length === 0 ? (
        <div className="text-center py-8">
          <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No patients assigned yet.</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600">Patient list will appear here...</p>
          {/* Add patient list implementation here */}
        </div>
      )}
    </div>
  );
};

export default MyPatients;
