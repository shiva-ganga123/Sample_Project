import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
            return Promise.reject({
                message: 'No response from server. Please check your connection.'
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('API Error:', error.message);
            return Promise.reject({
                message: error.message || 'An unexpected error occurred'
            });
        }
    }
);

class AuthService {
  // Regular email/password login
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password }, {
        withCredentials: true // Important for sending/receiving cookies
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      // Store token and user data
      localStorage.setItem('token', response.data.accessToken);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      // Clear any existing auth data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Provide a more user-friendly error message
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Login failed. Please check your credentials and try again.';
      throw new Error(errorMessage);
    }
  }

  // Google OAuth login - redirects to backend OAuth endpoint
  loginWithGoogle() {
    window.location.href = `${API_URL}/auth/google`;
  }

  // Handle Google OAuth callback
  handleGoogleCallback(token, refreshToken) {
    if (token) {
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      return this.getCurrentUser();
    }
    return Promise.reject('No token received');
  }

  // Register new user
  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password
      });
      
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Get current user from backend
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // No token means user is not authenticated
        localStorage.removeItem('user');
        throw new Error('No authentication token found');
      }
      
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true // Important for sending cookies
      });
      
      if (response.data?.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { data: { user: response.data.user } };
      }
      
      return { data: { user: null } };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      // Clear invalid token
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw error;
    }
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  }

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
