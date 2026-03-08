import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For admin dashboard, we might operate as a specific tenant or platform admin
    // If tenantId is selected, send it
    if (tenantId) {
        config.headers['x-tenant-id'] = tenantId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
