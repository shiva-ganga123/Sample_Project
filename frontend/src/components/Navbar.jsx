import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';

export default function AppNavbar({ isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
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
                                <Button 
                                    variant='outline-light' 
                                    className='ms-2'
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
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