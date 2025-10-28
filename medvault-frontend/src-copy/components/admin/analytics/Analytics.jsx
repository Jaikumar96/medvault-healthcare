import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, LineElement, PointElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  TrendingUp, Users, Activity, RefreshCw, Calendar, 
  BarChart3, PieChart, LineChart, AlertCircle, 
  Download, FileText, Filter 
} from 'lucide-react';
import axios from 'axios';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, LineElement, PointElement
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFilter]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/admin/analytics', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        params: { period: timeFilter }
      });
      setAnalyticsData(response.data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: { font: { size: 11 }, color: 'rgba(0, 0, 0, 0.6)' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: 'rgba(0, 0, 0, 0.6)' }
      }
    }
  };

  // Role Distribution Chart Data
  const getRoleDistributionData = () => {
    if (!analyticsData?.roleDistribution) {
      return {
        labels: ['Patients', 'Doctors', 'Admins'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#EF4444', '#10B981', '#6366F1'],
          borderWidth: 3,
          borderColor: '#ffffff'
        }]
      };
    }

    return {
      labels: ['Patients', 'Doctors', 'Admins'],
      datasets: [{
        data: [
          analyticsData.roleDistribution.PATIENT || 0,
          analyticsData.roleDistribution.DOCTOR || 0,
          analyticsData.roleDistribution.ADMIN || 0
        ],
        backgroundColor: ['#EF4444', '#10B981', '#6366F1'],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBackgroundColor: ['#DC2626', '#059669', '#4F46E5']
      }]
    };
  };

  // Request Status Chart Data
  const getRequestStatusData = () => {
    if (!analyticsData?.requestStatusDistribution) {
      return {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#F59E0B', '#10B981', '#EF4444'],
          borderWidth: 3,
          borderColor: '#ffffff'
        }]
      };
    }

    return {
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [{
        data: [
          analyticsData.requestStatusDistribution.PENDING || 0,
          analyticsData.requestStatusDistribution.APPROVED || 0,
          analyticsData.requestStatusDistribution.REJECTED || 0
        ],
        backgroundColor: ['#F59E0B', '#10B981', '#EF4444'],
        borderWidth: 3,
        borderColor: '#ffffff'
      }]
    };
  };

  // Monthly Registration Trend Data
  const getMonthlyTrendData = () => {
    if (!analyticsData?.monthlyRegistrations || analyticsData.monthlyRegistrations.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return {
        labels: months,
        datasets: [{
          label: 'New Registrations',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    const data = [];

    analyticsData.monthlyRegistrations.forEach(item => {
      const monthIndex = item[0] - 1;
      const year = item[1];
      const count = item[2];
      
      labels.push(`${months[monthIndex]} ${year}`);
      data.push(count);
    });

    return {
      labels,
      datasets: [{
        label: 'New Registrations',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    };
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 size={32} className="mr-3 text-indigo-600" />
                  System Analytics & Insights
                </h1>
                <p className="text-gray-600 mt-2">Comprehensive data analysis and performance metrics</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={exportData}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={16} />
                  <span>Export Data</span>
                </button>
                <button
                  onClick={fetchAnalyticsData}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Metrics</option>
                  <option value="users">User Analytics</option>
                  <option value="requests">Request Analytics</option>
                  <option value="activity">Activity Metrics</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {analyticsData ? (
          <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analyticsData.roleDistribution && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Users size={20} className="mr-2 text-blue-600" />
                    User Distribution
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Patients</span>
                      <span className="font-bold text-red-600">
                        {analyticsData.roleDistribution.PATIENT || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Doctors</span>
                      <span className="font-bold text-green-600">
                        {analyticsData.roleDistribution.DOCTOR || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Admins</span>
                      <span className="font-bold text-indigo-600">
                        {analyticsData.roleDistribution.ADMIN || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {analyticsData.requestStatusDistribution && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText size={20} className="mr-2 text-orange-600" />
                    Request Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-bold text-amber-600">
                        {analyticsData.requestStatusDistribution.PENDING || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Approved</span>
                      <span className="font-bold text-green-600">
                        {analyticsData.requestStatusDistribution.APPROVED || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rejected</span>
                      <span className="font-bold text-red-600">
                        {analyticsData.requestStatusDistribution.REJECTED || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Activity size={20} className="mr-2 text-purple-600" />
                  System Health
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-bold text-green-600">99.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Sessions</span>
                    <span className="font-bold text-blue-600">247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-bold text-indigo-600">120ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* User Distribution Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <PieChart size={24} className="mr-3 text-indigo-600" />
                  User Role Distribution
                </h3>
                <div style={{ height: '400px' }}>
                  <Doughnut data={getRoleDistributionData()} options={chartOptions} />
                </div>
              </div>

              {/* Request Status Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <PieChart size={24} className="mr-3 text-orange-600" />
                  Access Request Status
                </h3>
                <div style={{ height: '400px' }}>
                  <Doughnut data={getRequestStatusData()} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <LineChart size={24} className="mr-3 text-blue-600" />
                Registration Trends Over Time
              </h3>
              <div style={{ height: '400px' }}>
                <Line data={getMonthlyTrendData()} options={chartOptions} />
              </div>
            </div>

            {/* Monthly Registrations Table */}
            {analyticsData.monthlyRegistrations && analyticsData.monthlyRegistrations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Registration Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registrations
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.monthlyRegistrations.map((month, index) => {
                        const monthName = new Date(month[1], month[0] - 1).toLocaleString('default', { month: 'long' });
                        const prevMonth = index > 0 ? analyticsData.monthlyRegistrations[index - 1][2] : 0;
                        const growth = prevMonth > 0 ? (((month[2] - prevMonth) / prevMonth) * 100).toFixed(1) : 0;
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {monthName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {month[1]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {month[2]} users
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                growth > 0 ? 'bg-green-100 text-green-800' : 
                                growth < 0 ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {growth > 0 ? '+' : ''}{growth}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data Available</h3>
            <p className="text-gray-600">Analytics data will appear here once the system starts collecting metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
