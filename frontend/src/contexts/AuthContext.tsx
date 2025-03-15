import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../services/httpClient';

interface User {
  id: number;
  email: string;
  is_active: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError('');
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', email);
      formData.append('password', password);
      formData.append('scope', '');
      formData.append('client_id', 'string');
      formData.append('client_secret', 'string');

      const response = await axiosInstance.post<AuthResponse>('/api/v1/auth/login', formData, {
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login');
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      setError('');
      const response = await axiosInstance.post<AuthResponse>('/api/v1/auth/register', {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register');
      return false;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setError('');
  };

  const value: AuthContextType = {
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