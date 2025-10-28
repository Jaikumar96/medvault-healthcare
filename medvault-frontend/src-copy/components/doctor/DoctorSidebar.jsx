import React, { useState } from 'react';
import {
  Home,
  Users,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Lock,
  MessageSquare
} from 'lucide-react';

const DoctorSidebar = ({ user, activeTab, setActiveTab, onLogout, pendingReviews, doctorStatus, profileComplete }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if profile is approved and complete
  const isProfileApproved = doctorStatus === 'APPROVED' && profileComplete;

  const sidebarItems = [
    { 
      id: 'dashboard', 
      icon: Home, 
      label: 'Dashboard',
      badge: null,
      locked: false
    },
    { 
      id: 'patients', 
      icon: Users, 
      label: 'My Patients',
      badge: null,
      locked: !isProfileApproved
    },
    { 
      id: 'appointments', 
      icon: Calendar, 
      label: 'Appointments',
      badge: pendingReviews > 0 ? pendingReviews : null,
      locked: !isProfileApproved
    },
    { 
      id: 'schedule', 
      icon: Clock, 
      label: 'Schedule Manager',
      badge: null,
      locked: !isProfileApproved
    },
    { 
      id: 'prescriptions', 
      icon: FileText, 
      label: 'Prescriptions',
      badge: null,
      locked: !isProfileApproved
    },
    { 
      id: 'feedback', 
      icon: MessageSquare, 
      label: 'Patient Reviews',
      badge: null,
      locked: !isProfileApproved
    },
    { 
      id: 'analytics', 
      icon: BarChart3, 
      label: 'Analytics',
      badge: null,
      locked: !isProfileApproved
    },
    { 
      id: 'profile', 
      icon: User, 
      label: 'Profile',
      badge: null,
      locked: false
    },
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
      isCollapsed ? 'w-20' : 'w-72'
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
              <div className="text-xs text-gray-500 mt-0.5">Doctor Portal</div>
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
                Dr. {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-blue-600 font-medium truncate">
                {user.specialization || 'Medical Doctor'}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border">
                  ID: D{user.id}
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
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : isLocked
                    ? 'text-gray-400 cursor-pointer opacity-60'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                {isLocked ? (
                  <Lock className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                ) : (
                  <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                )}
                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
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
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-red-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    Complete profile verification first
                  </div>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && !isLocked && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
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

export default DoctorSidebar;
