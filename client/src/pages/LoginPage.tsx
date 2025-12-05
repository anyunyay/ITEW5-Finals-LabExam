import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InstallButton from '../components/InstallButton';
import Logo from '../components/Logo';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for OAuth errors in URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const errorMessages: { [key: string]: string } = {
        oauth_failed: 'Google authentication failed. Please try again.',
        no_user: 'Unable to retrieve user information. Please try again.',
        no_token: 'Authentication token not received. Please try again.',
        callback_failed: 'Failed to complete authentication. Please try again.',
      };
      setErrors({ general: errorMessages[error] || 'Authentication failed. Please try again.' });
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the page user was trying to access, or dashboard by default
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      // Redirect to the page user was trying to access, or dashboard by default
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className="page login-page">
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Logo size="large" showText={false} />
        </div>
        <h2>🏟️ Stadium Entrance</h2>
        <p className="page-description">Login to access your task management dashboard</p>
        
        {errors.general && (
          <div className="error-banner">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button 
          type="button" 
          className="btn btn-google" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 9.2C17 8.6 16.95 8.05 16.85 7.5H9V10.7H13.4C13.2 11.7 12.65 12.55 11.85 13.1V15.1H14.55C16.05 13.7 17 11.65 17 9.2Z" fill="#4285F4"/>
            <path d="M9 17C11.15 17 12.95 16.3 14.55 15.1L11.85 13.1C11.15 13.6 10.2 13.9 9 13.9C6.95 13.9 5.2 12.5 4.55 10.6H1.75V12.65C3.35 15.85 5.95 17 9 17Z" fill="#34A853"/>
            <path d="M4.55 10.6C4.35 10.1 4.25 9.55 4.25 9C4.25 8.45 4.35 7.9 4.55 7.4V5.35H1.75C1.2 6.45 0.9 7.7 0.9 9C0.9 10.3 1.2 11.55 1.75 12.65L4.55 10.6Z" fill="#FBBC05"/>
            <path d="M9 4.1C10.3 4.1 11.45 4.55 12.35 5.4L14.75 3C12.95 1.35 11.15 0.5 9 0.5C5.95 0.5 3.35 1.65 1.75 4.85L4.55 6.9C5.2 5 6.95 3.6 9 3.6V4.1Z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="page-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
          <div className="install-section">
            <InstallButton variant="outline" size="medium" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
