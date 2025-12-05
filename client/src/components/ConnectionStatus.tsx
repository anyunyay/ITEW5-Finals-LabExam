import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  const { token, isAuthenticated } = useAuth();
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [showReconnectButton, setShowReconnectButton] = useState(false);

  useEffect(() => {
    // Show reconnect button after 5 seconds of being disconnected
    if (!isConnected && isAuthenticated) {
      const timer = setTimeout(() => {
        setShowReconnectButton(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowReconnectButton(false);
    }
  }, [isConnected, isAuthenticated]);

  useEffect(() => {
    // Update reconnect attempts
    if (!isConnected && isAuthenticated) {
      const info = socketService.getConnectionInfo();
      setReconnectAttempts(info.attempts);
    }
  }, [isConnected, isAuthenticated]);

  const handleManualReconnect = () => {
    if (token) {
      console.log('Manual reconnect triggered by user');
      socketService.reconnectWithToken(token);
      setShowReconnectButton(false);
    }
  };

  // Don't show banner if user is not authenticated or if connected
  if (!isAuthenticated || isConnected) {
    return null;
  }

  return (
    <div className="connection-status offline">
      <div className="status-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2L2 10L10 18L18 10L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="14" r="0.5" fill="currentColor" />
        </svg>
      </div>
      <div className="status-text">
        <strong>Connection Lost</strong>
        <span>
          {reconnectAttempts > 0 
            ? `Attempting to reconnect... (${reconnectAttempts}/5)`
            : 'Attempting to reconnect...'}
        </span>
      </div>
      {showReconnectButton && (
        <button 
          className="reconnect-button"
          onClick={handleManualReconnect}
          title="Click to manually reconnect"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C9.5 3 10.8 3.7 11.6 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M11 3V5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Reconnect</span>
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
