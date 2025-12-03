# Authentication Context

This directory contains the authentication context and related utilities for managing user authentication state across the application.

## AuthContext

The `AuthContext` provides authentication state and methods to all components in the application.

### Usage

```tsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // Use authentication state and methods
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.displayName}!</div>;
}
```

### Available Properties and Methods

- `user`: Current user object (null if not authenticated)
- `token`: JWT authentication token (null if not authenticated)
- `isAuthenticated`: Boolean indicating if user is logged in
- `loading`: Boolean indicating if auth state is being loaded
- `login(email, password)`: Async function to log in with credentials
- `register(username, email, password)`: Async function to register a new user
- `logout()`: Function to log out and clear authentication state
- `setAuthData(token, user)`: Function to manually set auth data (useful for OAuth)

### Storage

The authentication token and user data are automatically persisted to localStorage:
- Token: `auth_token`
- User: `auth_user`

On app initialization, the context automatically loads this data from localStorage.

## ProtectedRoute

The `ProtectedRoute` component guards routes that require authentication.

### Usage

```tsx
import ProtectedRoute from './components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

If the user is not authenticated, they will be redirected to `/login`.
