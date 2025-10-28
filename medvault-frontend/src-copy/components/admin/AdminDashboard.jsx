import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DashboardOverview from './dashboard/DashboardOverview';
import RegisterUser from './user-management/RegisterUser';
import AccessRequests from './user-management/AccessRequests';
import ManageUsers from './user-management/ManageUsers';
import Settings from './settings/Settings'; // Import Settings component
import DoctorManagement from './doctor-management/DoctorManagement'; 
import PatientManagement from './patient-management/PatientManagement'; 
import Analytics from './analytics/Analytics';


const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const [totalPatients, setTotalPatients] = useState(0);
    const [totalAdmins, setTotalAdmins] = useState(0);
    const [newUsersThisMonth, setNewUsersThisMonth] = useState(0);
    const [recentActivities, setRecentActivities] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || userData.role !== 'ADMIN') {
            navigate('/login');
            return;
        }
        setUser(userData);
        initializeDashboard();
    }, [navigate]);

    const initializeDashboard = async () => {
        setDashboardLoading(true);
        try {
            await Promise.all([
                fetchUserStats(),
                fetchPendingRequests(),
                fetchRecentActivities(),
                fetchAnalyticsData()
            ]);
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            setMessage('Failed to load dashboard data');
        } finally {
            setDashboardLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token ? 'Present' : 'Missing');

            const response = await axios.get('http://localhost:8080/api/admin/user-stats', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            console.log('User stats response:', response.data);

            if (response.data) {
                setTotalUsers(response.data.totalUsers || 0);
                setTotalDoctors(response.data.totalDoctors || 0);
                setTotalPatients(response.data.totalPatients || 0);
                setTotalAdmins(response.data.totalAdmins || 0);
                setNewUsersThisMonth(response.data.newUsersThisMonth || 0);
            }
        } catch (error) {
            console.error('Failed to fetch user statistics:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            if (error.response?.status === 401) {
                setMessage('Session expired. Please login again.');
                setTimeout(() => navigate('/login'), 2000);
            } else if (error.response?.status === 403) {
                setMessage('Access denied. Admin privileges required.');
            } else {
                setMessage('Failed to load dashboard data. Please try again.');
            }
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/access-requests/pending', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            setPendingRequests(response.data || []);
        } catch (error) {
            console.error('Failed to fetch pending requests:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchRecentActivities = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/recent-activities', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            setRecentActivities(response.data || null);
            console.log('Recent activities fetched:', response.data);
        } catch (error) {
            console.error('Failed to fetch recent activities:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchAnalyticsData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/analytics', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            setAnalyticsData(response.data || null);
            console.log('Analytics data fetched:', response.data);
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleSuccess = (msg) => {
        setMessage(msg);
        setTimeout(() => {
            fetchUserStats();
            fetchPendingRequests();
            fetchRecentActivities();
        }, 1000);
    };

    const handleError = (msg) => {
        setMessage(msg);
    };

    const refreshDashboard = () => {
        setMessage('');
        initializeDashboard();
    };

    if (!user || dashboardLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex">
            <AdminSidebar
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                pendingRequests={pendingRequests}
                onLogout={handleLogout}
            />

            <div className="flex-1 overflow-hidden">
                <AdminHeader
                    pendingRequests={pendingRequests}
                    onRefresh={refreshDashboard}
                />

                <div className="p-8 overflow-y-auto h-full">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
                            message.includes('successfully')
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-rose-50 border-rose-200 text-rose-700'
                            }`}>
                            <p className="font-medium">{message}</p>
                            <button
                                onClick={() => setMessage('')}
                                className="text-current hover:opacity-75"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <DashboardOverview
                            totalUsers={totalUsers}
                            totalDoctors={totalDoctors}
                            totalPatients={totalPatients}
                            totalAdmins={totalAdmins}
                            newUsersThisMonth={newUsersThisMonth}
                            pendingRequests={pendingRequests}
                            recentActivities={recentActivities}
                            analyticsData={analyticsData}
                            onRefresh={refreshDashboard}
                        />
                    )}

                    {activeTab === 'register' && (
                        <RegisterUser
                            onSuccess={handleSuccess}
                            onError={handleError}
                        />
                    )}

                    {activeTab === 'requests' && (
                        <AccessRequests
                            pendingRequests={pendingRequests}
                            setPendingRequests={setPendingRequests}
                            user={user}
                            onMessage={setMessage}
                            fetchUserStats={fetchUserStats}
                        />
                    )}

                    {activeTab === 'users' && (
                        <ManageUsers />
                    )}

                     {/* Add this section for Doctor Management */}
                    {activeTab === 'doctors' && (
                        <DoctorManagement />
                    )}


                    {activeTab === 'patients' && (
                        <PatientManagement />
                    )}

                    {activeTab === 'analytics' && <Analytics />}

                    {/* Replace the basic settings with the comprehensive Settings component */}
                    {activeTab === 'settings' && (
                        <Settings />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
