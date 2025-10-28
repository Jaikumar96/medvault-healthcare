// src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = (redirectPath = '/login', requiredRole) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || (requiredRole && userData.role !== requiredRole)) {
        navigate(redirectPath);
      } else {
        setUser(userData);
      }
    } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        navigate(redirectPath);
    } finally {
        setLoading(false);
    }
  }, [navigate, redirectPath, requiredRole]);

  return { user, loading };
};