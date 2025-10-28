import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Heart, Activity, AlertTriangle, Clock, User } from 'lucide-react';

const PatientHeader = ({ user, stats }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced greeting function with proper time ranges[49][51]
  const getGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return { text: 'Good morning'};
    } else if (hour >= 12 && hour < 17) {
      return { text: 'Good afternoon' };
    } else if (hour >= 17 && hour < 21) {
      return { text: 'Good evening' };
    } else {
      return { text: 'Good night' };
    }
  };

  const getHealthStatus = () => {
    if (stats.upcomingAppointments > 0) return { status: 'Active Care', color: 'green' };
    if (stats.completedVisits > 0) return { status: 'Monitored', color: 'blue' };
    return { status: 'Welcome', color: 'gray' };
  };

  const greeting = getGreeting();
  const healthStatus = getHealthStatus();
  const notificationCount = stats.upcomingAppointments + stats.pendingReports;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Personal greeting with dynamic time-based message */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                {greeting.text}, {user.firstName}! 
                <span className="ml-2 text-2xl">{greeting.emoji}</span>
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-gray-600 text-sm flex items-center">
                  <Heart size={14} className="mr-1.5 text-red-500" />
                  Health Status: <span className={`ml-1 font-medium ${
                    healthStatus.color === 'green' ? 'text-green-600' : 
                    healthStatus.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {healthStatus.status}
                  </span>
                </p>
                {stats.upcomingAppointments > 0 && (
                  <p className="text-sm text-blue-600 font-medium flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {stats.upcomingAppointments} upcoming appointment{stats.upcomingAppointments !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Health metrics and notifications */}
          <div className="flex items-center space-x-6">
            {/* Quick health stats */}
            

            {/* Current time - updates every second */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 font-mono">
                {currentTime.toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true 
                })}
              </div>
              <div className="text-xs text-gray-500">
                {currentTime.toLocaleDateString('en-IN', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100"
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {notificationCount}
                  </div>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Health Updates</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {stats.upcomingAppointments > 0 && (
                      <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Upcoming Appointments
                            </p>
                            <p className="text-xs text-gray-500">
                              You have {stats.upcomingAppointments} appointment{stats.upcomingAppointments > 1 ? 's' : ''} scheduled
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {stats.pendingReports > 0 && (
                      <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AlertTriangle size={16} className="text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Pending Reports
                            </p>
                            <p className="text-xs text-gray-500">
                              {stats.pendingReports} medical report{stats.pendingReports > 1 ? 's' : ''} pending review
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {notificationCount === 0 && (
                      <div className="p-6 text-center">
                        <Bell size={24} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">All caught up!</p>
                        <p className="text-xs text-gray-400">No new health updates</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
