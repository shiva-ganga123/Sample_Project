import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();

    const { name, email, password, confirmPassword } = formData;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        // Client-side validation
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        // Password confirmation check
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setValidated(true);
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Attempting to register user:', { name, email });
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Registration successful:', response.data);
            // Redirect to login page after successful registration
            navigate('/login', { 
                state: { 
                    message: 'Registration successful! Please log in.' 
                } 
            });
        } catch (err) {
            console.error('Registration error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                headers: err.response?.headers
            });
            
            // More specific error messages
            if (err.response) {
                // Server responded with an error status code
                if (err.response.status === 400) {
                    setError(err.response.data.message || 'Invalid registration data');
                } else if (err.response.status === 409) {
                    setError('An account with this email already exists');
                } else if (err.response.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(err.response.data?.message || 'Registration failed');
                }
            } else if (err.request) {
                // Request was made but no response received
                setError('No response from server. Please check your connection.');
            } else {
                // Something else went wrong
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="card fade-in">
                <h2 className="text-center mb-4">Create an Account</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide your full name.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid email address.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            minLength="6"
                            required
                        />
                        <Form.Text className="text-muted">
                            Password must be at least 6 characters long.
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid password (min 6 characters).
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            isInvalid={validated && password !== confirmPassword}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            Passwords do not match.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 mb-3"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>

                    <div className="text-center mt-3">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary">Log In</Link>
                    </div>
                </Form>
            </div>
        </Layout>
    );
}
