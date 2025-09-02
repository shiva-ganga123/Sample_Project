import { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Container, Spinner, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { FiPlus, FiTrendingUp, FiCalendar, FiCheck, FiActivity } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import authService from '../services/auth.service';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        pendingHabits: 0,
        completedHabits: 0,
        totalHabits: 0,
        mood: null,
        goalProgress: 0
    });

    useEffect(() => {
        let isMounted = true;
        
        const fetchUserData = async () => {
            if (!isMounted) return;
            
            try {
                setLoading(true);
                setError('');
                console.log('Fetching user data...');
                
                // Check for existing user data first
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    if (isMounted) {
                        setUser(parsedUser);
                        updateStats(parsedUser);
                    }
                }
                
                // Then fetch fresh data
                const response = await authService.getCurrentUser();
                console.log('User data response:', response);
                
                if (!isMounted) return;
                
                if (response?.data?.user) {
                    setUser(response.data.user);
                    updateStats(response.data.user);
                } else {
                    console.log('No user data in response, clearing auth');
                    // Clear invalid auth data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return;
                }
            } catch (err) {
                console.error('Error in fetchUserData:', err);
                if (!isMounted) return;
                
                // Clear auth data on error
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                setError('Your session has expired. Please log in again.');
                
                // Redirect to login after showing error
                setTimeout(() => {
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }, 1500);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUserData();

        return () => {
            isMounted = false;
        };
    }, []);

    const updateStats = (userData) => {
        const today = new Date().toDateString();
        const todayHabits = userData.habits?.filter(habit => 
            habit.frequency === 'daily' && 
            (!habit.lastCompleted || new Date(habit.lastCompleted).toDateString() !== today)
        ) || [];

        const completedHabits = (userData.habits?.length || 0) - todayHabits.length;
        const totalHabits = userData.habits?.length || 0;
        const goalProgress = totalHabits > 0 
            ? Math.round((completedHabits / totalHabits) * 100) 
            : 0;

        setStats({
            pendingHabits: todayHabits.length,
            completedHabits,
            totalHabits,
            goalProgress,
            mood: userData.today?.mood || null
        });
    };

    const handleCompleteHabit = async (habitId) => {
        try {
            // In a real app, you would call an API endpoint to mark the habit as completed
            const updatedUser = { ...user };
            const habitIndex = updatedUser.habits.findIndex(h => h._id === habitId);
            if (habitIndex !== -1) {
                updatedUser.habits[habitIndex].lastCompleted = new Date();
                setUser(updatedUser);
                updateStats(updatedUser);
            }
        } catch (err) {
            console.error('Error completing habit:', err);
            setError('Failed to update habit. Please try again.');
        }
    };

    const getMoodEmoji = (mood) => {
        switch (mood) {
            case 'excellent': return '😊';
            case 'good': return '🙂';
            case 'neutral': return '😐';
            case 'bad': return '😕';
            case 'terrible': return '😔';
            default: return '🤔';
        }
    };

    const getMoodLabel = (mood) => {
        if (!mood) return 'Not set';
        return mood.charAt(0).toUpperCase() + mood.slice(1);
    };

    if (loading) {
        return (
            <Layout>
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '80vh' }}>
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading your dashboard...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <Container className="py-5">
                    <Alert variant="danger">{error}</Alert>
                </Container>
            </Layout>
        );
    }

    return (
        <Layout>
            <Container className="py-4">
                <h1 className="mb-4">Life Dashboard</h1>
                
                {/* Stats Overview */}
                <Row className="mb-4 g-4">
                    <Col md={3} sm={6}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="display-4 mb-2">{getMoodEmoji(stats.mood)}</div>
                                <Card.Title>Today's Mood</Card.Title>
                                <Card.Text className="text-muted">
                                    {getMoodLabel(stats.mood)}
                                </Card.Text>
                                <Button variant="outline-primary" size="sm">Log Mood</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={3} sm={6}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="display-4 mb-2">
                                    {stats.completedHabits}/{stats.totalHabits || 1}
                                </div>
                                <Card.Title>Daily Habits</Card.Title>
                                <div className="mb-2">
                                    <ProgressBar 
                                        now={stats.goalProgress} 
                                        label={`${stats.goalProgress}%`} 
                                        variant="success"
                                    />
                                </div>
                                <small className="text-muted">{stats.pendingHabits} pending today</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={3} sm={6}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="display-4 mb-2">
                                    <FiActivity size={40} className="text-primary" />
                                </div>
                                <Card.Title>Current Streak</Card.Title>
                                <Card.Text className="h3 mb-0">
                                    {user?.habits?.[0]?.currentStreak || 0} days
                                </Card.Text>
                                <small className="text-muted">Best: {user?.habits?.[0]?.bestStreak || 0} days</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={3} sm={6}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="display-4 mb-2">
                                    <FiCalendar size={40} className="text-warning" />
                                </div>
                                <Card.Title>Upcoming</Card.Title>
                                <Card.Text className="h5 mb-1">
                                    {user?.goals?.filter(g => !g.isCompleted).length || 0} goals
                                </Card.Text>
                                <Card.Text className="text-muted small">in progress</Card.Text>
                                <Button variant="outline-primary" size="sm">View Goals</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                
                {/* Today's Habits */}
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Today's Habits</h5>
                        <Button variant="primary" size="sm">
                            <FiPlus className="me-1" /> Add Habit
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        {user?.habits?.length > 0 ? (
                            <div className="list-group">
                                {user.habits.map((habit, index) => {
                                    const isCompleted = habit.lastCompleted && 
                                        new Date(habit.lastCompleted).toDateString() === new Date().toDateString();
                                    
                                    return (
                                        <div key={index} className="list-group-item">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1">
                                                        {habit.name}
                                                        {isCompleted && (
                                                            <Badge bg="success" className="ms-2">
                                                                <FiCheck className="me-1" /> Done
                                                            </Badge>
                                                        )}
                                                    </h6>
                                                    <small className="text-muted">{habit.description}</small>
                                                </div>
                                                <div>
                                                    <Badge bg="info" className="me-2">
                                                        {habit.frequency}
                                                    </Badge>
                                                    <Button 
                                                        variant={isCompleted ? "outline-secondary" : "outline-success"}
                                                        size="sm"
                                                        onClick={() => handleCompleteHabit(habit._id)}
                                                        disabled={isCompleted}
                                                    >
                                                        {isCompleted ? 'Completed' : 'Complete'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-muted">No habits added yet.</p>
                                <Button variant="primary">
                                    <FiPlus className="me-1" /> Add Your First Habit
                                </Button>
                            </div>
                        )}
                    </Card.Body>
                </Card>
                
                {/* Mood & Goals Summary */}
                <Row>
                    <Col md={6}>
                        <Card className="mb-4 shadow-sm h-100">
                            <Card.Header>
                                <h5 className="mb-0">Mood Tracker</h5>
                            </Card.Header>
                            <Card.Body className="text-center py-5">
                                <div className="display-1 mb-3">
                                    {stats.mood ? getMoodEmoji(stats.mood) : '🤔'}
                                </div>
                                <h4>How are you feeling today?</h4>
                                <p className="text-muted">
                                    {stats.mood 
                                        ? `You're feeling ${stats.mood} today.`
                                        : 'Log your mood to track your emotional well-being.'}
                                </p>
                                <div className="d-flex justify-content-center gap-2 mt-3">
                                    {['terrible', 'bad', 'neutral', 'good', 'excellent'].map((mood) => (
                                        <Button 
                                            key={mood}
                                            variant={stats.mood === mood ? 'primary' : 'outline-secondary'}
                                            onClick={() => {}}
                                            className="rounded-circle"
                                            style={{ width: '50px', height: '50px' }}
                                        >
                                            {getMoodEmoji(mood)}
                                        </Button>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={6}>
                        <Card className="mb-4 shadow-sm h-100">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Recent Goals</h5>
                                <Button variant="outline-primary" size="sm">
                                    <FiPlus className="me-1" /> New Goal
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                {user?.goals?.length > 0 ? (
                                    <div className="list-group">
                                        {user.goals.slice(0, 3).map((goal, index) => (
                                            <div key={index} className="list-group-item">
                                                <div className="d-flex w-100 justify-content-between">
                                                    <h6 className="mb-1">{goal.title}</h6>
                                                    <Badge bg={goal.isCompleted ? 'success' : 'warning'}>
                                                        {goal.isCompleted ? 'Completed' : 'In Progress'}
                                                    </Badge>
                                                </div>
                                                <p className="mb-1">{goal.description}</p>
                                                <small className="text-muted">
                                                    {goal.targetDate && `Target: ${new Date(goal.targetDate).toLocaleDateString()}`}
                                                </small>
                                                <div className="mt-2">
                                                    <ProgressBar 
                                                        now={goal.progress || 0} 
                                                        label={`${goal.progress || 0}%`} 
                                                        variant={goal.isCompleted ? 'success' : 'primary'}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted">No goals set yet.</p>
                                        <Button variant="primary">
                                            <FiPlus className="me-1" /> Create Your First Goal
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}
