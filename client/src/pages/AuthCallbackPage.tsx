import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract token from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/login?error=oauth_failed');
          return;
        }

        if (!token) {
          console.error('No token received from OAuth callback');
          navigate('/login?error=no_token');
          return;
        }

        // Fetch user data using the token
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        
        // Store token and user data
        setAuthData(token, data.user);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [navigate, setAuthData]);

  return (
    <div className="page" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>🏃 Processing Authentication...</h2>
        <p>Please wait while we complete your login.</p>
      </div>
    </div>
  );
}

export default AuthCallbackPage;
