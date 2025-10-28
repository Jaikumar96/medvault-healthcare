import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, LineElement, PointElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { TrendingUp, Users, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, LineElement, PointElement
);

const Charts = ({ totalPatients, totalDoctors, totalUsers, analyticsData }) => {
  // Enhanced chart options for healthcare dashboards
  const commonOptions = {
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

  // User Growth Data
  const getUserGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return {
      labels: months,
      datasets: [
        {
          label: 'New Patients',
          data: [12, 19, 15, 25, 22, 30],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          borderRadius: 8
        },
        {
          label: 'New Doctors',
          data: [3, 5, 4, 7, 6, 8],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 8
        }
      ]
    };
  };

  // User Distribution Data
  const getUserTypeData = () => {
    return {
      labels: ['Patients', 'Doctors', 'Administrators'],
      datasets: [{
        data: [totalPatients, totalDoctors, totalUsers - totalPatients - totalDoctors],
        backgroundColor: ['#EF4444', '#10B981', '#6366F1'],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBackgroundColor: ['#DC2626', '#059669', '#4F46E5']
      }]
    };
  };

  // Activity Trend Data
  const getActivityData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      labels: days,
      datasets: [{
        label: 'Daily Activity',
        data: [65, 59, 80, 81, 76, 85, 90],
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

  return (
    <div className="space-y-8">
      {/* User Registration Trends */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp size={24} className="mr-3 text-blue-600" />
              Healthcare Registration Trends
            </h3>
            <p className="text-gray-600 mt-1">Monthly patient and doctor registrations</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
        </div>
        <div style={{ height: '400px' }}>
          <Bar data={getUserGrowthData()} options={commonOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Users size={20} className="mr-3 text-purple-600" />
                User Distribution
              </h3>
              <p className="text-gray-600 text-sm">System role breakdown</p>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <Doughnut data={getUserTypeData()} options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                legend: { position: 'bottom' }
              }
            }} />
          </div>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xl font-bold text-red-500">{totalPatients}</div>
              <div className="text-xs text-gray-600">Patients</div>
              <div className="text-xs text-gray-500">
                {totalUsers > 0 ? ((totalPatients / totalUsers) * 100).toFixed(0) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-500">{totalDoctors}</div>
              <div className="text-xs text-gray-600">Doctors</div>
              <div className="text-xs text-gray-500">
                {totalUsers > 0 ? ((totalDoctors / totalUsers) * 100).toFixed(0) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-500">
                {Math.max(1, totalUsers - totalPatients - totalDoctors)}
              </div>
              <div className="text-xs text-gray-600">Admins</div>
              <div className="text-xs text-gray-500">
                {totalUsers > 0 ? (((totalUsers - totalPatients - totalDoctors) / totalUsers) * 100).toFixed(0) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Activity size={20} className="mr-3 text-green-600" />
                System Activity
              </h3>
              <p className="text-gray-600 text-sm">Weekly usage patterns</p>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <Line data={getActivityData()} options={commonOptions} />
          </div>
          
          {/* Activity Insights */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-600">87%</div>
                <div className="text-xs text-blue-700">System Uptime</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600">42</div>
                <div className="text-xs text-green-700">Avg Daily Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
