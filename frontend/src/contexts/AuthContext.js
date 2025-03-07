import React, { createContext, useState, useEffect } from 'react';
import { axiosInstance } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      }
    } catch (err) {
      // If there's an error parsing the stored user data,
      // clear the invalid data from localStorage
      console.error('Error parsing stored user data:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', email);
      formData.append('password', password);
      formData.append('scope', '');
      formData.append('client_id', 'string');
      formData.append('client_secret', 'string');

      const response = await axiosInstance.post('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      // Extract user data and token from response
      const { access_token, user } = response.data;
      
      // Store auth data
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login');
      return false;
    }
  };

  const register = async (email, password) => {
    try {
      setError('');
      const response = await axiosInstance.post('/api/v1/auth/register', {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setError('');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    error
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};