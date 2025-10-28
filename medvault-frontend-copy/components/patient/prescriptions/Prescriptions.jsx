import React from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const Prescriptions = ({ prescriptions }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Prescriptions</h2>
      {prescriptions.length === 0 ? (
        <div className="text-center py-8">
          <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No prescriptions available.</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600">Your prescriptions will appear here...</p>
          {/* Add prescriptions list implementation here */}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
