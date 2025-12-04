import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { useTask } from './context/TaskContext';
import { useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import ConnectionStatus from './components/ConnectionStatus';
import OfflineIndicator from './components/OfflineIndicator';
import OfflineSyncIndicator from './components/OfflineSyncIndicator';
// import SyncDebugPanel from './components/SyncDebugPanel';
import ServiceWorkerUpdate from './components/ServiceWorkerUpdate';
import InstallPrompt from './components/InstallPrompt';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import TaskDetailPage from './pages/TaskDetailPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

// Component to handle root route redirect based on auth status
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function AppContent() {
  const { socketConnected, isOnline, isUsingCachedData, queuedOperationsCount, isSyncing, syncError } = useTask();

  return (
    <Router>
      <div className="app">
        <Navigation />
        <ConnectionStatus isConnected={socketConnected} />
        <OfflineIndicator isOnline={isOnline} isUsingCachedData={isUsingCachedData} />
        <OfflineSyncIndicator 
          queueCount={queuedOperationsCount} 
          isSyncing={isSyncing} 
          syncError={syncError} 
        />
        {/* <SyncDebugPanel /> */}
        <ServiceWorkerUpdate />
        <InstallPrompt />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <ProtectedRoute>
                  <TaskDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
