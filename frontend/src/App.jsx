import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';  
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AppNavbar from './components/Navbar.jsx';
import authService from './services/auth.service';

// Component to handle OAuth callback
const OAuthCallbackHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Check for token in URL (from our backend redirect)
                const params = new URLSearchParams(location.search);
                const token = params.get('token');
                const error = params.get('error');

                if (error) {
                    throw new Error('Authentication failed');
                }

                if (token) {
                    const refreshToken = params.get('refreshToken');
                    localStorage.setItem('token', token);
                    if (refreshToken) {
                        localStorage.setItem('refreshToken', refreshToken);
                    }
                    
                    // Fetch user data using the token
                    const userResponse = await authService.getCurrentUser();
                    if (userResponse.data) {
                        localStorage.setItem('user', JSON.stringify(userResponse.data));
                    }
                    
                    // Redirect to dashboard
                    window.location.href = '/dashboard';
                } else {
                    navigate('/login');
                }
            } catch (err) {
                console.error('OAuth error:', err);
                setError('Failed to authenticate with Google. Please try again.');
                navigate('/login', { state: { error: 'google_auth_failed' } });
            }
        };

        handleOAuthCallback();
    }, [location, navigate]);

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>;
};

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is authenticated on initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);

        // Listen for storage events to handle login/logout from other tabs
        const handleStorageChange = () => {
            const token = localStorage.getItem('token');
            setIsAuthenticated(!!token);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <Router>
            <AppNavbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
            <Routes>
                <Route path="/" element={
                    isAuthenticated ? 
                    <Navigate to="/dashboard" /> : 
                    <Navigate to="/login" />
                } />
                <Route path="/login" element={
                    !isAuthenticated ? 
                    <Login setIsAuthenticated={setIsAuthenticated} /> : 
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
                <Route path="/auth/google/callback" element={<OAuthCallbackHandler />} />
            </Routes>
        </Router>
    )
}
