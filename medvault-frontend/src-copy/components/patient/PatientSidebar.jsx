import React, { useState } from 'react';
import {
  Home,
  Calendar,
  FileText,
  Pill,
  User,
  LogOut,
  CalendarPlus,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Lock,
  MessageSquare
} from 'lucide-react';

const PatientSidebar = ({ user, activeTab, setActiveTab, onLogout, notificationCount, patientStatus, profileComplete }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if profile is approved and complete
  const isProfileApproved = patientStatus === 'APPROVED' && profileComplete;

  // Better organized sidebar items following healthcare workflow
  const sidebarItems = [
    { 
      id: 'dashboard', 
      icon: Home, 
      label: 'Health Overview',
      description: 'Your health summary',
      locked: false
    },
    { 
      id: 'book-appointment', 
      icon: CalendarPlus, 
      label: 'Book Appointment',
      description: 'Schedule with doctors',
      badge: null,
      highlight: true,
      locked: !isProfileApproved
    },
    { 
      id: 'my-appointments', 
      icon: Calendar, 
      label: 'My Appointments',
      description: 'View scheduled visits',
      badge: notificationCount > 0 ? notificationCount : null,
      locked: !isProfileApproved
    },
    { 
      id: 'records', 
      icon: FileText, 
      label: 'Medical Records',
      description: 'Health history & reports',
      locked: !isProfileApproved
    },
    { 
      id: 'prescriptions', 
      icon: Pill, 
      label: 'Prescriptions',
      description: 'Medications & dosages',
      locked: !isProfileApproved
    },
    { 
      id: 'feedback', 
      icon: MessageSquare,
      label: 'My Reviews',
      description: 'Rate your doctors',
      locked: !isProfileApproved
    },
    { 
      id: 'profile', 
      icon: User, 
      label: 'My Profile',
      description: 'Personal information',
      locked: false
    }
  ];

  const handleItemClick = (item) => {
    if (item.locked) {
      // Show alert that profile needs to be completed
      alert('Please complete your profile verification to access this feature.');
      setActiveTab('profile');
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <div className={`bg-white shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Stethoscope size={20} className="text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MedVault
              </span>
              <div className="text-xs text-gray-500 mt-0.5">Patient Portal</div>
            </div>
          )}
        </div>
        
        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-blue-600 font-medium">
                Patient Portal
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border">
                  ID: P{user.id}
                </span>
                <div className={`ml-2 w-2 h-2 rounded-full ${
                  isProfileApproved ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`}></div>
                <span className={`ml-1 text-xs font-medium ${
                  isProfileApproved ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {isProfileApproved ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Status Alert */}
      

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked = item.locked;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-3 px-4'} py-3 rounded-xl font-medium transition-all duration-200 text-sm group relative ${
                  isActive && !isLocked
                    ? item.highlight && !isLocked
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : isLocked
                    ? 'text-gray-400 cursor-pointer opacity-60'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                {isLocked ? (
                  <Lock className={`flex-shrink-0 w-5 h-5`} />
                ) : (
                  <Icon className={`flex-shrink-0 w-5 h-5`} />
                )}
                {!isCollapsed && (
                  <>
                    <div className="flex-1 text-left">
                      <div className="truncate font-semibold">{item.label}</div>
                      <div className="text-xs opacity-75 truncate">{item.description}</div>
                    </div>
                    {isLocked && (
                      <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                        Locked
                      </span>
                    )}
                    {item.badge && !isLocked && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {/* Tooltip for locked items */}
                {isCollapsed && isLocked && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-red-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    Complete profile verification first
                  </div>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && !isLocked && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Health Tip - Only show when expanded and profile approved */}
        {!isCollapsed && isProfileApproved && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Stethoscope size={16} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800 text-sm mb-1">Health Tip</h4>
                <p className="text-xs text-green-700">
                  Schedule regular check-ups to maintain optimal health and catch issues early.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile completion tip when not approved */}
        {!isCollapsed && !isProfileApproved && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 text-sm mb-1">Complete Profile</h4>
                <p className="text-xs text-yellow-700">
                  Verify your profile to book appointments with doctors.
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-3 px-4'} py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm group relative`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default PatientSidebar;
