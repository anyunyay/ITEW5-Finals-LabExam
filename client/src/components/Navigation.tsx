import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import './Navigation.css';

// SVG Icon Components
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 17C4 14 6.5 12 10 12C13.5 12 16 14 16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LoginIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 3H4C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 14L17 10L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const RegisterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 7V13M7 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function Navigation() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Check if a route is active, including nested routes
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path || location.pathname.startsWith('/tasks/') ? 'active' : '';
    }
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to={isAuthenticated ? "/dashboard" : "/"}>
            <Logo size="small" showText={true} />
          </Link>
        </div>
        <ul className="nav-links">
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/login" className={isActive('/login')}>
                  <LoginIcon />
                  <span>Login</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className={isActive('/register')}>
                  <RegisterIcon />
                  <span>Register</span>
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/dashboard" className={isActive('/dashboard')}>
                  <DashboardIcon />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className={isActive('/profile')}>
                  <ProfileIcon />
                  <span>Profile</span>
                </Link>
              </li>
              <li className="nav-user-info">
                <div className="user-avatar">
                  {(user?.displayName || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="user-display-name">
                  {user?.displayName || user?.username}
                </span>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
