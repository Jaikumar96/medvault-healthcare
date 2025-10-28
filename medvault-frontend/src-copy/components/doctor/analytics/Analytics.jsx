import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const Analytics = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics & Reports</h2>
      <div className="text-center py-8">
        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Analytics dashboard coming soon...</p>
      </div>
    </div>
  );
};

export default Analytics;
