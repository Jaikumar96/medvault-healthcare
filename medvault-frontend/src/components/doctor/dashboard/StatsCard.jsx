import React from 'react';

const StatsCard = ({ stat, index }) => {
  const Icon = stat.icon;
  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500'
  };
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-r ${colorClasses[stat.color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {parseInt(stat.value) > 0 && (
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
        <p className="text-gray-600 font-medium text-sm">{stat.title}</p>
      </div>
    </div>
  );
};

export default StatsCard;
