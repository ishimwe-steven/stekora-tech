import axios from 'axios';

// Base URL for your backend API (change host/port if needed)
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

// Attach JWT token for admin-protected routes by default
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

