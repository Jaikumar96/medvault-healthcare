import React from 'react';
import { 
  Calendar, 
  CheckCircle, 
  FileText, 
  ArrowRight, 
  Activity,
  Heart,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  User,
  AlertCircle,
  XCircle,
  Stethoscope,
  MapPin,
  Phone,
  Star,
  ChevronRight,
  Zap
} from 'lucide-react';

const DashboardOverview = ({ stats, appointments, records, prescriptions, setActiveTab, patientStatus, profileComplete }) => {
  const isProfileApproved = patientStatus === 'APPROVED' && profileComplete;

  const getProfileStatusMessage = () => {
    switch (patientStatus) {
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
          message: 'Your profile has been approved! You can now book appointments.',
          icon: CheckCircle,
          color: 'green'
        };
      default:
        return {
          title: 'Complete Your Profile',
          message: 'Please complete your profile setup to start booking appointments.',
          icon: User,
          color: 'blue'
        };
    }
  };

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
            {(!profileComplete || patientStatus === 'REJECTED') && (
              <button
                onClick={() => setActiveTab('profile')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center mx-auto"
              >
                <User size={20} className="mr-2" />
                {!profileComplete ? 'Complete Profile Setup' : 'Review & Resubmit Profile'}
              </button>
            )}
            
            {profileComplete && patientStatus === 'PENDING' && (
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-semibold mb-4 text-gray-900">Verification Progress:</h4>
                <ul className="text-sm space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                    <span>Profile information submitted</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle size={16} className="text-green-600 mr-3 flex-shrink-0" />
                    <span>Government ID uploaded</span>
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

  // Find next appointment
  const now = new Date();
  const nextAppointment = appointments
    .filter(apt => 
      apt.status === 'APPROVED' && 
      apt.timeSlot && 
      new Date(apt.timeSlot.startTime) > now
    )
    .sort((a, b) => new Date(a.timeSlot.startTime) - new Date(b.timeSlot.startTime))[0];

  const formatNextAppointment = (app) => {
    if (!app) return { date: "No upcoming appointments", doctor: "Schedule your next visit", time: "" };
    
    const appointmentDate = new Date(app.timeSlot.startTime);
    const date = appointmentDate.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    const time = appointmentDate.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const doctorName = app.doctor ? `Dr. ${app.doctor.firstName} ${app.doctor.lastName}` : 'Your Doctor';
    const specialization = app.doctor ? app.doctor.specialization : '';
    
    return { 
      date, 
      time,
      doctor: doctorName,
      specialization
    };
  };

  const { date: nextApptDate, time: nextApptTime, doctor: nextApptDoctor, specialization } = formatNextAppointment(nextAppointment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        
        {/* Modern Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}! 👋
              </h1>
              <p className="text-gray-600 text-lg">Here's your health overview for today</p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 text-sm font-medium">Profile Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Next Appointment Hero Card */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl shadow-xl">
              <div className="absolute inset-0 bg-black opacity-5"></div>
              <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-20 -translate-y-20">
                <div className="w-full h-full bg-white opacity-5 rounded-full"></div>
              </div>
              <div className="relative p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-blue-100 font-semibold text-lg">Next Appointment</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{nextApptDate}</h2>
                    {nextApptTime && <p className="text-blue-100 text-xl mb-1">at {nextApptTime}</p>}
                    <p className="text-blue-100 mb-1">with {nextApptDoctor}</p>
                    {specialization && (
                      <div className="flex items-center text-blue-200 text-sm">
                        <Stethoscope size={14} className="mr-1" />
                        {specialization}
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-24 h-24 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center">
                      <Heart size={40} className="text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-8">
                  <button 
                    onClick={() => setActiveTab('book-appointment')}
                    className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center shadow-lg"
                  >
                    <Plus size={18} className="mr-2" />
                    Book New Appointment
                  </button>
                  {nextAppointment && (
                    <button
                      onClick={() => setActiveTab('my-appointments')}
                      className="bg-blue-500 bg-opacity-30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-opacity-40 transition-all flex items-center backdrop-blur-sm border border-white border-opacity-20"
                    >
                      <Eye size={18} className="mr-2" />
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <HealthStatCard 
                icon={CheckCircle} 
                title="Completed Consultations" 
                value={stats.completedVisits} 
                color="green"
                trend="+2 this month"
                onClick={() => setActiveTab('my-appointments')} 
              />
              <HealthStatCard 
                icon={Calendar} 
                title="Upcoming Visits" 
                value={stats.upcomingAppointments} 
                color="blue"
                trend="Next 30 days"
                onClick={() => setActiveTab('my-appointments')} 
              />
            </div>

            {/* Recent Activity */}
            <RecentActivity 
              appointments={appointments}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <QuickActions setActiveTab={setActiveTab} />
            <HealthInsights />
            <UpcomingReminders appointments={appointments} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Health Stat Card with Modern Design
const HealthStatCard = ({ icon: Icon, title, value, color, trend, onClick }) => {
  const colorClasses = {
    green: { 
      bg: 'from-green-500 to-emerald-600', 
      light: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      ring: 'ring-green-100'
    },
    blue: { 
      bg: 'from-blue-500 to-indigo-600', 
      light: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      ring: 'ring-blue-100'
    }
  };
  
  const colors = colorClasses[color];
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border ${colors.border} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
        <div className={`w-full h-full ${colors.light} rounded-full opacity-30`}></div>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className={`w-14 h-14 bg-gradient-to-r ${colors.bg} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-4xl font-bold text-gray-900">{value}</h3>
          <p className="text-gray-600 font-semibold text-lg">{title}</p>
          <div className={`${colors.light} ${colors.text} text-sm font-medium px-3 py-1.5 rounded-lg inline-flex items-center`}>
            <TrendingUp size={14} className="mr-1" />
            {trend}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Recent Activity Component
const RecentActivity = ({ appointments, setActiveTab }) => {
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const getPatientName = (appointment) => {
    if (appointment.doctor) {
      return `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName || ''}`;
    }
    return `Doctor ID: ${appointment.doctorId}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      
      
      <div className="p-6">
        {recentAppointments.length > 0 ? (
          <div className="space-y-4">
            {recentAppointments.map((appointment, index) => (
              <div key={appointment.id} className={`flex items-center justify-between p-4 ${index === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'} rounded-xl hover:bg-opacity-80 transition-colors`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${index === 0 ? 'bg-blue-100' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
                    <Stethoscope size={18} className={index === 0 ? 'text-blue-600' : 'text-gray-600'} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {getPatientName(appointment)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.doctor?.specialization || 'General Consultation'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {appointment.timeSlot ? 
                      new Date(appointment.timeSlot.startTime).toLocaleDateString('en-IN') : 
                      new Date(appointment.createdAt).toLocaleDateString('en-IN')
                    }
                  </p>
                  <StatusBadge status={appointment.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-blue-500" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">No Recent Activity</h4>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">Start your healthcare journey by booking your first appointment with our qualified doctors</p>
            <button 
              onClick={() => setActiveTab('book-appointment')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Book Your First Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Status Badge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'APPROVED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed', dot: 'bg-green-500' },
    'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', dot: 'bg-yellow-500' },
    'COMPLETED': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', dot: 'bg-blue-500' },
    'REJECTED': { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', dot: 'bg-red-500' }
  };

  const config = statusConfig[status] || statusConfig['PENDING'];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <div className={`w-2 h-2 ${config.dot} rounded-full mr-2`}></div>
      {config.label}
    </span>
  );
};

// Modern Quick Actions Component
const QuickActions = ({ setActiveTab }) => {
  const actions = [
    {
      icon: Plus,
      title: 'Book Appointment',
      description: 'Find & schedule with doctors',
      color: 'from-green-500 to-emerald-600',
      action: () => setActiveTab('book-appointment'),
      highlighted: true
    },
    {
      icon: Eye,
      title: 'Medical Records',
      description: 'View your health history',
      color: 'from-blue-500 to-indigo-600',
      action: () => setActiveTab('records')
    },
    {
      icon: Zap,
      title: 'Emergency',
      description: 'Quick emergency assistance',
      color: 'from-red-500 to-pink-600',
      action: () => setActiveTab('emergency')
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
          <Zap size={16} className="text-white" />
        </div>
        Quick Actions
      </h3>
      <div className="space-y-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`w-full p-4 rounded-xl transition-all duration-200 text-left group ${
                action.highlighted 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'border-2 border-gray-100 hover:border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  action.highlighted 
                    ? 'bg-white bg-opacity-20' 
                    : `bg-gradient-to-r ${action.color}`
                }`}>
                  <Icon className={`w-6 h-6 ${action.highlighted ? 'text-white' : 'text-white'}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-lg ${action.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {action.title}
                  </h4>
                  <p className={`text-sm ${action.highlighted ? 'text-green-100' : 'text-gray-600'}`}>
                    {action.description}
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 ${action.highlighted ? 'text-white' : 'text-gray-400'} group-hover:translate-x-1 transition-transform`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Health Insights Component
const HealthInsights = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-200 p-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Heart size={20} className="text-white" />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 mb-3 text-lg">💡 Health Tip of the Day</h4>
          <p className="text-indigo-800 leading-relaxed mb-4">
            Regular health check-ups can help detect issues early and keep you feeling your best. 
            Don't forget to schedule your annual wellness visit!
          </p>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-indigo-700">Stay Healthy & Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Upcoming Reminders Component
const UpcomingReminders = ({ appointments }) => {
  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'APPROVED' && apt.timeSlot && new Date(apt.timeSlot.startTime) > new Date())
    .sort((a, b) => new Date(a.timeSlot.startTime) - new Date(b.timeSlot.startTime))
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
          <Clock size={16} className="text-white" />
        </div>
        Upcoming Reminders
      </h3>
      
      {upcomingAppointments.length > 0 ? (
        <div className="space-y-4">
          {upcomingAppointments.map((appointment, index) => (
            <div key={appointment.id} className="flex items-center space-x-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(appointment.timeSlot.startTime).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No upcoming appointments</p>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
