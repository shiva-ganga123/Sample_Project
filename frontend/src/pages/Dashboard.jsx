import { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Container, Spinner, Alert } from 'react-bootstrap';
import { FiPlus, FiTrendingUp, FiDollarSign, FiCalendar, FiTrash2, FiEdit } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getItems, deleteItem } from '../services/items';

export default function Dashboard() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalItems: 0,
        totalAmount: 0,
        upcomingDue: 0
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await getItems();
            setItems(res.data);
            
            // Calculate statistics
            const totalAmount = res.data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            const today = new Date();
            const upcomingDue = res.data.filter(item => {
                if (!item.dueDate) return false;
                const dueDate = new Date(item.dueDate);
                const diffTime = dueDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 && diffDays <= 7; // Due within the next 7 days
            }).length;

            setStats({
                totalItems: res.data.length,
                totalAmount,
                upcomingDue
            });
        } catch (err) {
            setError('Failed to fetch items. Please try again later.');
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteItem(id);
                fetchItems();
            } catch (err) {
                setError('Failed to delete item. Please try again.');
                console.error('Error deleting item:', err);
            }
        }
    };

    const StatCard = ({ title, value, icon: Icon, variant = 'primary' }) => (
        <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
                <div className={`bg-${variant}-subtle p-3 rounded-circle me-3`}>
                    <Icon size={24} className={`text-${variant}`} />
                </div>
                <div>
                    <h6 className="text-muted mb-0">{title}</h6>
                    <h4 className="mb-0">{value}</h4>
                </div>
            </Card.Body>
        </Card>
    );

    if (loading) {
        return (
            <Layout>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                    <Spinner animation="border" variant="primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="dashboard-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">Dashboard</h2>
                    <Button as={Link} to="/items/new" variant="primary" className="d-flex align-items-center">
                        <FiPlus className="me-2" /> Add New Item
                    </Button>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {/* Stats Row */}
                <Row className="mb-4">
                    <Col md={4}>
                        <StatCard 
                            title="Total Items" 
                            value={stats.totalItems} 
                            icon={FiTrendingUp} 
                            variant="primary" 
                        />
                    </Col>
                    <Col md={4}>
                        <StatCard 
                            title="Total Amount" 
                            value={`$${stats.totalAmount.toLocaleString()}`} 
                            icon={FiDollarSign} 
                            variant="success" 
                        />
                    </Col>
                    <Col md={4}>
                        <StatCard 
                            title="Upcoming Due" 
                            value={stats.upcomingDue} 
                            icon={FiCalendar} 
                            variant="warning" 
                        />
                    </Col>
                </Row>

                {/* Items List */}
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 py-3">
                        <h5 className="mb-0">Your Items</h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {items.length === 0 ? (
                            <div className="text-center py-5">
                                <p className="text-muted">No items found. Add your first item to get started!</p>
                                <Button as={Link} to="/items/new" variant="outline-primary">
                                    <FiPlus className="me-2" /> Add Your First Item
                                </Button>
                            </div>
                        ) : (
                            <div className="list-group list-group-flush">
                                {items.map((item) => (
                                    <div key={item._id} className="list-group-item list-group-item-action">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{item.title}</h6>
                                                <div className="text-muted small">
                                                    <span className="me-3">
                                                        <FiDollarSign className="me-1" />
                                                        {parseFloat(item.amount).toFixed(2)}
                                                    </span>
                                                    {item.dueDate && (
                                                        <span>
                                                            <FiCalendar className="me-1" />
                                                            {new Date(item.dueDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    className="me-2"
                                                    as={Link}
                                                    to={`/items/edit/${item._id}`}
                                                >
                                                    <FiEdit size={16} />
                                                </Button>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    <FiTrash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>

            <style jsx global>{`
                .dashboard-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 15px;
                }
                .stat-card {
                    transition: transform 0.2s;
                }
                .stat-card:hover {
                    transform: translateY(-5px);
                }
            `}</style>
        </Layout>
    );
}