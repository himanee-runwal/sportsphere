import axios from 'axios';

// Create a configured axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api',
  withCredentials: true, // Crucial for sending HttpOnly cookies (access & refresh tokens)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration/unauthorized responses
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops if the refresh token endpoint itself returns 401
      if (originalRequest.url.includes('/auth/refresh')) {
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Call the refresh token endpoint. 
        // We rely on the browser to send the HttpOnly refreshToken cookie automatically.
        await axios.post(
          `${import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api'}/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // If the refresh is successful, the backend has set a new HttpOnly access token cookie.
        // We can just retry the original request. The browser will attach the new cookie.
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token failed (e.g., expired or invalid)
        // Notify the app to log out
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      }
    }

    // Format error response before returning to avoid exposing raw errors
    const standardError = {
      message: error.response?.data?.message || 'Something went wrong. Please try again.',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
    };

    return Promise.reject(standardError);
  }
);

export default axiosInstance;
