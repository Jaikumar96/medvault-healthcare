import React from 'react';
import {
  HomeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import medvaultLogo from '../../assets/medvault-logo.png';

const PatientSidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  const sidebarItems = [
    { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
    { id: 'appointments', icon: CalendarDaysIcon, label: 'Appointments' },
    { id: 'records', icon: DocumentTextIcon, label: 'Medical Records' },
    { id: 'prescriptions', icon: ClipboardDocumentListIcon, label: 'Prescriptions' },
    // ✅ Added new items
    { id: 'profile', icon: UserIcon, label: 'Profile' },
    { id: 'book-appointment', icon: CalendarDaysIcon, label: 'Book Appointment' },
    
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
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            MedVault
          </span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-gray-500">ID: P{user.id}</p>
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
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
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

export default PatientSidebar;
