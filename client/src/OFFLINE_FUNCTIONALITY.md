# Offline Functionality Documentation

## Overview

The Sports PWA Task Manager implements comprehensive offline functionality that allows users to view and interact with their tasks even when they lose network connectivity. This document explains how the offline features work and how they're implemented.

## Features

### 1. Online/Offline Detection

The application automatically detects when the user's network connection is lost or restored:

- **Online Event Listener**: Detects when connectivity is restored
- **Offline Event Listener**: Detects when connectivity is lost
- **Automatic Sync**: When connection is restored, the app automatically refetches tasks from the server

### 2. Cached Content Serving

Tasks are cached in two ways:

#### localStorage Cache
- All tasks are saved to `localStorage` after successful fetch/create/update/delete operations
- Cache key: `sports_pwa_tasks_cache`
- Includes timestamp for cache management
- Automatically loaded when offline or when network requests fail

#### Service Worker Cache
- API responses are cached using Workbox's NetworkFirst strategy
- Cache timeout: 10 seconds
- Cache expiration: 5 minutes
- Maximum 50 cached entries

### 3. Visual Indicators

#### OfflineIndicator Component
Located at the bottom-right of the screen, this component shows:

- **Offline Mode**: Yellow banner with 📡 icon
  - Displayed when `navigator.onLine` is false
  - Message: "You are viewing cached content. Changes will sync when online."

- **Cached Data Mode**: Gray banner with 💾 icon
  - Displayed when using cached data due to network errors
  - Message: "Viewing cached data from your last session."

#### ConnectionStatus Component
Located at the top of the screen, this component shows:

- **Connection Lost**: Red banner with ⚠️ icon
  - Displayed when WebSocket connection is lost
  - Message: "Connection Lost - Attempting to reconnect..."

## Implementation Details

### TaskContext Updates

The `TaskContext` has been enhanced with:

```typescript
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
  isOnline: boolean;           // NEW: Network connectivity status
  isUsingCachedData: boolean;  // NEW: Whether displaying cached data
}
```

### Offline Behavior

#### When Going Offline
1. `window.offline` event is triggered
2. `isOnline` state is set to `false`
3. OfflineIndicator appears at bottom-right

#### When Fetching Tasks Offline
1. Check `navigator.onLine` status
2. If offline, load tasks from localStorage cache
3. Set `isUsingCachedData` to `true`
4. Display cached data with indicator

#### When Coming Back Online
1. `window.online` event is triggered
2. `isOnline` state is set to `true`
3. Automatically refetch tasks from server
4. Update localStorage cache with fresh data
5. Hide offline indicators

### Cache Management

#### Saving to Cache
```typescript
const saveTasksToCache = (tasks: Task[]) => {
  localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify({
    tasks,
    timestamp: Date.now(),
  }));
};
```

#### Loading from Cache
```typescript
const loadTasksFromCache = (): Task[] | null => {
  const cached = localStorage.getItem(TASKS_CACHE_KEY);
  if (cached) {
    const { tasks } = JSON.parse(cached);
    return tasks;
  }
  return null;
};
```

#### Cache Updates
Cache is updated after every successful operation:
- ✅ Fetch tasks
- ✅ Create task
- ✅ Update task
- ✅ Delete task

### Fallback Strategy

The app uses a multi-level fallback strategy:

1. **Primary**: Fetch from server (when online)
2. **Fallback 1**: Service Worker cache (NetworkFirst strategy)
3. **Fallback 2**: localStorage cache
4. **Final**: Error message if no cache available

## User Experience

### Scenario 1: User Goes Offline
1. User is browsing tasks
2. Network connection is lost
3. Yellow "Offline Mode" indicator appears at bottom-right
4. User can still view all previously loaded tasks
5. Tasks are served from localStorage cache

### Scenario 2: User Starts App Offline
1. User opens app without internet connection
2. App attempts to fetch tasks
3. Detects offline status immediately
4. Loads tasks from localStorage cache
5. Shows "Offline Mode" indicator

### Scenario 3: Network Error with Cache Fallback
1. User is online but server is unreachable
2. Fetch request fails
3. App automatically loads from localStorage cache
4. Shows gray "Cached Data" indicator
5. Error message: "Using cached data. [error details]"

### Scenario 4: Connection Restored
1. User's connection is restored
2. Green checkmark animation (brief)
3. App automatically refetches tasks
4. Cache is updated with fresh data
5. Indicators disappear

## Testing Offline Functionality

### Chrome DevTools
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Observe offline indicators appear
5. Verify cached tasks are displayed

### Manual Testing
1. Load the app and log in
2. Create some tasks
3. Disconnect from internet (turn off WiFi)
4. Refresh the page
5. Verify tasks are still visible
6. Verify offline indicator is shown
7. Reconnect to internet
8. Verify indicator disappears and data syncs

## Future Enhancements

The following features are planned for task 22:

- **Offline Operation Queueing**: Queue create/update/delete operations when offline
- **Background Sync**: Automatically sync queued operations when connection is restored
- **Conflict Resolution**: Handle conflicts when multiple clients modify the same task
- **Sync Status Indicator**: Show progress of background synchronization

## Technical Notes

### Browser Support
- Online/offline events: All modern browsers
- localStorage: All modern browsers
- Service Workers: Chrome 40+, Firefox 44+, Safari 11.1+, Edge 17+

### Storage Limits
- localStorage: ~5-10MB per origin
- Service Worker cache: Varies by browser, typically 50MB+

### Cache Invalidation
- localStorage cache: Never expires (manual clear only)
- Service Worker cache: 5 minutes expiration
- Cache is updated on every successful server response

## Related Files

- `client/src/context/TaskContext.tsx` - Main offline logic
- `client/src/components/OfflineIndicator.tsx` - Offline UI component
- `client/src/components/OfflineIndicator.css` - Offline UI styles
- `client/vite.config.js` - Service Worker configuration
- `client/src/serviceWorkerRegistration.ts` - SW registration
