import { Navbar, Nav, Container, Button, Dropdown, Image } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import authService from '../services/auth.service';

export default function AppNavbar({ isAuthenticated, onLogout }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout API error:', err);
            // Continue with client-side logout even if API call fails
        } finally {
            // Call the onLogout callback from parent
            onLogout();
            // Navigate to login
            navigate('/login');
        }
    };

    return (
        <Navbar bg='primary' variant='dark' expand='lg' className='mb-4'>
            <Container>
                <Navbar.Brand as={Link} to='/'>Life Tracker</Navbar.Brand>
                <Navbar.Toggle aria-controls='navbar-nav' />
                <Navbar.Collapse id='navbar-nav'>
                    <Nav className='ms-auto'>
                        {isAuthenticated ? (
                            <>
                                <Nav.Link as={Link} to='/dashboard'>Dashboard</Nav.Link>
                                <Dropdown align="end" className="ms-3">
                                    <Dropdown.Toggle 
                                        variant="outline-light" 
                                        id="dropdown-user"
                                        className="d-flex align-items-center"
                                    >
                                        {user.picture ? (
                                            <Image 
                                                src={user.picture} 
                                                roundedCircle 
                                                width="32" 
                                                height="32" 
                                                className="me-2"
                                                alt={user.name || 'User'}
                                            />
                                        ) : (
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" 
                                                style={{ width: '32px', height: '32px' }}>
                                                <FiUser className="text-dark" />
                                            </div>
                                        )}
                                        <span className="d-none d-md-inline">
                                            {user.name || 'User'}
                                        </span>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="dropdown-menu-end">
                                        <Dropdown.Header>
                                            <div className="fw-bold">{user.name || 'User'}</div>
                                            <div className="small text-muted">{user.email || ''}</div>
                                        </Dropdown.Header>
                                        <Dropdown.Divider />
                                        <Dropdown.Item as={Link} to="/profile">
                                            <FiUser className="me-2" /> Profile
                                        </Dropdown.Item>
                                        <Dropdown.Item as={Link} to="/settings">
                                            <FiSettings className="me-2" /> Settings
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={handleLogout}>
                                            <FiLogOut className="me-2" /> Logout
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to='/login'>Login</Nav.Link>
                                <Nav.Link as={Link} to='/register'>Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}