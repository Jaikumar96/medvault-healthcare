import React, { useState } from 'react';
import { 
  Users, UserPlus, ClipboardList, ArrowUp, 
  TrendingUp, Calendar, Activity, Heart,
  RefreshCw, Eye, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import Charts from './Charts';

const StatsCard = ({ stat }) => {
  const Icon = stat.icon;
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    amber: 'from-amber-500 to-amber-600'
  };
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[stat.color]} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              stat.change === 'positive' ? 'bg-green-100 text-green-700' : 
              stat.change === 'negative' ? 'bg-red-100 text-red-700' : 
              'bg-gray-100 text-gray-700'
            }`}>
              {stat.changeText}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-900">
              {stat.value}
            </h3>
            <p className="text-gray-600 font-medium">{stat.title}</p>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity, index }) => (
  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
      <Users size={16} className="text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900">{activity.name}</p>
      <p className="text-sm text-gray-600">{activity.role} • {activity.email}</p>
      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
    </div>
    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
  </div>
);

const DashboardOverview = ({ 
  totalUsers, totalDoctors, totalPatients, totalAdmins, 
  newUsersThisMonth, pendingRequests, recentActivities, 
  analyticsData, onRefresh 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 6;

  const stats = [
    {
      title: 'Total System Users',
      value: totalUsers.toString(),
      icon: Users,
      color: 'blue',
      changeText: `+${newUsersThisMonth} this month`,
      description: 'All registered users in the system',
      change: 'positive'
    },
    {
      title: 'Medical Professionals',
      value: totalDoctors.toString(),
      icon: Heart,
      color: 'emerald',
      changeText: 'Healthcare providers',
      description: 'Verified and active doctors',
      change: 'positive'
    },
    {
      title: 'Registered Patients',
      value: totalPatients.toString(),
      icon: UserPlus,
      color: 'red',
      changeText: 'Patient accounts',
      description: 'Active patient registrations',
      change: 'positive'
    },
    {
      title: 'Pending Reviews',
      value: pendingRequests?.length?.toString() || '0',
      icon: ClipboardList,
      color: 'amber',
      changeText: 'Awaiting approval',
      description: 'Access requests to review',
      change: 'neutral'
    }
  ];

  // Process recent activities for display
  const processedActivities = recentActivities?.recentUsers?.map(user => ({
    name: `${user[1]} ${user[2]}`,
    role: user[3],
    email: user[4],
    time: new Date(user[5]).toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  })) || [];

  // Pagination logic for activities
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = processedActivities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalPages = Math.ceil(processedActivities.length / activitiesPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Healthcare System Overview</h2>
          <p className="text-gray-600 mt-1">Real-time insights and system performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts Section - Full Width */}
      <div className="w-full">
        <Charts 
          totalPatients={totalPatients}
          totalDoctors={totalDoctors}
          totalUsers={totalUsers}
          analyticsData={analyticsData}
        />
      </div>

      {/* Recent Activities Section - Below Charts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity size={24} className="mr-3 text-blue-600" />
            Recent System Activity
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Showing {indexOfFirstActivity + 1}-{Math.min(indexOfLastActivity, processedActivities.length)} of {processedActivities.length}
            </span>
            
          </div>
        </div>

        {processedActivities.length > 0 ? (
          <>
            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {currentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} index={index} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h4>
            <p className="text-gray-500">System activity will appear here as users register and interact with the platform.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
