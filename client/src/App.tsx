import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { useTask } from './context/TaskContext';
import Navigation from './components/Navigation';
import ConnectionStatus from './components/ConnectionStatus';
import OfflineIndicator from './components/OfflineIndicator';
import OfflineSyncIndicator from './components/OfflineSyncIndicator';
import SyncDebugPanel from './components/SyncDebugPanel';
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
        <SyncDebugPanel />
        <ServiceWorkerUpdate />
        <InstallPrompt />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LoginPage />} />
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
