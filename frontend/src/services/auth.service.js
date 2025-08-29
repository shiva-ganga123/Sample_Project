import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Create axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important for cookies
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error:', error.response.data);
            return Promise.reject({
                message: error.response.data.message || 'An error occurred',
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('API Error: No response received', error.request);
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
      const response = await api.post('/auth/login', { email, password });
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Google OAuth login - redirects to backend OAuth endpoint
  loginWithGoogle() {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }

  // Handle Google OAuth callback
  handleGoogleCallback() {
    return axios.get(`${API_URL}/google/callback`, { 
      withCredentials: true 
    });
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

  // Get current user from localStorage
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
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
