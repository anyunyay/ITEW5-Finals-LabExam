import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import InstallButton from '../components/InstallButton';
import './ProfilePage.css';

// SVG Icon Components
const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 6L10 11L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IdIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="7" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 8H15M12 10H15M12 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="2" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 15H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const VersionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6V10L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 2H4C3.44772 2 3 2.44772 3 3V17C3 17.5523 3.44772 18 4 18H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 15L17 10L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TasksIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 9L9 11L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 2V6M13 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9C6 9 5 9 5 8C5 7 5 5 5 5H3C3 5 2 5 2 6C2 7 3 9 5 9H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 9C14 9 15 9 15 8C15 7 15 5 15 5H17C17 5 18 5 18 6C18 7 17 9 15 9H14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 9C6 12 8 14 10 14C12 14 14 12 14 9V3H6V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 18H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 14V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6V10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function ProfilePage() {
  const { user, logout } = useAuth();
  const { tasks } = useTask();
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

  // Calculate activity statistics
  const taskList = Array.isArray(tasks) ? tasks : [];
  const totalTasks = taskList.length;
  const completedTasks = taskList.filter(t => t.status === 'completed').length;
  const inProgressTasks = taskList.filter(t => t.status === 'in-progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get member since date (using user creation date or fallback)
  const getMemberSince = () => {
    // This would ideally come from user.createdAt
    // For now, we'll use a placeholder
    return 'January 2024';
  };

  return (
    <div className="page profile-page">
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-title">
            <h2>Account Settings</h2>
            <p className="page-description">Manage your profile and application preferences</p>
          </div>
        </div>

        {/* Profile Overview Card */}
        <div className="profile-overview-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.displayName} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {user?.displayName ? getInitials(user.displayName) : '??'}
                </div>
              )}
            </div>
            <div className="profile-user-info">
              <h3 className="profile-display-name">{user?.displayName || 'Unknown User'}</h3>
              <p className="profile-username-text">@{user?.username || 'unknown'}</p>
              <div className="profile-member-since">
                <CalendarIcon />
                <span>Member since {getMemberSince()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary Section */}
        <div className="profile-section">
          <h3 className="profile-section-title">Activity Summary</h3>
          <div className="activity-stats-grid">
            <div className="activity-stat-card">
              <div className="activity-stat-icon">
                <TasksIcon />
              </div>
              <div className="activity-stat-content">
                <div className="activity-stat-value">{totalTasks}</div>
                <div className="activity-stat-label">Total Tasks</div>
              </div>
            </div>

            <div className="activity-stat-card">
              <div className="activity-stat-icon stat-icon-success">
                <TrophyIcon />
              </div>
              <div className="activity-stat-content">
                <div className="activity-stat-value">{completedTasks}</div>
                <div className="activity-stat-label">Completed</div>
              </div>
            </div>

            <div className="activity-stat-card">
              <div className="activity-stat-icon stat-icon-warning">
                <ClockIcon />
              </div>
              <div className="activity-stat-content">
                <div className="activity-stat-value">{inProgressTasks}</div>
                <div className="activity-stat-label">In Progress</div>
              </div>
            </div>

            <div className="activity-stat-card">
              <div className="activity-stat-icon stat-icon-info">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 10L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="10" cy="7" r="0.5" fill="currentColor" />
                </svg>
              </div>
              <div className="activity-stat-content">
                <div className="activity-stat-value">{completionRate}%</div>
                <div className="activity-stat-label">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="profile-section">
          <h3 className="profile-section-title">Account Information</h3>
          <div className="profile-info-grid">
            <div className="profile-info-card">
              <div className="info-card-icon">
                <EmailIcon />
              </div>
              <div className="info-card-content">
                <div className="info-card-label">Email Address</div>
                <div className="info-card-value">{user?.email || 'Not provided'}</div>
              </div>
            </div>

            <div className="profile-info-card">
              <div className="info-card-icon">
                <IdIcon />
              </div>
              <div className="info-card-content">
                <div className="info-card-label">User ID</div>
                <div className="info-card-value">{user?.id?.slice(0, 8) || 'N/A'}...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Settings Section */}
        <div className="profile-section">
          <h3 className="profile-section-title">Application Settings</h3>
          <div className="profile-settings-list">
            <div className="profile-setting-item">
              <div className="setting-item-left">
                <div className="setting-item-icon">
                  <PhoneIcon />
                </div>
                <div className="setting-item-info">
                  <div className="setting-item-title">Progressive Web App</div>
                  <div className="setting-item-description">
                    {isPWAInstalled 
                      ? 'App is installed on your device' 
                      : 'Install app for offline access'}
                  </div>
                </div>
              </div>
              <div className="setting-item-right">
                {isPWAInstalled ? (
                  <span className="setting-status-badge status-success">
                    <CheckIcon />
                    <span>Installed</span>
                  </span>
                ) : (
                  <InstallButton variant="secondary" size="small" />
                )}
              </div>
            </div>

            <div className="profile-setting-item">
              <div className="setting-item-left">
                <div className="setting-item-icon">
                  <VersionIcon />
                </div>
                <div className="setting-item-info">
                  <div className="setting-item-title">App Version</div>
                  <div className="setting-item-description">Current application version</div>
                </div>
              </div>
              <div className="setting-item-right">
                <span className="setting-version-text">v{appVersion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="profile-actions">
          <button className="profile-logout-btn" onClick={handleLogout}>
            <LogoutIcon />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
