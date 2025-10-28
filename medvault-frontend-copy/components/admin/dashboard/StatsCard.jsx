import React from 'react';

const StatsCard = ({ stat, index }) => {
  const Icon = stat.icon;
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    emerald: 'from-emerald-500 to-teal-500',
    cyan: 'from-cyan-500 to-blue-500',
    amber: 'from-amber-500 to-orange-500'
  };
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[stat.color]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`w-3 h-3 rounded-full ${
          stat.change === 'positive' ? 'bg-emerald-500' : 
          stat.change === 'negative' ? 'bg-rose-500' : 'bg-amber-500'
        } animate-pulse`}></div>
      </div>
      <div className="space-y-2">
        <h3 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {stat.value}
        </h3>
        <p className="text-gray-600 font-semibold">{stat.title}</p>
        <p className={`text-sm font-medium ${
          stat.change === 'positive' ? 'text-emerald-600' : 
          stat.change === 'negative' ? 'text-rose-600' : 'text-amber-600'
        }`}>
          {stat.trend}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
