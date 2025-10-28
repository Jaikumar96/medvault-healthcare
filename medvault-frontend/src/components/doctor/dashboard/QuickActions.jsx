import React from 'react';
import {
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const QuickActions = ({ setActiveTab }) => {
  const quickActions = [
    {
      title: 'New Prescription',
      description: 'Write prescription for current patient',
      icon: PlusIcon,
      color: 'emerald',
      action: () => setActiveTab('prescriptions')
    },
    {
      title: 'Patient Records',
      description: 'Access and update medical records',
      icon: DocumentTextIcon,
      color: 'blue',
      action: () => setActiveTab('patients')
    },
    {
      title: 'Analytics',
      description: 'Review performance and statistics',
      icon: ChartBarIcon,
      color: 'amber',
      action: () => setActiveTab('analytics')
    },
    {
      title: 'Schedule',
      description: 'Manage appointments and availability',
      icon: ClockIcon,
      color: 'rose',
      action: () => setActiveTab('schedule')
    }
  ];

  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-500'
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm text-center">
              <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[action.color]} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 mb-3 text-sm">{action.description}</p>
              <button 
                onClick={action.action}
                className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-md transition-shadow"
              >
                Access
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
