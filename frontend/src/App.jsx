import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';  
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AppNavbar from './components/Navbar.jsx';

export default function App() {
    return (
      <Router>
        <AppNavbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    )
}
