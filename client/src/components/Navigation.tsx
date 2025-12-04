import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Check if a route is active, including nested routes
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      // Dashboard is active for /dashboard and /tasks/:id routes
      return location.pathname === path || location.pathname.startsWith('/tasks/') ? 'active' : '';
    }
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to={isAuthenticated ? "/dashboard" : "/"}>
            <h1>⚽ Sports Task Manager</h1>
          </Link>
        </div>
        <ul className="nav-links">
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/login" className={isActive('/login')}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className={isActive('/register')}>
                  Register
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/dashboard" className={isActive('/dashboard')}>
                  🏠 Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className={isActive('/profile')}>
                  👤 Profile
                </Link>
              </li>
              <li className="nav-user-info">
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
