import { useState, useEffect } from "react";
import {Card, Button, Row, Col} from 'react-bootstrap';
import Layout from '../components/Layout';
import {getItems, deleteItem} from '../services/items';

export default function Dashboard() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const res = await getItems();
        setItems(res.data);
    };

    const removeItem = async (id) => {
        const res = await deleteItem(id);
        fetchItems();
    };

    return(
        <Layout>
            <h2 className="text-center mb-4">Dashboard</h2>
            <Row xs={1} sm={2} md={3} className='g-4'>
                {items.map((item) => (
                    <Col key={item._id}>
                        <Card className="h-100">
                            <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text>
                                    Category: {item.category}<br/>
                                    Amount: {item.amount}<br/>
                                    Due: {item.dueDate?.slice(0, 10)}
                                </Card.Text>
                                <Button variant='danger' onClick={() => removeItem(item._id)}>Delete</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Layout>
    )
}