import { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import authService from '../services/auth.service';
import Layout from '../components/Layout';

export default function Login({ setIsAuthenticated }) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for success message from registration
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the message from state to prevent showing it again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const { email, password } = formData;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await authService.login(email, password);
            setIsAuthenticated(true);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="card fade-in">
                <h2 className="text-center mb-4">Welcome Back</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}
                
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid email address.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label>Password</Form.Label>
                            <Link to="/forgot-password" className="text-primary small">
                                Forgot password?
                            </Link>
                        </div>
                        <Form.Control
                            type="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            minLength="6"
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid password.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 mb-3"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In with Email'}
                    </Button>

                    <div className="divider my-4">
                        <span className="text-muted">OR</span>
                    </div>

                    <Button 
                        variant="outline-primary" 
                        className="w-100 mb-3 d-flex align-items-center justify-content-center"
                        onClick={() => authService.loginWithGoogle()}
                    >
                        <FcGoogle size={20} className="me-2" />
                        Continue with Google
                    </Button>

                    <div className="text-center mt-4">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary fw-medium">Sign Up</Link>
                    </div>
                </Form>
            </div>
        </Layout>
    );
}
