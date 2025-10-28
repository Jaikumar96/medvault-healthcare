import React, { useState, useEffect } from 'react';
import medvaultLogo from '../../assets/medvault-logo.png';
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
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Heart,
  Zap
} from 'lucide-react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const DoctorSidebar = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  pendingReviews,
  doctorData
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [emergencyCount, setEmergencyCount] = useState(0);

  console.log('🎯 Sidebar - Current activeTab:', activeTab);
  console.log('🎯 Sidebar doctorData:', doctorData);

  // Fetch emergency count
  useEffect(() => {
    const fetchEmergencyCount = async () => {
      try {
        if (user && doctorData?.isFullyVerified) {
          const response = await fetch(`http://localhost:8080/api/doctor/emergency-requests/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setEmergencyCount(data.length);
          }
        }
      } catch (error) {
        console.error('Error fetching emergency count:', error);
      }
    };

    fetchEmergencyCount();
    const interval = setInterval(fetchEmergencyCount, 30000);
    return () => clearInterval(interval);
  }, [user, doctorData?.isFullyVerified]);

  const isProfileApproved = doctorData?.isFullyVerified || false;

  console.log('🔓 Is Profile Approved:', isProfileApproved);

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
      id: 'emergency',
      icon: Heart,
      label: 'Emergency Requests',
      badge: emergencyCount > 0 ? emergencyCount : null,
      locked: !isProfileApproved,
      urgent: emergencyCount > 0,
      pulseEffect: emergencyCount > 0
    },
    {
      id: 'schedule',
      icon: Clock,
      label: 'Schedule Manager',
      badge: null,
      locked: !isProfileApproved
    },
    {
      id: 'records',
      icon: DocumentTextIcon,
      label: 'Medical Records',
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
      id: 'profile',
      icon: User,
      label: 'Profile',
      badge: !isProfileApproved ? '!' : null,
      locked: false
    },
  ];

  const handleItemClick = (item) => {
    console.log('🖱️ Sidebar item clicked:', item.id, 'locked:', item.locked);
    
    if (item.locked) {
      let message = 'Please complete your profile verification to access this feature.';

      if (doctorData.status === 'PENDING') {
        message = 'Your profile is under admin review. Please wait for approval to access this feature.';
      } else if (doctorData.status === 'REJECTED') {
        message = 'Your profile was rejected. Please update your profile and documents.';
      } else if (!doctorData.profileComplete) {
        message = 'Please complete your basic profile information first.';
      } else if (!doctorData.documentsUploaded || !doctorData.hasAllDocuments) {
        message = 'Please upload all required documents to access this feature.';
      }

      alert(message);
      setActiveTab('profile');
      return;
    }
    
    // Always set the active tab, regardless of current state
    console.log('✅ Setting active tab to:', item.id);
    setActiveTab(item.id);
  };

  const getStatusDisplay = () => {
    const { status, profileComplete, documentsUploaded, hasAllDocuments } = doctorData;

    if (status === 'APPROVED' && profileComplete && documentsUploaded && hasAllDocuments) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        text: 'Verified',
        animate: 'animate-pulse',
        icon: CheckCircle
      };
    } else if (status === 'APPROVED') {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        text: 'Approved',
        animate: 'animate-pulse',
        icon: CheckCircle
      };
    } else if (status === 'PENDING') {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        text: 'Pending',
        animate: 'animate-pulse',
        icon: AlertTriangle
      };
    } else if (status === 'REJECTED') {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        text: 'Rejected',
        animate: '',
        icon: AlertTriangle
      };
    } else {
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-500',
        text: 'Inactive',
        animate: '',
        icon: AlertTriangle
      };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`bg-white shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src={medvaultLogo}
              alt="MedVault Logo"
              className="w-10 h-10 rounded-xl drop-shadow-md object-contain border border-blue-100 bg-white"
            />
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
                <div className={`ml-2 w-2 h-2 rounded-full ${statusDisplay.bgColor} ${statusDisplay.animate}`}></div>
                <span className={`ml-1 text-xs font-medium ${statusDisplay.color}`}>
                  {statusDisplay.text}
                </span>
              </div>
              {!isProfileApproved && (
                <div className="mt-2">
                  {!doctorData.profileComplete && (
                    <div className="text-xs text-red-600">📝 Complete profile required</div>
                  )}
                  {doctorData.profileComplete && (!doctorData.documentsUploaded || !doctorData.hasAllDocuments) && (
                    <div className="text-xs text-orange-600">📄 Upload documents required</div>
                  )}
                  {doctorData.profileComplete && doctorData.documentsUploaded && doctorData.hasAllDocuments && doctorData.status === 'PENDING' && (
                    <div className="text-xs text-yellow-600">⏳ Awaiting admin approval</div>
                  )}
                  {doctorData.status === 'REJECTED' && (
                    <div className="text-xs text-red-600">❌ Profile rejected - needs update</div>
                  )}
                </div>
              )}
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
            const isUrgent = item.urgent;

            console.log(`🔍 Item ${item.id}: active=${isActive}, locked=${isLocked}, urgent=${isUrgent}`);

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-3 px-4'} py-3 rounded-xl font-medium transition-all duration-200 text-sm group relative ${
                  isActive && !isLocked
                    ? isUrgent
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : isLocked
                      ? 'text-gray-400 cursor-pointer opacity-60 hover:opacity-80'
                      : isUrgent
                        ? 'text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 bg-red-50'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${item.pulseEffect ? 'animate-pulse' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                {isLocked ? (
                  <Lock className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                ) : (
                  <div className="relative">
                    <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                    {item.id === 'emergency' && emergencyCount > 0 && (
                      <Zap size={10} className="absolute -top-1 -right-1 text-yellow-400" />
                    )}
                  </div>
                )}

                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {isLocked && (
                      <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">
                        Locked
                      </span>
                    )}
                    {item.badge && item.badge !== '!' && !isLocked && (
                      <span className={`text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${
                        item.id === 'emergency' ? 'bg-red-500 animate-pulse' : 'bg-red-500'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.badge === '!' && (
                      <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                        !
                      </span>
                    )}
                  </>
                )}

                {/* Tooltips for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                    {isLocked && <span className="ml-1 text-red-400">(Locked)</span>}
                    {item.badge && (
                      <span className={`ml-2 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ${
                        item.id === 'emergency' ? 'bg-red-500' : 'bg-red-500'
                      }`}>
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

      {/* Rest of the sidebar components remain the same */}
      {isCollapsed && emergencyCount > 0 && isProfileApproved && (
        <div className="p-2 mx-2 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <div className="text-red-600 font-bold text-lg">{emergencyCount}</div>
            <div className="text-xs text-red-600">Emergency</div>
          </div>
        </div>
      )}

      {!isCollapsed && !isProfileApproved && (
        <div className="p-4 mx-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-xs text-yellow-800">
            <div className="font-medium mb-2">Complete these steps:</div>
            <div className="space-y-2">
              <div className={`flex items-center ${doctorData.profileComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                <span className="mr-2">{doctorData.profileComplete ? '✅' : '⭕'}</span>
                <span>Basic Profile</span>
              </div>
              <div className={`flex items-center ${(doctorData.documentsUploaded && doctorData.hasAllDocuments) ? 'text-green-600' : 'text-yellow-600'}`}>
                <span className="mr-2">{(doctorData.documentsUploaded && doctorData.hasAllDocuments) ? '✅' : '⭕'}</span>
                <span>Documents Upload</span>
              </div>
              <div className={`flex items-center ${doctorData.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                <span className="mr-2">{doctorData.status === 'APPROVED' ? '✅' : '⏳'}</span>
                <span>Admin Approval</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isCollapsed && isProfileApproved && (
        <div className="p-4 mx-4 mb-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-xs text-green-800 text-center">
            <div className="font-medium flex items-center justify-center">
              <CheckCircle size={16} className="mr-1" />
              Profile Verified!
            </div>
            <div className="mt-1">All features unlocked</div>
          </div>
        </div>
      )}

      {!isCollapsed && emergencyCount > 0 && isProfileApproved && (
        <div className="p-4 mx-4 mb-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
          <div className="text-xs text-red-800 text-center">
            <div className="font-medium flex items-center justify-center text-red-600">
              <Heart size={16} className="mr-1" />
              {emergencyCount} Emergency Request{emergencyCount > 1 ? 's' : ''}
            </div>
            <div className="mt-1">Requiring immediate attention</div>
            <button
              onClick={() => handleItemClick({ id: 'emergency', locked: !isProfileApproved })}
              className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm underline"
            >
              View Now →
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-3 px-4'} py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm group relative`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;
