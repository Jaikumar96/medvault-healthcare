import React from 'react';
import {
  CalendarDaysIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';
import TodaySchedule from './TodaySchedule';
import QuickActions from './QuickActions';

const DashboardOverview = ({ 
  todayAppointments,
  totalPatients,
  pendingReviews,
  monthlyEarnings,
  setActiveTab
}) => {
  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.toString(),
      icon: CalendarDaysIcon,
      color: 'emerald'
    },
    {
      title: 'Total Patients',
      value: totalPatients.toString(),
      icon: UsersIcon,
      color: 'blue'
    },
    {
      title: 'Pending Reviews',
      value: pendingReviews.toString(),
      icon: DocumentTextIcon,
      color: 'amber'
    },
    {
      title: 'This Month',
      value: monthlyEarnings > 0 ? `₹${(monthlyEarnings / 1000).toFixed(1)}K` : '₹0',
      icon: ChartBarIcon,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} index={index} />
        ))}
      </div>

      {/* Today's Schedule */}
      <TodaySchedule 
        todayAppointments={todayAppointments}
        setActiveTab={setActiveTab}
      />

      {/* Quick Actions */}
      <QuickActions setActiveTab={setActiveTab} />
    </div>
  );
};

export default DashboardOverview;
