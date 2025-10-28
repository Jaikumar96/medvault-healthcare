import React from 'react';
import {
  HomeIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import medvaultLogo from '../../assets/medvault-logo.png';

const DoctorSidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  const sidebarItems = [
    { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
    { id: 'patients', icon: UsersIcon, label: 'My Patients' },
    { id: 'appointments', icon: CalendarDaysIcon, label: 'Appointments' },
    { id: 'schedule', icon: CalendarDaysIcon, label: 'Schedule Manager' },
    { id: 'prescriptions', icon: DocumentTextIcon, label: 'Prescriptions' },
    { id: 'analytics', icon: ChartBarIcon, label: 'Analytics' },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src={medvaultLogo} 
            alt="MedVault Logo" 
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            MedVault
          </span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              Dr. {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {user.specialization || 'Medical Doctor'}
            </p>
            <span className="text-xs text-emerald-600 font-medium">ID: D{user.id}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                  activeTab === item.id
                    ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors font-medium text-sm"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;
