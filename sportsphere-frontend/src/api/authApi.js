import axiosInstance from './axios';

export const authApi = {
  login: async (credentials) => {
    // API Contract: emailOrPhone, password
    const response = await axiosInstance.post('/v1/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    // API Contract: firstName, lastName, profileImage, email, phone, password, role
    const response = await axiosInstance.post('/v1/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    // API Contract: requires valid HttpOnly cookie
    const response = await axiosInstance.get('/v1/auth/me');
    return response.data;
  },

  logout: async () => {
    // Clears the HttpOnly cookies on the backend
    const response = await axiosInstance.post('/v1/auth/logout');
    return response.data;
  },

  forgotPassword: async (emailData) => {
    // API Contract: emailOrPhone
    const response = await axiosInstance.post('/v1/auth/forgot-password', emailData);
    return response.data;
  },

  resetPassword: async (passwordData) => {
    // API Contract: tokenOrOtp, newPassword
    const response = await axiosInstance.post('/v1/auth/reset-password', passwordData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    // API Contract: oldPassword, newPassword
    const response = await axiosInstance.post('/v1/auth/change-password', passwordData);
    return response.data;
  },

  lookupUserByEmail: async (email) => {
    // API Contract: admin only, lookup user by email
    const response = await axiosInstance.get(`/v1/auth/admin/users/lookup?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  createManager: async (managerData) => {
    // API Contract: admin only, bypasses role restriction
    const response = await axiosInstance.post('/v1/auth/admin/users', managerData);
    return response.data;
  }
};
