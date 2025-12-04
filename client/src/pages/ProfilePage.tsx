import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ProfilePage.css';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const appVersion = '1.0.0';

  useEffect(() => {
    // Check if app is running in standalone mode (installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsPWAInstalled(isStandalone || isIOSStandalone);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="page profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>👤 Player Profile</h2>
          <p className="page-description">Your account information and settings</p>
        </div>

        <div className="player-card">
          <div className="player-card-header">
            <div className="team-stripe"></div>
            <div className="card-badge">PLAYER</div>
          </div>

          <div className="player-card-body">
            <div className="player-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.displayName} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.displayName ? getInitials(user.displayName) : '??'}
                </div>
              )}
            </div>

            <div className="player-info">
              <h3 className="player-name">{user?.displayName || 'Unknown Player'}</h3>
              <div className="player-username">@{user?.username || 'unknown'}</div>
            </div>

            <div className="player-details">
              <div className="detail-row">
                <div className="detail-icon">📧</div>
                <div className="detail-content">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{user?.email || 'N/A'}</div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon">🆔</div>
                <div className="detail-content">
                  <div className="detail-label">Player ID</div>
                  <div className="detail-value">{user?.id || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="player-card-footer">
            <div className="card-number">#{user?.id?.slice(-6) || '000000'}</div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">⚙️ App Settings</h3>

          <div className="settings-card">
            <div className="setting-item">
              <div className="setting-icon">📱</div>
              <div className="setting-content">
                <div className="setting-label">PWA Installation Status</div>
                <div className="setting-value">
                  {isPWAInstalled ? (
                    <span className="status-badge status-installed">
                      ✓ Installed
                    </span>
                  ) : (
                    <span className="status-badge status-not-installed">
                      ✗ Not Installed
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-icon">🏷️</div>
              <div className="setting-content">
                <div className="setting-label">App Version</div>
                <div className="setting-value">v{appVersion}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="actions-section">
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
