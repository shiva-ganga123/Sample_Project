import {Form, Button} from 'react-bootstrap';
import Layout from '../components/Layout';

export default function Register() {
    const handleSubmit = (e) => {
        e.preventDefault();
    }

return (
    <Layout>
        <h2 className='text-center mb-4'>Register</h2>
        <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-3'>
                <Form.Label>Name</Form.Label>
                <Form.Control type='text' placeholder='Enter name' />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label>Email</Form.Label>
                <Form.Control type='email' placeholder='Enter email' />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label>Password</Form.Label>
                <Form.Control type='password' placeholder='Enter password' />
            </Form.Group>

            <Button variant='primary' className='w-100' type='submit'>Register</Button>
        </Form>
    </Layout>
)
}
