import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestHeaders, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with base URL and default config
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to extract error message from Axios errors
export const extractErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data as any;
    
    if (responseData) {
      if (typeof responseData === 'string') return responseData;
      if (responseData.detail) return responseData.detail;
      if (responseData.message) return responseData.message;
      if (Array.isArray(responseData)) return responseData.join(', ');
      return JSON.stringify(responseData);
    }
    return axiosError.message;
  }
  if (error && typeof error === 'object') {
    if (error.message) return error.message;
    return JSON.stringify(error);
  }
  return error?.toString() || 'An unknown error occurred';
};

// Add token to requests if available
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  
  if (config.url === '/auth/login' || config.url === '/auth/register') {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    if (config.data) {
      const formData = new URLSearchParams();
      for (const [key, value] of Object.entries(config.data)) {
        formData.append(key, String(value));
      }
      config.data = formData;
    }
  } 
  
  if (token) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle unauthorized responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Utility to get the full URL for audio files
export const getAudioUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return '';
  
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  if (relativeUrl.startsWith('/')) {
    return `${API_BASE_URL}${relativeUrl}`;
  }
  
  return `${API_BASE_URL}/${relativeUrl}`;
};

export default axiosInstance;