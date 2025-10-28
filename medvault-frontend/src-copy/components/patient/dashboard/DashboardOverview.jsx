import React from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Pill, 
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
  XCircle
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
    <div className="p-6 space-y-8">
      {/* Welcome Message for Approved Users */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center">
          <CheckCircle size={24} className="text-green-600 mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Welcome back, {JSON.parse(localStorage.getItem('user')).firstName}!</h2>
            <p className="text-gray-600">Your profile is verified and you're ready to book appointments.</p>
          </div>
        </div>
      </div>

      {/* Next Appointment Hero Card */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <Clock className="w-6 h-6 mr-3" />
              <span className="text-blue-200 font-semibold text-lg">Next Appointment</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">{nextApptDate}</h2>
            {nextApptTime && <p className="text-blue-100 text-xl mb-1">at {nextApptTime}</p>}
            <p className="text-blue-100 mb-1">with {nextApptDoctor}</p>
            {specialization && <p className="text-blue-200 text-sm">{specialization}</p>}
          </div>
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Calendar size={32} className="text-white" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <button 
            onClick={() => setActiveTab('book-appointment')}
            className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Book New Appointment
          </button>
          {nextAppointment && (
            <button
              onClick={() => setActiveTab('my-appointments')}
              className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-400 transition-colors flex items-center"
            >
              <Eye size={18} className="mr-2" />
              View Details
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Health Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <HealthStatCard 
              icon={CheckCircle} 
              title="Completed Visits" 
              value={stats.completedVisits} 
              color="green"
              trend="+2 this month"
              onClick={() => setActiveTab('my-appointments')} 
            />
            <HealthStatCard 
              icon={Pill} 
              title="Active Prescriptions" 
              value={stats.activePrescriptions} 
              color="purple"
              trend="Current medications"
              onClick={() => setActiveTab('prescriptions')} 
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

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <QuickActions setActiveTab={setActiveTab} />
          <HealthInsights />
        </div>
      </div>
    </div>
  );
};

// Enhanced Health Stat Card
const HealthStatCard = ({ icon: Icon, title, value, color, trend, onClick }) => {
  const colorClasses = {
    green: { 
      bg: 'from-green-500 to-emerald-600', 
      light: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    purple: { 
      bg: 'from-purple-500 to-violet-600', 
      light: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    blue: { 
      bg: 'from-blue-500 to-indigo-600', 
      light: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200'
    }
  };
  
  const colors = colorClasses[color];
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl p-6 border ${colors.border} shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colors.bg} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <p className="text-gray-600 font-semibold">{title}</p>
        <div className={`${colors.light} ${colors.text} text-xs font-medium px-2 py-1 rounded-lg inline-block`}>
          {trend}
        </div>
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivity = ({ appointments, setActiveTab }) => {
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getPatientName = (appointment) => {
    if (appointment.doctor) {
      return `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName || ''}`;
    }
    return `Doctor ID: ${appointment.doctorId}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-600">Your latest appointments and updates</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('my-appointments')}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {recentAppointments.length > 0 ? (
          <div className="space-y-4">
            {recentAppointments.map(appointment => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getPatientName(appointment)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.doctor?.specialization || 'General Consultation'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
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
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h4>
            <p className="text-gray-600 mb-4">Start by booking your first appointment</p>
            <button 
              onClick={() => setActiveTab('book-appointment')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Book Now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'APPROVED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
    'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    'COMPLETED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
    'REJECTED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
  };

  const config = statusConfig[status] || statusConfig['PENDING'];

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Quick Actions Component
const QuickActions = ({ setActiveTab }) => {
  const actions = [
    {
      icon: Plus,
      title: 'Book Appointment',
      description: 'Schedule with doctors',
      color: 'green',
      action: () => setActiveTab('book-appointment'),
      highlighted: true
    },
    {
      icon: Eye,
      title: 'View Records',
      description: 'Medical history',
      color: 'blue',
      action: () => setActiveTab('records')
    },
    {
      icon: Pill,
      title: 'Prescriptions',
      description: 'Current medications',
      color: 'purple',
      action: () => setActiveTab('prescriptions')
    }
  ];

  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-violet-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`w-full p-4 rounded-xl transition-all duration-200 text-left ${
                action.highlighted 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                  : 'border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  action.highlighted 
                    ? 'bg-white bg-opacity-20' 
                    : `bg-gradient-to-r ${colorClasses[action.color]}`
                }`}>
                  <Icon className={`w-5 h-5 ${action.highlighted ? 'text-white' : 'text-white'}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${action.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {action.title}
                  </h4>
                  <p className={`text-sm ${action.highlighted ? 'text-green-100' : 'text-gray-600'}`}>
                    {action.description}
                  </p>
                </div>
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
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Heart size={20} className="text-indigo-600" />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 mb-2">Health Tip</h4>
          <p className="text-sm text-indigo-800 leading-relaxed">
            Regular health check-ups can help detect issues early and keep you feeling your best. 
            Don't forget to schedule your annual wellness visit!
          </p>
          <div className="mt-3">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
              💡 Stay Healthy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
