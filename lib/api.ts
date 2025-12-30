import axios, { AxiosError, AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';

      // Don't show toast for 401 on login page (it will be handled there)
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== 'undefined' && !isLoginPage) {
          localStorage.removeItem('admin_token');
          window.location.href = '/login';
        }
        // Don't show toast for 401 on login page
        if (!isLoginPage) {
          toast.error('Session expired. Please login again.');
        }
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (status === 400 && !isLoginPage) {
        // Show validation errors for 400, but not on login page (let login page handle it)
        const errors = error.response.data?.errors;
        if (errors && Array.isArray(errors)) {
          const errorMessages = errors.map((e: any) => e.message || e.msg).join(', ');
          toast.error(errorMessages || message);
        } else {
          toast.error(message);
        }
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// API methods
export const adminApi = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // App Config
  getConfig: async () => {
    const response = await api.get('/admin/config');
    return response.data;
  },

  updateConfig: async (data: any) => {
    const response = await api.put('/admin/config', data);
    return response.data;
  },

  // Feature Flags
  getFeatureFlags: async () => {
    const response = await api.get('/admin/features');
    return response.data;
  },

  updateFeatureFlags: async (data: any) => {
    const response = await api.put('/admin/features', data);
    return response.data;
  },

  // Limits
  getLimits: async () => {
    const response = await api.get('/admin/limits');
    return response.data;
  },

  updateLimits: async (data: any) => {
    const response = await api.put('/admin/limits', data);
    return response.data;
  },

  // Unrevealed Chat Payment Settings
  getUnrevealedChatPaymentSettings: async () => {
    const response = await api.get('/admin/unrevealed-chat-payment');
    return response.data;
  },

  updateUnrevealedChatPaymentSettings: async (data: any) => {
    const response = await api.put('/admin/unrevealed-chat-payment', data);
    return response.data;
  },

  // Users
  getUsers: async (params?: any) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserDetails: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId: string, data: any) => {
    const response = await api.put(`/admin/users/${userId}/status`, data);
    return response.data;
  },

  // Reports & Moderation
  getReports: async (params?: any) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  getReportDetails: async (reportId: string) => {
    const response = await api.get(`/admin/reports/${reportId}`);
    return response.data;
  },

  resolveReport: async (reportId: string, data: any) => {
    const response = await api.post(`/admin/reports/${reportId}/resolve`, data);
    return response.data;
  },

  // Feedback Management
  getFeedback: async (params?: any) => {
    const response = await api.get('/admin/feedback', { params });
    return response.data;
  },

  getFeedbackDetails: async (feedbackId: string) => {
    const response = await api.get(`/admin/feedback/${feedbackId}`);
    return response.data;
  },

  updateFeedback: async (feedbackId: string, data: any) => {
    const response = await api.put(`/admin/feedback/${feedbackId}`, data);
    return response.data;
  },

  // Analytics
  getAnalytics: async (params?: any) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },

  // Activity Logs
  getActivityLogs: async (params?: any) => {
    const response = await api.get('/admin/activity-logs', { params });
    return response.data;
  },

  // Blocks Management
  getBlocks: async (params?: any) => {
    const response = await api.get('/admin/blocks', { params });
    return response.data;
  },

  getBlockDetails: async (blockId: string) => {
    const response = await api.get(`/admin/blocks/${blockId}`);
    return response.data;
  },

  removeBlock: async (blockId: string, data?: any) => {
    const response = await api.delete(`/admin/blocks/${blockId}`, { data });
    return response.data;
  },

  getBlockStats: async () => {
    const response = await api.get('/admin/blocks/stats');
    return response.data;
  },

  // Premium Management
  getPremiumStatus: async () => {
    const response = await api.get('/admin/premium/status');
    return response.data;
  },

  getPremiumFeatures: async () => {
    const response = await api.get('/admin/premium/features');
    return response.data;
  },

  getPremiumPlans: async () => {
    const response = await api.get('/admin/premium/plans');
    return response.data;
  },

  togglePremiumMode: async (enabled: boolean) => {
    const response = await api.put('/admin/premium/mode', { enabled });
    return response.data;
  },

  togglePremiumFeature: async (featureId: string) => {
    const response = await api.post(`/admin/premium/features/${featureId}/toggle`);
    return response.data;
  },

  updatePremiumFeature: async (featureId: string, data: any) => {
    const response = await api.put(`/admin/premium/features/${featureId}`, data);
    return response.data;
  },

  updatePremiumPlan: async (planId: string, data: any) => {
    const response = await api.put(`/admin/premium/plans/${planId}`, data);
    return response.data;
  },

};

export default api;

