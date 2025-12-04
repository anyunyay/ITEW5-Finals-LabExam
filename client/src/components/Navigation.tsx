import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>⚽ Sports Task Manager</h1>
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
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className={isActive('/profile')}>
                  Profile
                </Link>
              </li>
              <li className="nav-user-info">
                <span className="user-display-name">
                  👤 {user?.displayName || user?.username}
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
