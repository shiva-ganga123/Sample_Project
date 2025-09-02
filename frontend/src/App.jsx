import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';  
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AppNavbar from './components/Navbar.jsx';
import authService from './services/auth.service';

// Component to handle OAuth callback
const OAuthCallbackHandler = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { login } = useAuth();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                setIsLoading(true);
                const searchParams = new URLSearchParams(window.location.search);
                
                // Check for error in query params
                const error = searchParams.get('error');
                if (error) {
                    throw new Error(`OAuth error: ${error}`);
                }
                
                // Check for authorization code from Google
                const code = searchParams.get('code');
                
                if (!code) {
                    throw new Error('No authorization code found in URL');
                }
                
                console.log('Exchanging authorization code for tokens...');
                
                // Exchange authorization code for tokens
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback?code=${code}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to exchange authorization code');
                }
                
                const data = await response.json();
                console.log('Auth response data:', data);
                
                if (!data.token) {
                    throw new Error('No token received from server');
                }
                
                console.log('Storing tokens and user data...');
                
                // Use the login function from useAuth to update the auth state
                const loginSuccess = await login({
                    token: data.token,
                    refreshToken: data.refreshToken,
                    user: data.user
                });

                if (loginSuccess) {
                    console.log('Login successful, redirecting to dashboard');
                    // Clear URL parameters and redirect
                    window.history.replaceState({}, document.title, window.location.pathname);
                    navigate('/dashboard', { replace: true });
                } else {
                    throw new Error('Failed to update authentication state');
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError(err.message || 'Authentication failed');
                // Clear any invalid tokens
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                
                // Redirect to login with error state
                navigate('/login', { 
                    replace: true,
                    state: { 
                        error: 'google_auth_failed',
                        message: err.message 
                    } 
                });
            } finally {
                setIsLoading(false);
            }
        };

        handleOAuthCallback();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-3 mb-0">Completing sign in...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="alert alert-danger">
                    <h4 className="alert-heading">Authentication Error</h4>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">You will be redirected to the login page shortly.</p>
                </div>
            </div>
        );
    }

    return null;
};

// Custom hook to handle authentication state
const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Checking auth with token:', !!token);
            
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }

            // Verify the token by fetching user data
            const userResponse = await authService.getCurrentUser();
            console.log('User response:', userResponse);
            
            if (userResponse?.data?.user) {
                setUser(userResponse.data.user);
                setIsAuthenticated(true);
                return true;
            } else {
                // Clear invalid token
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            return false;
        } finally {
            if (isLoading) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        checkAuth();

        // Listen for storage events to handle login/logout from other tabs
        const handleStorageChange = (e) => {
            if (e.key === 'token' || e.key === 'user') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (userData) => {
        if (userData?.token) {
            localStorage.setItem('token', userData.token);
            if (userData.refreshToken) {
                localStorage.setItem('refreshToken', userData.refreshToken);
            }
            if (userData.user) {
                localStorage.setItem('user', JSON.stringify(userData.user));
                setUser(userData.user);
            }
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return { 
        isAuthenticated, 
        isLoading, 
        user,
        login,
        logout,
        checkAuth,
        logout
    };
};

export default function App() {
    const { isAuthenticated, isLoading, logout } = useAuth();

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <AppNavbar isAuthenticated={isAuthenticated} onLogout={logout} />
            <Routes>
                <Route path="/" element={
                    isAuthenticated ? 
                    <Navigate to="/dashboard" /> : 
                    <Navigate to="/login" />
                } />
                <Route path="/login" element={
                    !isAuthenticated ? 
                    <Login /> : 
                    <Navigate to="/dashboard" />
                } />
                <Route path="/register" element={
                    !isAuthenticated ? 
                    <Register /> : 
                    <Navigate to="/dashboard" />
                } />
                <Route path="/dashboard" element={
                    isAuthenticated ? 
                    <Dashboard /> : 
                    <Navigate to="/login" />
                } />
                <Route path="/auth/callback" element={<OAuthCallbackHandler />} />
            </Routes>
        </Router>
    )
}
