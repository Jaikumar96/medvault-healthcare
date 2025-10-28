import React, { useState } from 'react';
import {
  UsersIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  UserGroupIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';
import Charts from './Charts';

const DashboardOverview = ({ 
  totalUsers,
  totalDoctors, 
  totalPatients,
  totalAdmins,
  newUsersThisMonth,
  pendingRequests,
  recentActivities,
  analyticsData,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('registrations');

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      icon: UsersIcon,
      color: 'blue',
      trend: `+${newUsersThisMonth} this month`,
      change: 'positive'
    },
    {
      title: 'Active Doctors',
      value: totalDoctors.toString(),
      icon: UserPlusIcon,
      color: 'emerald',
      trend: 'Medical professionals',
      change: 'positive'
    },
    {
      title: 'Total Patients',
      value: totalPatients.toString(),
      icon: UserGroupIcon,
      color: 'cyan',
      trend: 'Registered patients',
      change: 'positive'
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length.toString(),
      icon: ClipboardDocumentListIcon,
      color: 'amber',
      trend: 'Awaiting approval',
      change: 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Real-time system statistics and insights</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid - Top Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} index={index} />
        ))}
      </div>

      {/* Main Content Grid - Charts and Activities Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts Section - Takes 2/3 of the space */}
        <div className="xl:col-span-2">
          <Charts 
            totalPatients={totalPatients}
            totalDoctors={totalDoctors}
            totalUsers={totalUsers}
            analyticsData={analyticsData}
          />
        </div>

        {/* Recent Activities Sidebar - Takes 1/3 of the space */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
              <div className="relative">
                <select 
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="registrations">All Registrations</option>
                  <option value="requests">All Requests</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-3 pr-2">
                {/* All Registrations Tab */}
                {activeTab === 'registrations' && (
                  <>
                    {recentActivities?.recentUsers && recentActivities.recentUsers.length > 0 ? (
                      recentActivities.recentUsers.map((user, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <UsersIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{user[1]} {user[2]}</p>
                            <p className="text-sm text-gray-600 truncate">{user[3]} • {user[4]}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(user[5]).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-400">No registrations yet</p>
                        <p className="text-sm text-gray-400 mt-1">User registrations will appear here</p>
                      </div>
                    )}
                  </>
                )}

                {/* All Requests Tab */}
                {activeTab === 'requests' && (
                  <>
                    {recentActivities?.recentRequests && recentActivities.recentRequests.length > 0 ? (
                      recentActivities.recentRequests.map((request, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <DocumentPlusIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{request[1]} {request[2]}</p>
                            <p className="text-sm text-gray-600 truncate">{request[3]} • {request[4]}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                request[6] === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                request[6] === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {request[6]}
                              </span>
                              <p className="text-xs text-gray-500">
                                {new Date(request[7] || request[5]).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-400">No access requests</p>
                        <p className="text-sm text-gray-400 mt-1">Access requests will appear here</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Summary Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {activeTab === 'registrations' 
                    ? `${recentActivities?.recentUsers?.length || 0} Total Registrations`
                    : `${recentActivities?.recentRequests?.length || 0} Total Requests`
                  }
                </span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    activeTab === 'registrations' ? 'bg-green-500' : 'bg-amber-500'
                  } animate-pulse`}></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
