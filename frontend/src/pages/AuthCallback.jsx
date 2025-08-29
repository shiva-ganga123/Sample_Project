import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error('Authentication failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token) {
      // Store the token in localStorage or your state management
      localStorage.setItem('token', token);
      const refreshToken = params.get('refreshToken');
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Redirect to dashboard or home page
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
