import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const MedicalRecords = ({ records }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Medical Records</h2>
      {records.length === 0 ? (
        <div className="text-center py-8">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No medical records uploaded yet.</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600">Your medical records will appear here...</p>
          {/* Add medical records list implementation here */}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
