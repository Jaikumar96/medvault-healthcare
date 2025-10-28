import React from 'react';
import { BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const AdminHeader = ({ pendingRequests, onRefresh }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users and system settings</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              title="Refresh Data"
            >
              <ArrowPathIcon className="w-6 h-6" />
            </button>
          )}
          <div className="relative">
            <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
              <BellIcon className="w-6 h-6" />
            </button>
            {pendingRequests && pendingRequests.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {pendingRequests.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
