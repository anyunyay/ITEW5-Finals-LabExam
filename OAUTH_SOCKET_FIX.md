# OAuth Socket Connection Fix

## Problem
After successfully logging in with Google OAuth, the app showed a "not connected" state because the Socket.io connection wasn't being initialized properly.

## Root Causes Identified

1. **Race Condition**: Auth state was updating, but socket connection was attempting to initialize before the state fully settled
2. **Timing Issue**: Navigation to dashboard happened too quickly after setting auth data
3. **Lack of Logging**: Difficult to debug the authentication and socket connection flow

## Fixes Applied

### 1. AuthContext Improvements (`client/src/context/AuthContext.tsx`)

**Added comprehensive logging**:
- Log when auth data is being set
- Log when auth data is loaded from localStorage
- Log success/failure of auth operations

**Benefits**:
- Easy to track authentication flow in browser console
- Identify where auth state changes occur
- Debug OAuth callback issues

### 2. AuthCallbackPage Enhancement (`client/src/pages/AuthCallbackPage.tsx`)

**Added delay before navigation**:
```typescript
// Small delay to ensure auth state is fully updated before navigation
setTimeout(() => {
  console.log('✅ OAuth callback: Navigating to dashboard');
  navigate('/dashboard', { replace: true });
}, 200);
```

**Benefits**:
- Ensures auth state is fully propagated before navigation
- Gives React time to update all contexts
- Prevents race conditions with socket initialization

### 3. TaskContext Socket Connection (`client/src/context/TaskContext.tsx`)

**Added delay for socket connection**:
```typescript
if (isAuthenticated && token) {
  console.log('🔌 TaskContext: Initializing socket connection with token');
  // Small delay to ensure auth state is fully settled
  const timer = setTimeout(() => {
    socketService.connect(token);
  }, 100);
  return () => clearTimeout(timer);
}
```

**Benefits**:
- Ensures token is available before attempting connection
- Prevents connection attempts with stale/undefined tokens
- Proper cleanup with timer clearance

## How It Works Now

### OAuth Login Flow

1. **User clicks "Continue with Google"**
   ```
   LoginPage → Redirects to backend OAuth endpoint
   ```

2. **Google Authentication**
   ```
   Backend handles OAuth → Redirects to /auth/callback?token=...
   ```

3. **AuthCallbackPage Processing**
   ```
   - Extracts token from URL
   - Fetches user data from /api/auth/me
   - Calls setAuthData(token, user)
   - Logs: "✅ OAuth callback: User data received"
   - Waits 200ms
   - Navigates to /dashboard
   ```

4. **AuthContext Updates**
   ```
   - Stores token in localStorage
   - Stores user in localStorage
   - Updates auth state
   - Logs: "✅ AuthContext: Auth data set successfully"
   ```

5. **TaskContext Responds**
   ```
   - Detects isAuthenticated && token
   - Logs: "🔌 TaskContext: Initializing socket connection"
   - Waits 100ms
   - Calls socketService.connect(token)
   ```

6. **Socket Connection**
   ```
   - Socket.io connects to backend with JWT
   - Backend verifies token
   - Socket joins user room
   - Logs: "✅ Socket connected: [socket-id]"
   - Connection status updates to "connected"
   ```

## Debugging Guide

### Check Browser Console

After OAuth login, you should see this sequence:

```
✅ OAuth callback: User data received {user: {...}}
🔐 AuthContext: Setting auth data {userId: "...", username: "..."}
✅ AuthContext: Auth data set successfully
✅ OAuth callback: Navigating to dashboard
🔌 TaskContext: Initializing socket connection with token
✅ Socket connected: [socket-id]
```

### If Socket Doesn't Connect

1. **Check if backend is running**:
   ```bash
   # Should show server on port 5000
   netstat -ano | findstr :5000
   ```

2. **Check token in localStorage**:
   ```javascript
   // In browser console
   localStorage.getItem('auth_token')
   ```

3. **Check auth state**:
   ```javascript
   // Should show user and token
   console.log('Auth:', {
     token: localStorage.getItem('auth_token'),
     user: JSON.parse(localStorage.getItem('auth_user'))
   })
   ```

4. **Check socket connection status**:
   - Look for "Connection Lost" banner
   - Check Network tab for WebSocket connection
   - Look for socket errors in console

### Common Issues

**Issue**: "Connection Lost" still showing after OAuth login
**Solution**: 
- Check if backend server is running
- Verify token is valid (not expired)
- Check browser console for socket errors

**Issue**: Socket connects but disconnects immediately
**Solution**:
- Backend might be rejecting the token
- Check server logs for authentication errors
- Verify JWT_SECRET matches between client and server

**Issue**: OAuth callback shows error
**Solution**:
- Check URL parameters for error codes
- Verify Google OAuth credentials are correct
- Check backend OAuth configuration

## Testing

### Manual Test Steps

1. **Start servers**:
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Navigate to login page**: http://localhost:5173/login

4. **Click "Continue with Google"**

5. **Complete Google authentication**

6. **Watch console logs**:
   - Should see OAuth callback logs
   - Should see auth data being set
   - Should see socket connection logs
   - Should NOT see "Connection Lost" banner

7. **Verify real-time updates**:
   - Open app in second tab
   - Create a task in one tab
   - Should appear in other tab immediately

### Expected Results

✅ OAuth login completes successfully
✅ User is redirected to dashboard
✅ Socket connects within 1 second
✅ No "Connection Lost" message
✅ Real-time updates work immediately
✅ Connection persists across page navigation

## Additional Improvements

### Future Enhancements

1. **Token Refresh**: Implement automatic token refresh before expiration
2. **Retry Logic**: Add exponential backoff for failed socket connections
3. **Connection Health Check**: Periodic ping/pong to verify connection
4. **Offline Queue**: Queue socket events when offline, replay when reconnected

### Performance Considerations

- Delays are minimal (100-200ms) and don't impact UX
- Socket connection is reused across navigation
- Event listeners are properly cleaned up to prevent memory leaks
