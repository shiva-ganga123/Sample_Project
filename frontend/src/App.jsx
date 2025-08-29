import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';  
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AppNavbar from './components/Navbar.jsx';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is authenticated on initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
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
            </Routes>
        </Router>
    )
}
