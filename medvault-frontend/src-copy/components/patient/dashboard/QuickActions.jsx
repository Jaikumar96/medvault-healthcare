import React from 'react';
import {
  CalendarDaysIcon,
  EyeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const QuickActions = ({ setActiveTab }) => {
  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule with your preferred doctor',
      icon: CalendarDaysIcon,
      color: 'blue',
      action: () => setActiveTab('appointments')
    },
    {
      title: 'View Records',
      description: 'Access your medical history',
      icon: EyeIcon,
      color: 'emerald',
      action: () => setActiveTab('records')
    },
    {
      title: 'Medications',
      description: 'Manage your prescriptions',
      icon: ClipboardDocumentListIcon,
      color: 'amber',
      action: () => setActiveTab('prescriptions')
    }
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500'
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm text-center">
              <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[action.color]} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{action.description}</p>
              <button 
                onClick={action.action}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-md transition-shadow"
              >
                Get Started
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
