import {Container, Row, Col} from 'react-bootstrap';

export default function Layout({ children }) {
    return (
        <Container className='min-vh-100 d-flex justify-content-center align-items-center'>
            <Row className='w-100'>
                <Col xs={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
                    {children}
                </Col>
            </Row>
        </Container>
    )
}