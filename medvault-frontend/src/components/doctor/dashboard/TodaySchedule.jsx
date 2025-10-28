// src/components/doctor/dashboard/TodaySchedule.jsx

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDaysIcon, Loader2, User } from 'lucide-react'; // Using lucide for consistency

const TodaySchedule = () => {
    const [todaysAppointments, setTodaysAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTodaysAppointments = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) return;
                
                // Assuming your /appointments endpoint returns all appointments, we filter on the frontend
                // For better performance, create a dedicated backend endpoint for today's appointments
                const response = await fetch(`http://localhost:8080/api/doctor/appointments/${user.id}`);
                if (response.ok) {
                    const allAppointments = await response.json();
                    const today = new Date().toISOString().split('T')[0];
                    const filtered = allAppointments.filter(app => 
                        app.appointmentStartTime && app.appointmentStartTime.startsWith(today) && app.status === 'APPROVED'
                    );
                    setTodaysAppointments(filtered);
                }
            } catch (error) {
                console.error("Failed to fetch today's appointments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTodaysAppointments();
    }, []);

    const formatTime = (dateTime) => new Date(dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
                <NavLink to="/doctor/schedule" className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
                    View All
                </NavLink>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                {loading ? (
                    <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : todaysAppointments.length > 0 ? (
                    <ul className="space-y-4">
                        {todaysAppointments.map(app => (
                            <li key={app.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-md">
                                <div>
                                    <p className="font-semibold text-gray-800 flex items-center">
                                        <User size={16} className="mr-2 text-emerald-700"/>
                                        {app.patientFirstName} {app.patientLastName}
                                    </p>
                                    <p className="text-sm text-gray-600 ml-8">{app.patientNotes || "No notes provided."}</p>
                                </div>
                                <span className="font-mono text-emerald-800 bg-emerald-200 px-3 py-1 rounded-md text-sm font-semibold">
                                    {formatTime(app.appointmentStartTime)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-4">
                        <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No appointments today</h3>
                        <p className="text-gray-600">You have a free day! Enjoy your break.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodaySchedule;