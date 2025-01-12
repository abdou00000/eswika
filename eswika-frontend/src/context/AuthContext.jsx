// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, userType = 'customer') => {
    try {
      const endpoint = userType === 'admin' 
        ? 'http://localhost:5000/api/admin/login'
        : 'http://localhost:5000/api/login';

      const response = await axios.post(endpoint, { email, password });
      const { token, user_type, user_id } = response.data;
      
      const userData = {
        id: user_id,
        type: user_type || userType // fallback to provided userType if not in response
      };

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Helper functions for checking user roles
  const isAdmin = () => user?.type === 'admin';
  const isFarmer = () => user?.type === 'farmer';
  const isCustomer = () => user?.type === 'customer';

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAdmin,
    isFarmer,
    isCustomer,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};