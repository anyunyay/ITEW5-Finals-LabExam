import React from 'react';
import './OfflineIndicator.css';

interface OfflineIndicatorProps {
  isOnline: boolean;
  isUsingCachedData: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline, isUsingCachedData }) => {
  if (isOnline && !isUsingCachedData) {
    return null; // Don't show anything when online and using live data
  }

  return (
    <div className={`offline-indicator ${!isOnline ? 'offline' : 'cached'}`}>
      <div className="indicator-icon">
        {!isOnline ? '📡' : '💾'}
      </div>
      <div className="indicator-text">
        <strong>{!isOnline ? 'Offline Mode' : 'Cached Data'}</strong>
        <span>
          {!isOnline 
            ? 'You are viewing cached content. Changes will sync when online.' 
            : 'Viewing cached data from your last session.'}
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
