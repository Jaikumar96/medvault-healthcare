import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Users, AlertTriangle, ChevronDown, User, Activity, TrendingUp, Heart } from 'lucide-react';

const DoctorHeader = ({ user, stats }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [emergencyCount, setEmergencyCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch emergency count
  useEffect(() => {
    const fetchEmergencyCount = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          const response = await fetch(`http://localhost:8080/api/doctor/emergency-requests/${userData.id}`);
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
    const interval = setInterval(fetchEmergencyCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return { text: 'Good morning' };
    } else if (hour >= 12 && hour < 17) {
      return { text: 'Good afternoon' };
    } else if (hour >= 17 && hour < 21) {
      return { text: 'Good evening' };
    } else {
      return { text: 'Good night' };
    }
  };

  const greeting = getGreeting();
  const notificationCount = stats.pendingReviews + (stats.todayAppointments > 0 ? 1 : 0) + emergencyCount;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Professional greeting with doctor avatar */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {greeting.text}, Dr. {user.firstName}!
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600 text-sm flex items-center">
                <Calendar size={14} className="mr-1.5 text-blue-500" />
                You have <span className="font-semibold mx-1 text-blue-600">{stats.todayAppointments}</span> 
                appointment{stats.todayAppointments !== 1 ? 's' : ''} scheduled today
              </p>
              {stats.pendingReviews > 0 && (
                <p className="text-sm text-yellow-600 font-medium flex items-center">
                  <AlertTriangle size={14} className="mr-1" />
                  {stats.pendingReviews} pending review{stats.pendingReviews !== 1 ? 's' : ''}
                </p>
              )}
              {emergencyCount > 0 && (
                <p className="text-sm text-red-600 font-medium flex items-center animate-pulse">
                  <Heart size={14} className="mr-1" />
                  {emergencyCount} emergency request{emergencyCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Enhanced stats, time, and notifications */}
        <div className="flex items-center space-x-6">
          {/* Professional health metrics */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center space-x-1 justify-center">
                <Users size={16} className="text-emerald-500" />
                <span className="text-lg font-bold text-emerald-600">{stats.totalPatients}</span>
              </div>
              <div className="text-xs text-gray-500">Total Patients</div>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-1 justify-center">
                <TrendingUp size={16} className="text-blue-500" />
                <span className="text-lg font-bold text-blue-600">₹{(stats.monthlyEarnings / 1000).toFixed(0)}K</span>
              </div>
              <div className="text-xs text-gray-500">This Month</div>
            </div>
          </div>

          {/* Live clock with seconds */}
          <div className="text-right bg-gray-50 rounded-lg px-3 py-2 border">
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
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Enhanced notifications with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-3 rounded-xl transition-all duration-200 border shadow-sm ${
                emergencyCount > 0 
                  ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 border-red-200 animate-pulse' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-100'
              }`}
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  emergencyCount > 0 ? 'bg-red-500 animate-bounce' : 'bg-red-500 animate-pulse'
                }`}>
                  {notificationCount}
                </div>
              )}
            </button>

            {/* Professional notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Medical Updates</h3>
                    <span className="text-xs text-gray-500">
                      {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {/* Emergency Requests */}
                  {emergencyCount > 0 && (
                    <div className="p-3 hover:bg-red-50 border-b border-gray-100 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                          <Heart size={16} className="text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {emergencyCount} Emergency Request{emergencyCount > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500">Urgent patient emergencies require immediate attention</p>
                          <button className="text-xs text-red-600 font-medium mt-1 hover:text-red-700">
                            View emergencies →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.pendingReviews > 0 && (
                    <div className="p-3 hover:bg-yellow-50 border-b border-gray-100 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <AlertTriangle size={16} className="text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {stats.pendingReviews} Appointment Request{stats.pendingReviews > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500">Patient requests awaiting your approval</p>
                          <button className="text-xs text-yellow-600 font-medium mt-1 hover:text-yellow-700">
                            Review now →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {stats.todayAppointments > 0 && (
                    <div className="p-3 hover:bg-blue-50 border-b border-gray-100 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Today's Schedule</p>
                          <p className="text-xs text-gray-500">
                            {stats.todayAppointments} appointment{stats.todayAppointments > 1 ? 's' : ''} scheduled
                          </p>
                          <button className="text-xs text-blue-600 font-medium mt-1 hover:text-blue-700">
                            View schedule →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.upcomingAppointments > 0 && (
                    <div className="p-3 hover:bg-green-50 border-b border-gray-100 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Calendar size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Upcoming This Week</p>
                          <p className="text-xs text-gray-500">
                            {stats.upcomingAppointments} appointment{stats.upcomingAppointments > 1 ? 's' : ''} in the next 7 days
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {notificationCount === 0 && (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={24} className="text-gray-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">All caught up!</h4>
                      <p className="text-sm text-gray-500">No new notifications at this time</p>
                    </div>
                  )}
                </div>

                {/* Quick action footer */}
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="w-full text-xs text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Close notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;
