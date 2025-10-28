import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const Charts = ({ totalPatients, totalDoctors, totalUsers, analyticsData }) => {
  // Enhanced chart options for better visualization
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: 'rgba(0, 0, 0, 0.6)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: 'rgba(0, 0, 0, 0.6)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    }
  };

  // Enhanced User Growth Data
  const getUserGrowthData = () => {
    if (!analyticsData?.monthlyRegistrations || analyticsData.monthlyRegistrations.length === 0) {
      // Sample data for demo
      const currentMonth = new Date().getMonth();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const last6Months = [];
      const sampleData = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        last6Months.push(months[monthIndex]);
        sampleData.push(Math.floor(Math.random() * 50) + 10);
      }

      return {
        labels: last6Months,
        datasets: [
          {
            label: 'New Patients',
            data: sampleData.map(val => Math.floor(val * 0.7)),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'New Doctors',
            data: sampleData.map(val => Math.floor(val * 0.3)),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
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
        label: 'New Users',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }]
    };
  };

  // Enhanced User Distribution Data
  const getUserTypeData = () => {
    const adminCount = totalUsers - (totalPatients + totalDoctors);
    
    return {
      labels: ['Patients', 'Doctors', 'Admins'],
      datasets: [{
        label: 'User Distribution',
        data: [totalPatients, totalDoctors, adminCount > 0 ? adminCount : 1],
        backgroundColor: [
          'rgba(34, 197, 94, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(168, 85, 247, 0.9)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)'
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)'
        ],
        hoverBorderWidth: 3
      }]
    };
  };

  return (
    <div className="space-y-6">
      {/* User Growth Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">User Registration Trends</h3>
            <p className="text-sm text-gray-600 mt-1">Monthly registration patterns over time</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Total Users</span>
            </div>
          </div>
        </div>
        <div style={{ height: '350px' }}>
          <Bar data={getUserGrowthData()} options={barChartOptions} />
        </div>
      </div>

      {/* User Distribution Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">User Type Distribution</h3>
            <p className="text-sm text-gray-600 mt-1">Current breakdown of user roles in the system</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
        </div>
        <div style={{ height: '350px' }}>
          <Doughnut data={getUserTypeData()} options={doughnutOptions} />
        </div>
        
        {/* Summary Stats Below Chart */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{totalPatients}</div>
            <div className="text-sm text-gray-600">Patients</div>
            <div className="text-xs text-gray-500 mt-1">
              {totalUsers > 0 ? ((totalPatients / totalUsers) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalDoctors}</div>
            <div className="text-sm text-gray-600">Doctors</div>
            <div className="text-xs text-gray-500 mt-1">
              {totalUsers > 0 ? ((totalDoctors / totalUsers) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalUsers - (totalPatients + totalDoctors) > 0 ? totalUsers - (totalPatients + totalDoctors) : 1}
            </div>
            <div className="text-sm text-gray-600">Admins</div>
            <div className="text-xs text-gray-500 mt-1">
              {totalUsers > 0 ? (((totalUsers - (totalPatients + totalDoctors)) / totalUsers) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
