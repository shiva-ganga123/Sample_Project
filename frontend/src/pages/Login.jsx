import {Form, Button} from 'react-bootstrap';
import Layout from '../components/Layout';

export default function Login() {
    const handleSubmit = (e) => {
        e.preventDefault();
    }

return (
    <Layout>
        <h2 className='text-center mb-4'>Login</h2>
        <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3'>
                <Form.Label>Email</Form.Label>
                <Form.Control type='email' placeholder='Enter email' />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label>Password</Form.Label>
                <Form.Control type='password' placeholder='Enter password' />
            </Form.Group>

            <Button variant='primary' className='w-100' type='submit'>Login</Button>
        </Form>
    </Layout>
)

}
