import React from 'react';
import { 
  Bell, RefreshCw, Settings, Moon, Sun, 
  Calendar, Clock, Users, Activity 
} from 'lucide-react';

const AdminHeader = ({ pendingRequests, onRefresh, user }) => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {getGreeting()}, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600 flex items-center mt-1">
              <Activity size={14} className="mr-1" />
              System Administrator Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Real-time Clock */}
          <div className="text-right bg-gray-50 rounded-lg px-4 py-2">
            <div className="text-lg font-bold text-gray-900 font-mono">
              {currentTime.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <Calendar size={10} className="mr-1" />
              {currentTime.toLocaleDateString('en-IN', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                title="Refresh Dashboard Data"
              >
                <RefreshCw size={18} />
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors">
                <Bell size={18} />
              </button>
              {pendingRequests && pendingRequests.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {pendingRequests.length}
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
