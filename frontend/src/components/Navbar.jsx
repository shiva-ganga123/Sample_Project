import { Navbar, Nav, Container } from "react-bootstrap";

export default function AppNavbar() {
    return (
        <Navbar bg='primary' variant='dark' expand='lg' className='mb-4'>
            <Container>
                <Navbar.Brand href='/'>Life Tracker</Navbar.Brand>
                <Navbar.Toggle aria-controls='navbar-nav'/>
                <Navbar.Collapse id='navbar-nav'>
                    <Nav className='ms-auto'>
                        <Nav.Link href='/Dashboard'>Dashboard</Nav.Link>
                        <Nav.Link href='/Login'>Login</Nav.Link>
                        <Nav.Link href='/Register'>Register</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}