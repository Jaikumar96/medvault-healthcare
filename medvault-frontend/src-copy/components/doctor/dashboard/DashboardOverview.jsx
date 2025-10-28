import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Plus,
  Stethoscope,
  Activity,
  CheckCircle,
  User,
  XCircle
} from 'lucide-react';

const DashboardOverview = ({ stats, setActiveTab, loading, doctorStatus, profileComplete }) => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  const isProfileApproved = doctorStatus === 'APPROVED' && profileComplete;

  useEffect(() => {
    if (isProfileApproved) {
      fetchTodaySchedule();
    }
  }, [isProfileApproved]);

  const fetchTodaySchedule = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) return;
      
      const response = await fetch(`http://localhost:8080/api/doctor/appointments/${user.id}`);
      if (response.ok) {
        const appointments = await response.json();
        const today = new Date().toISOString().split('T')[0];
        
        const todayAppts = appointments.filter(app => 
          app.timeSlot && 
          app.timeSlot.startTime.startsWith(today) && 
          app.status === 'APPROVED'
        );
        
        const upcoming = appointments.filter(app =>
          app.timeSlot &&
          new Date(app.timeSlot.startTime) > new Date() &&
          app.status === 'APPROVED'
        ).slice(0, 3);
        
        setTodayAppointments(todayAppts);
        setUpcomingAppointments(upcoming);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const getProfileStatusMessage = () => {
    switch (doctorStatus) {
      case 'PENDING':
        return {
          title: 'Profile Under Review',
          message: 'Your profile is being verified by our admin team. This typically takes 1-2 business days.',
          icon: AlertCircle,
          color: 'yellow'
        };
      case 'REJECTED':
        return {
          title: 'Profile Verification Failed',
          message: 'Your profile verification was rejected. Please review and resubmit your documents.',
          icon: XCircle,
          color: 'red'
        };
      case 'APPROVED':
        return {
          title: 'Profile Verified Successfully',
          message: 'Your profile has been approved! You can now access all features.',
          icon: CheckCircle,
          color: 'green'
        };
      default:
        return {
          title: 'Complete Your Profile',
          message: 'Please complete your profile setup to start accepting appointments.',
          icon: User,
          color: 'blue'
        };
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show profile completion message if not approved
  if (!isProfileApproved) {
    const statusInfo = getProfileStatusMessage();
    const StatusIcon = statusInfo.icon;
    
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      green: 'bg-green-50 border-green-200 text-green-800'
    };

    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className={`rounded-xl border p-8 text-center ${colorClasses[statusInfo.color]} max-w-4xl mx-auto mt-20`}>
          <StatusIcon size={64} className="mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-bold mb-4">{statusInfo.title}</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">{statusInfo.message}</p>
          
          <div className="space-y-4">
            {(!profileComplete || doctorStatus === 'REJECTED') && (
              <button
                onClick={() => setActiveTab('profile')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center mx-auto"
              >
                <User size={20} className="mr-2" />
                {!profileComplete ? 'Complete Profile Setup' : 'Review & Resubmit Profile'}
              </button>
            )}
            
            {profileComplete && doctorStatus === 'PENDING' && (
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-semibold mb-4 text-gray-900">Verification Progress:</h4>
                <ul className="text-sm space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                    <span>Profile information submitted</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                    <span>Documents uploaded</span>
                  </li>
                  <li className="flex items-center">
                    <Clock size={16} className="text-yellow-600 mr-3 flex-shrink-0" />
                    <span>Admin review in progress</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    You'll receive an email notification once your profile is approved.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard for approved users
  const statCards = [
    { 
      title: "Today's Appointments", 
      value: stats.todayAppointments || 0, 
      icon: Calendar, 
      color: 'blue',
      change: '+12%',
      action: () => setActiveTab('schedule')
    },
    { 
      title: 'Total Patients', 
      value: stats.totalPatients || 0, 
      icon: Users, 
      color: 'green',
      change: '+8%',
      action: () => setActiveTab('patients')
    },
    { 
      title: 'Pending Reviews', 
      value: stats.pendingReviews || 0, 
      icon: AlertCircle, 
      color: 'yellow',
      change: stats.pendingReviews > 0 ? 'Action needed' : 'All clear',
      action: () => setActiveTab('appointments')
    },
    { 
      title: 'Monthly Earnings', 
      value: `₹${((stats.monthlyEarnings || 0) / 1000).toFixed(0)}K`, 
      icon: TrendingUp, 
      color: 'purple',
      change: '+15%',
      action: () => setActiveTab('analytics')
    }
  ];

  const quickActions = [
    {
      title: 'Add Time Slot',
      description: 'Create new availability',
      icon: Plus,
      color: 'blue',
      action: () => setActiveTab('schedule')
    },
    {
      title: 'View Patients',
      description: 'Access patient records',
      icon: Users,
      color: 'green',
      action: () => setActiveTab('patients')
    },
    {
      title: 'New Prescription',
      description: 'Write prescription',
      icon: FileText,
      color: 'purple',
      action: () => setActiveTab('prescriptions')
    },
    {
      title: 'Analytics',
      description: 'View performance',
      icon: Activity,
      color: 'orange',
      action: () => setActiveTab('analytics')
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Message for Approved Users */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center">
          <CheckCircle size={24} className="text-green-600 mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Welcome back, Dr. {JSON.parse(localStorage.getItem('user')).firstName}!</h2>
            <p className="text-gray-600">Your profile is verified and you're ready to manage appointments.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <TodaySchedule 
            appointments={todayAppointments}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions actions={quickActions} />
          <UpcomingAppointments 
            appointments={upcomingAppointments}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

// Enhanced StatCard component
const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  const colorClasses = {
    blue: { 
      bg: 'from-blue-500 to-blue-600', 
      text: 'text-blue-600',
      border: 'border-blue-200',
      bgLight: 'bg-blue-50'
    },
    green: { 
      bg: 'from-green-500 to-green-600', 
      text: 'text-green-600',
      border: 'border-green-200',
      bgLight: 'bg-green-50'
    },
    yellow: { 
      bg: 'from-yellow-500 to-yellow-600', 
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      bgLight: 'bg-yellow-50'
    },
    purple: { 
      bg: 'from-purple-500 to-purple-600', 
      text: 'text-purple-600',
      border: 'border-purple-200',
      bgLight: 'bg-purple-50'
    }
  };
  
  const colors = colorClasses[stat.color];
  
  return (
    <div 
      onClick={stat.action}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colors.bg} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
        <p className="text-gray-600 font-medium text-sm">{stat.title}</p>
        <div className={`text-xs font-semibold ${colors.text} ${colors.bgLight} px-2 py-1 rounded-full inline-block`}>
          {stat.change}
        </div>
      </div>
    </div>
  );
};

// Today's Schedule component
const TodaySchedule = ({ appointments, setActiveTab }) => {
  const formatTime = (dateTime) => 
    new Date(dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const getPatientName = (appointment) => {
    if (appointment.patient && appointment.patient.firstName) {
      return `${appointment.patient.firstName} ${appointment.patient.lastName || ''}`;
    }
    return `Patient ID: ${appointment.patientId}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
              <p className="text-sm text-gray-600">{appointments.length} appointments scheduled</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('schedule')}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.slice(0, 4).map(app => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getPatientName(app)}
                    </p>
                    <p className="text-sm text-gray-600">{app.patientNotes || "Regular checkup"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-700 bg-blue-200 px-3 py-1 rounded-lg text-sm">
                    {formatTime(app.timeSlot.startTime)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Day!</h3>
            <p className="text-gray-600 mb-4">No appointments scheduled for today</p>
            <button 
              onClick={() => setActiveTab('schedule')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add time slots →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Actions component
const QuickActions = ({ actions }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group"
            >
              <div className={`w-8 h-8 bg-gradient-to-r ${colorClasses[action.color]} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">{action.title}</h4>
              <p className="text-xs text-gray-600">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Upcoming Appointments component
const UpcomingAppointments = ({ appointments, setActiveTab }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-green-600" />
          Upcoming
        </h3>
        <button 
          onClick={() => setActiveTab('appointments')}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>
      
      {appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map(app => (
            <div key={app.id} className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {app.patient ? `${app.patient.firstName} ${app.patient.lastName || ''}` : `Patient ${app.patientId}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(app.timeSlot.startTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {new Date(app.timeSlot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No upcoming appointments</p>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
