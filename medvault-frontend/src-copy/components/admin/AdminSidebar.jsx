import React from 'react';
import {
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon // Add this import for doctor management
} from '@heroicons/react/24/outline';
import medVaultLogo from '../../assets/medvault-logo.png';

const AdminSidebar = ({ user, activeTab, setActiveTab, pendingRequests, onLogout }) => {
  const sidebarItems = [
    { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
    { id: 'register', icon: UserPlusIcon, label: 'Register User' },
    { id: 'requests', icon: ClipboardDocumentListIcon, label: 'Access Requests' },
    { id: 'users', icon: UsersIcon, label: 'Manage Users' },
    { id: 'doctors', icon: UserGroupIcon, label: 'Doctor Verification' },
    { id: 'patients', icon: UsersIcon, label: 'Patient Verificationt' }, // Add this line
    { id: 'analytics', icon: ChartBarIcon, label: 'Analytics' },
    { id: 'settings', icon: CogIcon, label: 'Settings' }
  ];

  return (
    <div className="w-72 bg-white shadow-lg border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
            <img 
              src={medVaultLogo} 
              alt="MedVault Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            MedVault
          </span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
            <CogIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
            <p className="text-sm text-gray-500">System Administrator</p>
            <span className="text-xs text-blue-600 font-medium">Admin ID: A{user.id}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-grow overflow-y-auto">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.id === 'requests' && pendingRequests.length > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs rounded-full px-2 py-1">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors font-medium"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
