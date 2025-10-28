import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

// Create the context
export const DoctorProfileContext = createContext(null);

// Create the provider component
export const DoctorProfileProvider = ({ children }) => {
    const [doctorStatus, setDoctorStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDoctorStatus = useCallback(async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user?.id) {
                setDoctorStatus('INACTIVE'); // No user logged in
                return;
            }
            
            const response = await fetch(`http://localhost:8080/api/doctor/profile/${user.id}`);
            
            if (response.ok) {
                const doctor = await response.json();
                // Ensure doctor object and status property exist
                setDoctorStatus(doctor?.status || 'INACTIVE'); 
            } else if (response.status === 404) {
                 // Profile not created yet, so they are not approved
                setDoctorStatus('INACTIVE');
            } else {
                setDoctorStatus('INACTIVE'); // Handle other errors
            }
        } catch (error) {
            console.error('Error fetching doctor status:', error);
            setDoctorStatus('INACTIVE');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctorStatus();
    }, [fetchDoctorStatus]);

    const value = { doctorStatus, loading, refetch: fetchDoctorStatus };

    return (
        <DoctorProfileContext.Provider value={value}>
            {children}
        </DoctorProfileContext.Provider>
    );
};

// Custom hook to use the context easily
export const useDoctorProfile = () => {
    return useContext(DoctorProfileContext);
};